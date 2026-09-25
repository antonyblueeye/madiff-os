import pool, { initDb } from "@/lib/db";
import { getReplyApiKey } from "@/lib/reply";
import { getZohoAccessToken } from "@/lib/zoho";

export interface SyncStepResult {
    step: string;
    name: string;
    status: "success" | "warning" | "error" | "skipped";
    durationMs: number;
    details: string;
    recordsProcessed?: number;
}

export interface OrchestrationResult {
    logId: number;
    startedAt: string;
    completedAt: string;
    totalDurationMs: number;
    status: "success" | "partial" | "error";
    triggerSource: string;
    steps: SyncStepResult[];
    summary: string;
}

// Global lock to prevent overlapping runs
let isOrchestrating = false;

export async function runFullScheduledSync(triggerSource: string = "scheduler_daily_9am"): Promise<OrchestrationResult> {
    if (isOrchestrating) {
        throw new Error("A synchronized pipeline run is already in progress.");
    }

    isOrchestrating = true;
    const startedAt = new Date();
    const startTime = Date.now();
    const steps: SyncStepResult[] = [];

    await initDb();

    // 1. Initialize Log record in PostgreSQL
    const logRes = await pool.query(
        `INSERT INTO scheduled_sync_logs (started_at, status, trigger_source, steps)
         VALUES ($1, 'running', $2, '[]'::jsonb)
         RETURNING id;`,
        [startedAt, triggerSource]
    );
    const logId = logRes.rows[0].id;

    try {
        // =========================================================================
        // STEP 1: Process Pending Local CRM Edits -> Push to HubSpot
        // Logic: Push any manual bulk edits, status changes or owner reassignments
        // to HubSpot first so our cloud CRM is pristine before pulling updates.
        // =========================================================================
        const step1Start = Date.now();
        try {
            const pendingRes = await pool.query(
                `SELECT id, hubspot_id, contact_name, title, email, phone, company_name,
                        contact_owner, lead_status, lifecycle_stage, location, website_url,
                        linkedin_url, campaign, technology, role, type_of_response,
                        company_domain_name, linkedin_connection_status, linkedin_account, dirty_fields
                 FROM leads
                 WHERE sync_status = 'pending_push' AND hubspot_id IS NOT NULL
                 LIMIT 50;`
            );

            const pendingLeads = pendingRes.rows;
            let pushedCount = 0;
            const token = process.env.HUBSPOT_ACCESS_TOKEN;

            if (pendingLeads.length > 0 && token) {
                for (const lead of pendingLeads) {
                    try {
                        const props: Record<string, string> = {};
                        if (lead.contact_owner) props.hubspot_owner_id = lead.contact_owner;
                        if (lead.lead_status) props.hs_lead_status = lead.lead_status;
                        if (lead.lifecycle_stage) props.lifecyclestage = lead.lifecycle_stage;
                        if (lead.campaign) props.campaign = lead.campaign;
                        if (lead.linkedin_account) props.linkedin_account = lead.linkedin_account;
                        if (lead.linkedin_connection_status) {
                            const s = lead.linkedin_connection_status.trim().toLowerCase();
                            props.linkedin_connection_status = (s === "connected" || s === "accepted") ? "Accepted" : s === "pending" ? "Pending" : "Not connected";
                        }

                        if (Object.keys(props).length > 0) {
                            const patchRes = await fetch(
                                `https://api.hubapi.com/crm/v3/objects/contacts/${lead.hubspot_id}`,
                                {
                                    method: "PATCH",
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ properties: props }),
                                }
                            );
                            if (patchRes.ok) {
                                await pool.query(
                                    `UPDATE leads SET sync_status = 'synced', dirty_fields = '[]'::jsonb, updated_at = NOW() WHERE id = $1;`,
                                    [lead.id]
                                );
                                pushedCount++;
                            }
                        }
                    } catch (pushErr) {
                        console.warn(`[Sync Orchestrator] Failed pushing lead ${lead.id}:`, pushErr);
                    }
                }
            }

            steps.push({
                step: "1_push_crm_to_hubspot",
                name: "Push Local Changes to HubSpot",
                status: "success",
                durationMs: Date.now() - step1Start,
                details: pendingLeads.length > 0
                    ? `Pushed ${pushedCount} of ${pendingLeads.length} pending local lead updates to HubSpot.`
                    : "No local pending changes to push. All leads already in sync with HubSpot.",
                recordsProcessed: pushedCount,
            });
        } catch (s1Err: any) {
            steps.push({
                step: "1_push_crm_to_hubspot",
                name: "Push Local Changes to HubSpot",
                status: "warning",
                durationMs: Date.now() - step1Start,
                details: `Skipped or partial: ${s1Err.message}`,
            });
        }

        // =========================================================================
        // STEP 2: Incremental HubSpot Inbound Sync
        // Logic: Query contacts modified since last sync timestamp, update
        // pipeline stages, owners, lead statuses and new contacts.
        // =========================================================================
        const step2Start = Date.now();
        try {
            const token = process.env.HUBSPOT_ACCESS_TOKEN;
            if (!token) throw new Error("HUBSPOT_ACCESS_TOKEN missing");

            const metaRes = await pool.query(
                "SELECT value FROM sync_metadata WHERE key = 'hubspot_last_synced_at';"
            );
            const lastSyncTimestamp = metaRes.rows[0]?.value ? parseInt(metaRes.rows[0].value, 10) : null;
            const nowTimestamp = Date.now();

            // Search contacts updated since last timestamp
            const searchBody: any = {
                limit: 100,
                properties: [
                    "firstname", "lastname", "email", "jobtitle", "company",
                    "hs_lead_status", "lifecyclestage", "hubspot_owner_id",
                    "replied", "campaign", "email_status", "type_of_response",
                    "hs_email_domain", "lastmodifieddate"
                ],
                sorts: [{ propertyName: "lastmodifieddate", direction: "DESCENDING" }],
            };

            if (lastSyncTimestamp) {
                searchBody.filterGroups = [{
                    filters: [{
                        propertyName: "lastmodifieddate",
                        operator: "GTE",
                        value: String(lastSyncTimestamp),
                    }],
                }];
            }

            const searchRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(searchBody),
            });

            let hubspotUpdated = 0;
            if (searchRes.ok) {
                const searchData = await searchRes.json();
                const contacts = searchData.results || [];

                for (const c of contacts) {
                    const p = c.properties || {};
                    const contactName = [p.firstname, p.lastname].filter(Boolean).join(" ") || "Unknown";
                    await pool.query(
                        `UPDATE leads
                         SET contact_name = COALESCE(NULLIF($1, 'Unknown'), contact_name),
                             email = COALESCE(NULLIF($2, ''), email),
                             title = COALESCE(NULLIF($3, ''), title),
                             company_name = COALESCE(NULLIF($4, ''), company_name),
                             lead_status = COALESCE(NULLIF($5, ''), lead_status),
                             lifecycle_stage = COALESCE(NULLIF($6, ''), lifecycle_stage),
                             contact_owner = COALESCE(NULLIF($7, ''), contact_owner),
                             replied = COALESCE(NULLIF($8, ''), replied),
                             campaign = COALESCE(NULLIF($9, ''), campaign),
                             sync_status = 'synced',
                             updated_at = NOW()
                         WHERE hubspot_id = $10 OR email = $2;`,
                        [
                            contactName,
                            p.email || null,
                            p.jobtitle || null,
                            p.company || null,
                            p.hs_lead_status || null,
                            p.lifecyclestage || null,
                            p.hubspot_owner_id || null,
                            p.replied || null,
                            p.campaign || null,
                            c.id,
                        ]
                    );
                    hubspotUpdated++;
                }

                await pool.query(`
                    INSERT INTO sync_metadata (key, value, updated_at)
                    VALUES ('hubspot_last_synced_at', $1, NOW())
                    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
                `, [String(nowTimestamp)]);
            }

            steps.push({
                step: "2_hubspot_inbound_sync",
                name: "HubSpot Incremental Sync",
                status: "success",
                durationMs: Date.now() - step2Start,
                details: `Checked cloud HubSpot changes. Synchronized ${hubspotUpdated} modified contacts.`,
                recordsProcessed: hubspotUpdated,
            });
        } catch (s2Err: any) {
            steps.push({
                step: "2_hubspot_inbound_sync",
                name: "HubSpot Incremental Sync",
                status: "warning",
                durationMs: Date.now() - step2Start,
                details: `HubSpot sync warning: ${s2Err.message}`,
            });
        }

        // =========================================================================
        // STEP 3: Reply.io Sequences & Cold Email Engagement Sync
        // Logic: Sync all email sequence performance, reply stats, delivery counts,
        // and link replies to contacts.
        // =========================================================================
        const step3Start = Date.now();
        try {
            const key = getReplyApiKey();
            if (!key) throw new Error("REPLY_API_KEY missing");

            const campRes = await fetch("https://api.reply.io/v1/campaigns", {
                headers: { "x-api-key": key },
                cache: "no-store",
            });

            let syncedReplyCampaigns = 0;
            if (campRes.ok) {
                const campaigns = await campRes.json();
                if (Array.isArray(campaigns)) {
                    for (const camp of campaigns) {
                        await pool.query(
                            `INSERT INTO reply_campaigns (
                                id, name, status, deliveries_count, opens_count, replies_count,
                                bounces_count, opt_outs_count, people_count, email_account,
                                owner_email, created_time, synced_at
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
                            ON CONFLICT (id) DO UPDATE SET
                                name = EXCLUDED.name,
                                status = EXCLUDED.status,
                                deliveries_count = EXCLUDED.deliveries_count,
                                opens_count = EXCLUDED.opens_count,
                                replies_count = EXCLUDED.replies_count,
                                bounces_count = EXCLUDED.bounces_count,
                                opt_outs_count = EXCLUDED.opt_outs_count,
                                people_count = EXCLUDED.people_count,
                                email_account = EXCLUDED.email_account,
                                owner_email = EXCLUDED.owner_email,
                                synced_at = NOW();`,
                            [
                                camp.id,
                                camp.name,
                                String(camp.status),
                                camp.deliveriesCount || 0,
                                camp.opensCount || 0,
                                camp.repliesCount || 0,
                                camp.bouncesCount || 0,
                                camp.optOutsCount || 0,
                                camp.peopleCount || 0,
                                camp.emailAccount || null,
                                camp.ownerEmail || null,
                                camp.created ? new Date(camp.created) : null,
                            ]
                        );
                        syncedReplyCampaigns++;
                    }
                }
            }

            steps.push({
                step: "3_reply_campaigns_sync",
                name: "Reply.io Sequences & Responses",
                status: "success",
                durationMs: Date.now() - step3Start,
                details: `Synchronized ${syncedReplyCampaigns} Reply.io email sequences and reply metrics.`,
                recordsProcessed: syncedReplyCampaigns,
            });
        } catch (s3Err: any) {
            steps.push({
                step: "3_reply_campaigns_sync",
                name: "Reply.io Sequences & Responses",
                status: "warning",
                durationMs: Date.now() - step3Start,
                details: `Reply.io sync warning: ${s3Err.message}`,
            });
        }

        // =========================================================================
        // STEP 4: LinkedHelper Inbox & Webhook Events Reconciliation
        // Logic: Process any unprocessed incoming LinkedIn webhook events,
        // match them to contacts, update conversation logs and replied status.
        // =========================================================================
        const step4Start = Date.now();
        try {
            const lhEventsRes = await pool.query(
                `SELECT id, profile_url, full_name, email, raw_payload
                 FROM linkedhelper_events
                 WHERE processed_status = 'received'
                 ORDER BY created_at ASC
                 LIMIT 100;`
            );

            let reconciledEvents = 0;
            for (const ev of lhEventsRes.rows) {
                try {
                    const raw = ev.raw_payload || {};
                    const isIncomingReply = raw.is_last_message_incoming === true || raw.is_last_message_incoming === "true";
                    
                    if (ev.email || ev.profile_url) {
                        await pool.query(
                            `UPDATE leads
                             SET replied = CASE WHEN $1 THEN 'Yes' ELSE replied END,
                                 type_of_response = CASE WHEN $1 AND (type_of_response IS NULL OR type_of_response = '') THEN 'Interested / Replied' ELSE type_of_response END,
                                 updated_at = NOW()
                             WHERE (email IS NOT NULL AND email = $2)
                                OR (linkedin_url IS NOT NULL AND linkedin_url ILIKE $3);`,
                            [isIncomingReply, ev.email || null, ev.profile_url ? `%${ev.profile_url}%` : null]
                        );
                    }

                    await pool.query(
                        `UPDATE linkedhelper_events SET processed_status = 'processed' WHERE id = $1;`,
                        [ev.id]
                    );
                    reconciledEvents++;
                } catch (lhErr) {
                    console.warn(`[Sync Orchestrator] LinkedHelper event ${ev.id} reconcile error:`, lhErr);
                }
            }

            steps.push({
                step: "4_linkedhelper_reconcile",
                name: "LinkedHelper Events Reconciliation",
                status: "success",
                durationMs: Date.now() - step4Start,
                details: reconciledEvents > 0
                    ? `Reconciled ${reconciledEvents} pending LinkedIn webhook events with CRM contacts.`
                    : "LinkedHelper queue clean. All LinkedIn interactions and webhooks up-to-date.",
                recordsProcessed: reconciledEvents,
            });
        } catch (s4Err: any) {
            steps.push({
                step: "4_linkedhelper_reconcile",
                name: "LinkedHelper Events Reconciliation",
                status: "warning",
                durationMs: Date.now() - step4Start,
                details: `LinkedHelper check warning: ${s4Err.message}`,
            });
        }

        // =========================================================================
        // STEP 5: Zoho Campaigns Newsletter & Subscriber Analytics Sync
        // Logic: Refresh editions, open rates, click rates, unsubscribes,
        // and recipient click activity for the newsletter hub.
        // =========================================================================
        const step5Start = Date.now();
        try {
            const { accessToken } = await getZohoAccessToken();
            const campRes = await fetch("https://campaigns.zoho.com/api/v1.1/recentcampaigns?resfmt=JSON&range=50", {
                headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
            });

            let zohoSyncedCount = 0;
            if (campRes.ok) {
                const campData = await campRes.json();
                const campaigns = campData.recent_campaigns || [];

                for (const camp of campaigns.slice(0, 20)) {
                    const campKey = camp.campaign_key || camp.campaignKey;
                    if (!campKey) continue;

                    let report: any = {};
                    try {
                        const repRes = await fetch(`https://campaigns.zoho.com/api/v1.1/getcampaignreports?resfmt=JSON&campaignkey=${campKey}`, {
                            headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
                        });
                        const repData = await repRes.json();
                        if (repData["campaign-reports"] && repData["campaign-reports"].length > 0) {
                            report = repData["campaign-reports"][0];
                        }
                    } catch {}

                    const sentTime = camp.sent_time ? new Date(parseInt(camp.sent_time, 10)) : null;
                    const createdTime = camp.created_time ? new Date(parseInt(camp.created_time, 10)) : null;

                    await pool.query(
                        `INSERT INTO zoho_campaigns (
                            campaign_key, campaign_id, campaign_name, subject, from_email,
                            reply_to, campaign_status, sent_time, created_time, campaign_preview,
                            emails_sent_count, delivered_count, delivered_percent, opens_count,
                            open_percent, unique_clicked_percent, bounces_count, bounce_percent,
                            unsubscribes_count, unsub_percent, raw_report, synced_at
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                            $15, $16, $17, $18, $19, $20, $21, NOW()
                        )
                        ON CONFLICT (campaign_key) DO UPDATE SET
                            campaign_name = EXCLUDED.campaign_name,
                            subject = EXCLUDED.subject,
                            campaign_status = EXCLUDED.campaign_status,
                            emails_sent_count = EXCLUDED.emails_sent_count,
                            delivered_count = EXCLUDED.delivered_count,
                            delivered_percent = EXCLUDED.delivered_percent,
                            opens_count = EXCLUDED.opens_count,
                            open_percent = EXCLUDED.open_percent,
                            unique_clicked_percent = EXCLUDED.unique_clicked_percent,
                            bounces_count = EXCLUDED.bounces_count,
                            bounce_percent = EXCLUDED.bounce_percent,
                            synced_at = NOW();`,
                        [
                            campKey,
                            camp.campaign_id || null,
                            camp.campaign_name || "Newsletter Edition",
                            camp.subject || null,
                            camp.from_email || null,
                            camp.reply_to || null,
                            camp.campaign_status || "Sent",
                            sentTime,
                            createdTime,
                            camp.campaign_preview || null,
                            parseInt(report.emails_sent_count || "0", 10),
                            parseInt(report.delivered_count || "0", 10),
                            parseFloat(report.delivered_percent || "0"),
                            parseInt(report.opens_count || "0", 10),
                            parseFloat(report.open_percent || "0"),
                            parseFloat(report.unique_clicked_percent || "0"),
                            parseInt(report.bounces_count || "0", 10),
                            parseFloat(report.bounce_percent || "0"),
                            parseInt(report.unsubscribes_count || "0", 10),
                            parseFloat(report.unsub_percent || "0"),
                            JSON.stringify(report),
                        ]
                    );
                    zohoSyncedCount++;
                }

                await pool.query(`
                    INSERT INTO sync_metadata (key, value, updated_at)
                    VALUES ('zoho_last_synced_at', NOW()::text, NOW())
                    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
                `);
            }

            steps.push({
                step: "5_zoho_newsletter_sync",
                name: "Zoho Newsletter Analytics & Reports",
                status: "success",
                durationMs: Date.now() - step5Start,
                details: `Updated ${zohoSyncedCount} newsletter editions, delivery rates, open rates, and click metrics.`,
                recordsProcessed: zohoSyncedCount,
            });
        } catch (s5Err: any) {
            steps.push({
                step: "5_zoho_newsletter_sync",
                name: "Zoho Newsletter Analytics & Reports",
                status: "warning",
                durationMs: Date.now() - step5Start,
                details: `Zoho sync note: ${s5Err.message}`,
            });
        }

        // =========================================================================
        // STEP 6: Refresh Aggregated Metrics & Cache
        // Logic: Clean metadata flags, log completion in DB.
        // =========================================================================
        const completedAt = new Date();
        const totalDurationMs = Date.now() - startTime;
        const hasErrors = steps.some((s) => s.status === "error");
        const hasWarnings = steps.some((s) => s.status === "warning");
        const finalStatus = hasErrors ? "error" : hasWarnings ? "partial" : "success";

        const summary = `Completed in ${(totalDurationMs / 1000).toFixed(1)}s. Executed all 5 pipeline phases across HubSpot CRM, Reply.io, LinkedHelper, and Zoho Campaigns.`;

        await pool.query(
            `UPDATE scheduled_sync_logs
             SET completed_at = $1, status = $2, steps = $3, summary = $4
             WHERE id = $5;`,
            [completedAt, finalStatus, JSON.stringify(steps), summary, logId]
        );

        return {
            logId,
            startedAt: startedAt.toISOString(),
            completedAt: completedAt.toISOString(),
            totalDurationMs,
            status: finalStatus,
            triggerSource,
            steps,
            summary,
        };
    } catch (err: any) {
        console.error("[Sync Orchestrator] Critical error:", err);
        const completedAt = new Date();
        const totalDurationMs = Date.now() - startTime;

        await pool.query(
            `UPDATE scheduled_sync_logs
             SET completed_at = $1, status = 'error', steps = $2, error = $3
             WHERE id = $4;`,
            [completedAt, JSON.stringify(steps), err.message, logId]
        );

        throw err;
    } finally {
        isOrchestrating = false;
    }
}
