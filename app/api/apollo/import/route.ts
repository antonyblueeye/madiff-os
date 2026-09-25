import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/apollo/import
 * Fetches matching contacts via mixed_people/api_search up to `limit` (e.g. 10, 25, 50, 100),
 * enriches them via people/bulk_match to unlock full emails, names, phones, domains,
 * and saves them into the PostgreSQL leads table with sync_status = 'pending_push'.
 */
export async function POST(req: Request) {
    const apiKey = process.env.APOLLO_KEY || process.env.APOLLO_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: "APOLLO_KEY is not defined in environment variables" },
            { status: 500 }
        );
    }

    try {
        await initDb();
        const body = await req.json();
        const {
            jobTitles,
            locations,
            employeeRanges,
            industries,
            keywords,
            emailStatus = "verified",
            limit = 25,
            campaign = "Apollo Inbound Lead Sourcing",
        } = body;

        const maxToImport = Math.min(Math.max(Number(limit) || 10, 1), 200);

        // Prepare Apollo search filters
        const apolloPayload: Record<string, any> = {
            page: 1,
            per_page: Math.min(maxToImport, 100),
        };

        if (jobTitles && Array.isArray(jobTitles) && jobTitles.length > 0) {
            apolloPayload.person_titles = jobTitles.filter(Boolean);
        } else if (typeof jobTitles === "string" && jobTitles.trim()) {
            apolloPayload.person_titles = jobTitles.split(",").map((s: string) => s.trim()).filter(Boolean);
        }

        if (locations && Array.isArray(locations) && locations.length > 0) {
            apolloPayload.person_locations = locations.filter(Boolean);
        } else if (typeof locations === "string" && locations.trim()) {
            apolloPayload.person_locations = locations.split(",").map((s: string) => s.trim()).filter(Boolean);
        }

        if (employeeRanges && Array.isArray(employeeRanges) && employeeRanges.length > 0) {
            apolloPayload.organization_num_employees_ranges = employeeRanges.filter(Boolean);
        }

        const allKeywords: string[] = [];
        if (industries && Array.isArray(industries)) {
            allKeywords.push(...industries.filter(Boolean));
        } else if (typeof industries === "string" && industries.trim()) {
            allKeywords.push(...industries.split(",").map((s: string) => s.trim()).filter(Boolean));
        }
        if (keywords && Array.isArray(keywords)) {
            allKeywords.push(...keywords.filter(Boolean));
        } else if (typeof keywords === "string" && keywords.trim()) {
            allKeywords.push(...keywords.split(",").map((s: string) => s.trim()).filter(Boolean));
        }
        if (allKeywords.length > 0) {
            apolloPayload.q_organization_keyword_tags = allKeywords;
        }

        if (emailStatus === "verified") {
            apolloPayload.contact_email_status = ["verified"];
        }

        // 1. Fetch matching person IDs from Apollo search
        const searchPeopleIds: string[] = [];
        let currentPage = 1;

        while (searchPeopleIds.length < maxToImport) {
            apolloPayload.page = currentPage;
            apolloPayload.per_page = Math.min(maxToImport - searchPeopleIds.length, 100);

            const searchRes = await fetch("https://api.apollo.io/v1/mixed_people/api_search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Api-Key": apiKey,
                },
                body: JSON.stringify(apolloPayload),
            });

            if (!searchRes.ok) {
                const errData = await searchRes.json().catch(() => ({}));
                console.error("Apollo search error:", errData);
                return NextResponse.json(
                    { error: "Apollo API search failed", details: errData.error || errData },
                    { status: searchRes.status }
                );
            }

            const searchData = await searchRes.json();
            const people = searchData.people || [];
            if (people.length === 0) break;

            for (const p of people) {
                if (p.id) {
                    searchPeopleIds.push(p.id);
                    if (searchPeopleIds.length >= maxToImport) break;
                }
            }

            if (people.length < apolloPayload.per_page) break;
            currentPage++;
        }

        if (searchPeopleIds.length === 0) {
            return NextResponse.json({
                success: true,
                importedCount: 0,
                message: "No matching contacts found in Apollo with the given criteria.",
            });
        }

        // 2. Enrich contacts in chunks of 50 via people/bulk_match
        const enrichedMatches: any[] = [];
        const chunkSize = 50;

        for (let i = 0; i < searchPeopleIds.length; i += chunkSize) {
            const chunk = searchPeopleIds.slice(i, i + chunkSize);
            try {
                const bulkRes = await fetch("https://api.apollo.io/v1/people/bulk_match", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Api-Key": apiKey,
                    },
                    body: JSON.stringify({
                        details: chunk.map((id) => ({ id })),
                    }),
                });

                if (bulkRes.ok) {
                    const bulkData = await bulkRes.json();
                    if (Array.isArray(bulkData.matches)) {
                        enrichedMatches.push(...bulkData.matches.filter(Boolean));
                    }
                } else {
                    const err = await bulkRes.json().catch(() => ({}));
                    console.warn(`Apollo bulk_match chunk ${i} warning:`, err);
                }
            } catch (chunkErr) {
                console.error(`Apollo bulk_match chunk error:`, chunkErr);
            }
        }

        if (enrichedMatches.length === 0) {
            return NextResponse.json({
                success: false,
                importedCount: 0,
                error: "Failed to enrich contacts from Apollo. No full contact details retrieved.",
            });
        }

        // 3. Insert or update into PostgreSQL `leads`
        let insertedCount = 0;
        let updatedCount = 0;

        for (const p of enrichedMatches) {
            const fullName = p.name || [p.first_name, p.last_name].filter(Boolean).join(" ") || "Unknown Contact";
            const email = (p.email || "").trim();
            const title = (p.title || "").trim();
            const org = p.organization || {};
            const companyName = (org.name || "").trim();
            const companyDomain = (org.primary_domain || org.website_url || "").replace(/^https?:\/\//i, "").replace(/\/.*$/, "").trim();
            const phone = (p.phone_numbers?.[0]?.sanitized_number || p.sanitized_phone || "").trim();
            const linkedinUrl = p.linkedin_url || "";
            const locationParts = [p.city, p.state, p.country].filter(Boolean);
            const location = locationParts.length > 0 ? locationParts.join(", ") : (org.country || "Global / Remote");
            const industry = org.industry || "";
            const leadId = `apollo_${p.id}`;

            const channelsData = {
                hubspot: { active: false, statusText: "Not Synced" },
                reply: { active: false, statusText: "Not Enrolled" },
                linkedhelper: { active: false, statusText: "Not Connected" },
                zoho: { active: false, statusText: "Not Subscribed" },
                apollo: {
                    active: true,
                    statusText: p.email_status === "verified" ? "Verified Email" : "Imported",
                    details: `Apollo ID: ${p.id}${industry ? ` | ${industry}` : ""}`,
                    lastImportedAt: new Date().toISOString(),
                },
            };

            const timelineData = [
                {
                    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                    channel: "Apollo.io",
                    event: `Imported via Apollo Search (${title || "Professional"}${companyName ? ` at ${companyName}` : ""})`,
                },
            ];

            // Upsert into leads: match by email if present, or by id
            let existingLead: any = null;
            if (email) {
                const checkRes = await pool.query("SELECT id, hubspot_id, channels FROM leads WHERE LOWER(email) = LOWER($1) LIMIT 1", [email]);
                existingLead = checkRes.rows[0];
            }
            if (!existingLead) {
                const checkById = await pool.query("SELECT id, hubspot_id, channels FROM leads WHERE id = $1 LIMIT 1", [leadId]);
                existingLead = checkById.rows[0];
            }

            if (existingLead) {
                // Update existing lead with Apollo enrich info
                await pool.query(
                    `UPDATE leads
                     SET title = COALESCE(NULLIF(title, ''), $1),
                         company_name = COALESCE(NULLIF(company_name, ''), $2),
                         company_domain_name = COALESCE(NULLIF(company_domain_name, ''), $3),
                         phone = COALESCE(NULLIF(phone, ''), $4),
                         linkedin_url = COALESCE(NULLIF(linkedin_url, ''), $5),
                         location = COALESCE(NULLIF(location, ''), $6),
                         email_status = COALESCE($7, email_status),
                         sync_status = 'pending_push',
                         channels = jsonb_set(COALESCE(channels, '{}'::jsonb), '{apollo}', $8::jsonb),
                         updated_at = NOW()
                     WHERE id = $9`,
                    [
                        title,
                        companyName,
                        companyDomain,
                        phone,
                        linkedinUrl,
                        location,
                        p.email_status || "verified",
                        JSON.stringify(channelsData.apollo),
                        existingLead.id,
                    ]
                );
                updatedCount++;
            } else {
                // Insert brand new lead
                await pool.query(
                    `INSERT INTO leads (
                        id, contact_name, title, email, phone, company_name,
                        company_domain_name, location, linkedin_url, campaign,
                        lead_status, lifecycle_stage, email_status, sync_status,
                        channels, timeline, created_at, updated_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                        'NEW', 'lead', $11, 'pending_push',
                        $12::jsonb, $13::jsonb, NOW(), NOW()
                    )`,
                    [
                        leadId,
                        fullName,
                        title,
                        email,
                        phone,
                        companyName,
                        companyDomain,
                        location,
                        linkedinUrl,
                        campaign,
                        p.email_status || "verified",
                        JSON.stringify(channelsData),
                        JSON.stringify(timelineData),
                    ]
                );
                insertedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            totalFound: searchPeopleIds.length,
            importedCount: insertedCount + updatedCount,
            insertedCount,
            updatedCount,
            message: `Successfully imported ${insertedCount + updatedCount} lead(s) from Apollo (${insertedCount} new, ${updatedCount} updated)!`,
        });
    } catch (err: any) {
        console.error("POST /api/apollo/import error:", err);
        return NextResponse.json(
            { error: "Failed to import leads from Apollo", message: err.message },
            { status: 500 }
        );
    }
}
