import pool from "@/lib/db";
import { aggregatePolishVacancies } from "@/lib/vacancy-scraper";
import { validateVacanciesWithGemini } from "@/lib/gemini-classifier";
import { pushContactToCampaign, createReplySequence } from "@/lib/reply";

export interface OutboundEngineConfig {
    id: number;
    name: string;
    target_role: string;
    role_description: string;
    scrape_keywords: string[];
    scrape_location: string;
    target_titles: string[];
    target_industries: string[];
    employee_ranges: string[];
    leads_per_run: number;
    reply_campaign_id?: number | null;
    reply_campaign_name?: string | null;
    email_subject?: string | null;
    email_body?: string | null;
    status: "active" | "paused" | "archived";
    frequency: "manual" | "hourly" | "daily" | "weekly";
    last_run_at?: string | null;
    next_run_at?: string | null;
    stats?: {
        totalScraped: number;
        aiApproved: number;
        aiRejected: number;
        leadsFound: number;
        pushedToReply: number;
    };
    created_at?: string;
    updated_at?: string;
}

export interface EngineRunStepLog {
    step: string;
    timestamp: string;
    status: "info" | "success" | "warning" | "error";
    message: string;
    meta?: any;
}

/**
 * Executes a complete autonomous end-to-end run of an Outbound Engine:
 * Step 1: Scrapes online job portals (NFJ, RemoteOK, Remotive, WWR, Jobicy)
 * Step 2: Uses Gemini AI to filter & disqualify irrelevant job posts
 * Step 3: Extracts qualified hiring companies and searches Apollo for decision makers
 * Step 4: Enriches verified leads and saves them into CRM (`leads` table)
 * Step 5: Automatically enrolls new leads into the configured Reply.io campaign
 */
export async function executeEngineWorkflow(engineId: number): Promise<{
    success: boolean;
    runId: number;
    scrapedCount: number;
    approvedCount: number;
    rejectedCount: number;
    leadsCount: number;
    pushedCount: number;
    logs: EngineRunStepLog[];
    error?: string;
}> {
    const logs: EngineRunStepLog[] = [];
    const addLog = (step: string, status: EngineRunStepLog["status"], message: string, meta?: any) => {
        logs.push({
            step,
            timestamp: new Date().toISOString(),
            status,
            message,
            meta,
        });
    };

    const client = await pool.connect();
    let runId: number = 0;

    try {
        // Fetch engine settings
        const engRes = await client.query(`SELECT * FROM outbound_engines WHERE id = $1`, [engineId]);
        if (engRes.rows.length === 0) {
            throw new Error(`Engine with ID ${engineId} not found`);
        }
        const engine: OutboundEngineConfig = engRes.rows[0];

        // Create engine run record
        const runRes = await client.query(
            `INSERT INTO engine_runs (engine_id, status, started_at) VALUES ($1, 'running', NOW()) RETURNING id`,
            [engineId]
        );
        runId = runRes.rows[0].id;

        addLog("Init", "info", `Started Engine run for "${engine.name}". Target: "${engine.target_role}"`);

        // STEP 1: Multi-portal Scraping
        const searchKeywords = engine.scrape_keywords?.length > 0 ? engine.scrape_keywords : [engine.target_role];
        let allScrapedJobs: any[] = [];

        addLog("Scraping", "info", `Scraping portals for keywords: ${searchKeywords.join(", ")}`);
        for (const kw of searchKeywords) {
            const jobs = await aggregatePolishVacancies(kw);
            allScrapedJobs.push(...jobs);
        }

        // Deduplicate locally
        const uniqueJobsMap = new Map<string, any>();
        for (const j of allScrapedJobs) {
            if (!uniqueJobsMap.has(j.canonicalKey)) {
                uniqueJobsMap.set(j.canonicalKey, j);
            }
        }
        const rawVacancies = Array.from(uniqueJobsMap.values());
        addLog("Scraping", "success", `Scraped ${rawVacancies.length} vacancies across connected portals`, {
            count: rawVacancies.length,
        });

        if (rawVacancies.length === 0) {
            addLog("Scraping", "warning", "No vacancies discovered during scraping pass.");
        }

        // STEP 2: Gemini AI Job Relevance Qualification
        addLog("Gemini AI", "info", `Evaluating ${rawVacancies.length} vacancies against role description with Gemini 3.8 Flash...`);
        const aiEvaluations = await validateVacanciesWithGemini({
            targetRole: engine.target_role,
            roleDescription: engine.role_description,
            vacancies: rawVacancies,
        });

        const approvedVacancies: any[] = [];
        const rejectedVacancies: any[] = [];

        aiEvaluations.forEach((evalResult, idx) => {
            const vac = rawVacancies[idx];
            if (evalResult.isRelevant) {
                approvedVacancies.push({ ...vac, aiReason: evalResult.reason });
            } else {
                rejectedVacancies.push({ ...vac, aiReason: evalResult.reason });
            }
        });

        addLog(
            "Gemini AI",
            "success",
            `AI Qualification complete: ${approvedVacancies.length} approved, ${rejectedVacancies.length} rejected as irrelevant (false positives filtered out).`
        );

        // STEP 3: Company Extraction & Apollo Sourcing
        // Clean Polish/Global legal suffixes (Sp. z o.o., S.A., LLC, Ltd, Inc) so Apollo matches them reliably
        const cleanCompanyName = (raw: string) => {
            return raw
                .replace(/\b(sp\.\s*z\s*o\.o\.|spółka\s*z\s*o\.o\.|sp\.\s*k\.|s\.a\.|llc|ltd|inc|gmbh|co\.)/gi, "")
                .replace(/[,\(\)]/g, " ")
                .trim();
        };

        const targetCompanies = Array.from(
            new Set(
                approvedVacancies
                    .map((v) => cleanCompanyName(v.companyName))
                    .filter((c) => c && c.length >= 2)
            )
        ).slice(0, 15);

        addLog("Apollo", "info", `Identified ${targetCompanies.length} hiring companies. Searching Apollo for decision makers...`, {
            companies: targetCompanies,
        });

        const apolloApiKey = process.env.APOLLO_KEY || process.env.APOLLO_API_KEY || "";
        const targetTitles = engine.target_titles?.length > 0 
            ? engine.target_titles 
            : ["CTO", "VP of Engineering", "Head of AI", "Head of Engineering", "Engineering Director", "Engineering Manager", "Technical Lead", "Founder", "CEO"];

        const apolloHeaders: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (apolloApiKey) {
            apolloHeaders["X-Api-Key"] = apolloApiKey;
        }

        const maxLeadsGoal = Math.min(engine.leads_per_run || 25, 50);
        let apolloPeopleIds: string[] = [];

        // Query Apollo per qualified hiring company to guarantee high-relevance leads
        for (const company of targetCompanies) {
            if (apolloPeopleIds.length >= maxLeadsGoal) break;

            const singleCompanyPayload: any = {
                page: 1,
                per_page: 8,
                q_organization_name: company,
                person_titles: targetTitles,
            };

            // Only apply employee range filter if provided, avoiding overly restrictive zero-match tags
            if (engine.employee_ranges?.length > 0) {
                singleCompanyPayload.organization_num_employees_ranges = engine.employee_ranges;
            }

            try {
                const searchRes = await fetch("https://api.apollo.io/v1/mixed_people/api_search", {
                    method: "POST",
                    headers: apolloHeaders,
                    body: JSON.stringify(singleCompanyPayload),
                });

                if (searchRes.ok) {
                    const data = await searchRes.json();
                    const ids = (data.people || []).map((p: any) => p.id).filter(Boolean);
                    apolloPeopleIds.push(...ids);
                }
            } catch (singleErr: any) {
                console.warn(`Apollo search for "${company}" failed:`, singleErr.message);
            }
        }

        // Deduplicate person IDs
        apolloPeopleIds = Array.from(new Set(apolloPeopleIds)).slice(0, maxLeadsGoal);

        // Enrich contacts via people/bulk_match
        let enrichedContacts: any[] = [];
        if (apolloPeopleIds.length > 0 && apolloApiKey) {
            try {
                const bulkRes = await fetch("https://api.apollo.io/v1/people/bulk_match", {
                    method: "POST",
                    headers: apolloHeaders,
                    body: JSON.stringify({
                        details: apolloPeopleIds.map((id) => ({ id })),
                    }),
                });
                if (bulkRes.ok) {
                    const bulkData = await bulkRes.json();
                    enrichedContacts = (bulkData.matches || []).filter((m: any) => m && m.email);
                }
            } catch (bulkErr: any) {
                addLog("Apollo", "warning", `Apollo bulk match failed: ${bulkErr.message}`);
            }
        }

        addLog("Apollo", "success", `Enriched ${enrichedContacts.length} verified contacts from hiring companies`);

        // STEP 4: Lead Deduplication & Database Persistence
        let newLeadsInserted = 0;
        const validLeadsToPush: Array<{
            email: string;
            firstName: string;
            lastName: string;
            company: string;
            title: string;
        }> = [];

        for (const p of enrichedContacts) {
            const email = (p.email || "").trim().toLowerCase();
            if (!email) continue;

            const fullName = p.name || [p.first_name, p.last_name].filter(Boolean).join(" ") || "Prospect";
            const firstName = p.first_name || fullName.split(" ")[0] || "";
            const lastName = p.last_name || fullName.split(" ").slice(1).join(" ") || "";
            const title = (p.title || "").trim();
            const org = p.organization || {};
            const companyName = (org.name || "").trim();
            const leadId = `engine_${engine.id}_${p.id || Date.now()}`;

            // Check if lead already exists in CRM
            const checkLead = await client.query(`SELECT id, campaign, channels FROM leads WHERE LOWER(email) = $1 LIMIT 1`, [email]);
            if (checkLead.rows.length === 0) {
                // Brand new lead -> insert
                await client.query(
                    `INSERT INTO leads (
                        id, contact_name, title, email, company_name,
                        company_domain_name, location, campaign, lead_status,
                        lifecycle_stage, email_status, sync_status, channels, timeline, created_at, updated_at
                    ) VALUES (
                        $1, $2, $3, $4, $5,
                        $6, $7, $8, 'NEW',
                        'lead', 'verified', 'synced',
                        $9::jsonb, $10::jsonb, NOW(), NOW()
                    )`,
                    [
                        leadId,
                        fullName,
                        title,
                        email,
                        companyName,
                        org.primary_domain || "",
                        p.city || org.country || "Poland",
                        `Engine: ${engine.name}`,
                        JSON.stringify({
                            reply: { active: Boolean(engine.reply_campaign_id), statusText: "Enrolled via Engine" },
                            apollo: { active: true, statusText: "Sourced via Engine" },
                        }),
                        JSON.stringify([
                            {
                                date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                                channel: "Engine",
                                event: `Automated Engine Lead: Sourced for hiring vacancy in ${companyName}`,
                            },
                        ]),
                    ]
                );
                newLeadsInserted++;
                validLeadsToPush.push({
                    email,
                    firstName,
                    lastName,
                    company: companyName,
                    title,
                });
            } else {
                // Already in CRM -> update campaign tag if not already enrolled
                const existing = checkLead.rows[0];
                const channels = existing.channels || {};
                if (!channels.reply?.active && engine.reply_campaign_id) {
                    validLeadsToPush.push({
                        email,
                        firstName,
                        lastName,
                        company: companyName,
                        title,
                    });
                }
            }
        }

        addLog("CRM", "success", `Saved ${newLeadsInserted} new leads to CRM database (deduplicated against existing contacts)`);

        // STEP 5: Push into Reply.io Sequence
        let pushedToReplyCount = 0;
        let activeCampaignId = engine.reply_campaign_id;

        // If no campaign selected but email body provided, create one on the fly
        if (!activeCampaignId && engine.email_subject && engine.email_body) {
            try {
                addLog("Reply.io", "info", `Creating new sequence in Reply.io: "Engine - ${engine.name}"`);
                const newSeq = await createReplySequence({
                    name: `Engine - ${engine.name}`,
                    subject: engine.email_subject,
                    body: engine.email_body,
                });
                if (newSeq?.id) {
                    activeCampaignId = newSeq.id;
                    await client.query(`UPDATE outbound_engines SET reply_campaign_id = $1, reply_campaign_name = $2 WHERE id = $3`, [
                        activeCampaignId,
                        `Engine - ${engine.name}`,
                        engine.id,
                    ]);
                    addLog("Reply.io", "success", `Created Reply.io sequence (ID: ${activeCampaignId})`);
                }
            } catch (seqErr: any) {
                addLog("Reply.io", "warning", `Could not auto-create Reply sequence: ${seqErr.message}`);
            }
        }

        if (activeCampaignId && validLeadsToPush.length > 0) {
            addLog("Reply.io", "info", `Enrolling ${validLeadsToPush.length} contacts into Reply Campaign #${activeCampaignId}...`);
            for (const lead of validLeadsToPush) {
                try {
                    await pushContactToCampaign({
                        campaignId: Number(activeCampaignId),
                        email: lead.email,
                        firstName: lead.firstName,
                        lastName: lead.lastName,
                        company: lead.company,
                        title: lead.title,
                    });
                    pushedToReplyCount++;
                } catch (pushErr: any) {
                    console.warn(`Failed pushing ${lead.email} to Reply:`, pushErr.message);
                }
            }
            addLog("Reply.io", "success", `Enrolled ${pushedToReplyCount} contacts into Reply.io sequence`);
        } else if (!activeCampaignId) {
            addLog("Reply.io", "info", "No Reply campaign configured. Leads saved in CRM ready for manual outreach.");
        }

        // Finalize Engine Statistics & Status
        const totalScraped = (engine.stats?.totalScraped || 0) + rawVacancies.length;
        const aiApproved = (engine.stats?.aiApproved || 0) + approvedVacancies.length;
        const aiRejected = (engine.stats?.aiRejected || 0) + rejectedVacancies.length;
        const leadsFound = (engine.stats?.leadsFound || 0) + newLeadsInserted;
        const pushedToReply = (engine.stats?.pushedToReply || 0) + pushedToReplyCount;

        await client.query(
            `UPDATE outbound_engines
             SET last_run_at = NOW(),
                 stats = $1::jsonb,
                 updated_at = NOW()
             WHERE id = $2`,
            [
                JSON.stringify({
                    totalScraped,
                    aiApproved,
                    aiRejected,
                    leadsFound,
                    pushedToReply,
                }),
                engineId,
            ]
        );

        // Update run log
        await client.query(
            `UPDATE engine_runs
             SET status = 'completed',
                 completed_at = NOW(),
                 scraped_count = $1,
                 approved_count = $2,
                 rejected_count = $3,
                 leads_count = $4,
                 pushed_count = $5,
                 logs = $6::jsonb
             WHERE id = $7`,
            [
                rawVacancies.length,
                approvedVacancies.length,
                rejectedVacancies.length,
                newLeadsInserted,
                pushedToReplyCount,
                JSON.stringify(logs),
                runId,
            ]
        );

        return {
            success: true,
            runId,
            scrapedCount: rawVacancies.length,
            approvedCount: approvedVacancies.length,
            rejectedCount: rejectedVacancies.length,
            leadsCount: newLeadsInserted,
            pushedCount: pushedToReplyCount,
            logs,
        };
    } catch (err: any) {
        addLog("Fatal", "error", `Engine run encountered an error: ${err.message}`);
        if (runId) {
            await client.query(
                `UPDATE engine_runs
                 SET status = 'failed',
                     completed_at = NOW(),
                     logs = $1::jsonb,
                     error_message = $2
                 WHERE id = $3`,
                [JSON.stringify(logs), err.message, runId]
            );
        }
        return {
            success: false,
            runId,
            scrapedCount: 0,
            approvedCount: 0,
            rejectedCount: 0,
            leadsCount: 0,
            pushedCount: 0,
            logs,
            error: err.message,
        };
    } finally {
        client.release();
    }
}
