import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/leads/import-csv
 * Body:
 * {
 *   leads: Array<{
 *     contact_name: string (REQUIRED),
 *     email?: string,
 *     title?: string,
 *     company_name?: string,
 *     company_domain_name?: string,
 *     phone?: string,
 *     location?: string,
 *     linkedin_url?: string,
 *     campaign?: string,
 *     contact_owner?: string,
 *     lead_status?: string,
 *     lifecycle_stage?: string,
 *     technology?: string,
 *     role?: string,
 *   }>,
 *   campaign?: string,
 *   contact_owner?: string,
 * }
 */
export async function POST(req: Request) {
    try {
        await initDb();
        const body = await req.json();
        const { leads, campaign: fallbackCampaign, contact_owner: fallbackOwner } = body;

        if (!Array.isArray(leads) || leads.length === 0) {
            return NextResponse.json({ error: "No leads data provided in request" }, { status: 400 });
        }

        let insertedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;

        for (const item of leads) {
            const name = (item.contact_name || "").trim();
            if (!name) {
                skippedCount++;
                continue;
            }

            const email = (item.email || "").trim();
            const title = (item.title || "").trim();
            const companyName = (item.company_name || "").trim();
            let companyDomain = (item.company_domain_name || "").replace(/^https?:\/\//i, "").replace(/\/.*$/, "").trim();
            if (!companyDomain && email && email.includes("@")) {
                const domainPart = email.split("@")[1]?.trim();
                if (domainPart && !["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com"].includes(domainPart.toLowerCase())) {
                    companyDomain = domainPart;
                }
            }

            const phone = (item.phone || "").trim();
            const location = (item.location || "").trim() || "Global / Remote";
            const linkedinUrl = (item.linkedin_url || "").trim();
            const campaign = (item.campaign || fallbackCampaign || "CSV Import").trim();
            const contactOwner = (item.contact_owner || fallbackOwner || "Unassigned").trim();
            const leadStatus = (item.lead_status || "NEW").trim();
            const lifecycleStage = (item.lifecycle_stage || "lead").trim();
            const technology = (item.technology || "").trim() || null;
            const role = (item.role || "").trim() || null;

            const leadId = `csv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

            const channelsData = {
                hubspot: { active: false, statusText: "Not Synced" },
                reply: { active: false, statusText: "Not Enrolled" },
                linkedhelper: { active: false, statusText: "Not Connected" },
                zoho: { active: false, statusText: "Not Subscribed" },
                csv: {
                    active: true,
                    statusText: "Imported via CSV",
                    dateAdded: new Date().toISOString(),
                },
            };

            const timelineData = [
                {
                    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                    channel: "CSV Import",
                    event: `Contact imported via CSV file (${title || "Lead"}${companyName ? ` at ${companyName}` : ""})`,
                },
            ];

            // Match existing record if email is present
            let existing: any = null;
            if (email) {
                const checkRes = await pool.query(
                    "SELECT id, hubspot_id, channels FROM leads WHERE LOWER(email) = LOWER($1) LIMIT 1",
                    [email]
                );
                existing = checkRes.rows[0];
            }

            if (existing) {
                await pool.query(
                    `UPDATE leads
                     SET contact_name = COALESCE(NULLIF($1, ''), contact_name),
                         title = COALESCE(NULLIF($2, ''), title),
                         company_name = COALESCE(NULLIF($3, ''), company_name),
                         company_domain_name = COALESCE(NULLIF($4, ''), company_domain_name),
                         phone = COALESCE(NULLIF($5, ''), phone),
                         location = COALESCE(NULLIF($6, ''), location),
                         linkedin_url = COALESCE(NULLIF($7, ''), linkedin_url),
                         campaign = COALESCE(NULLIF($8, ''), campaign),
                         contact_owner = COALESCE(NULLIF($9, 'Unassigned'), contact_owner),
                         sync_status = 'pending_push',
                         updated_at = NOW()
                     WHERE id = $10`,
                    [
                        name,
                        title,
                        companyName,
                        companyDomain,
                        phone,
                        location,
                        linkedinUrl,
                        campaign,
                        contactOwner,
                        existing.id,
                    ]
                );
                updatedCount++;
            } else {
                await pool.query(
                    `INSERT INTO leads (
                        id, contact_name, title, email, phone, company_name,
                        company_domain_name, location, linkedin_url, campaign,
                        contact_owner, lead_status, lifecycle_stage, technology,
                        role, sync_status, channels, timeline, created_at, updated_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                        $11, $12, $13, $14, $15, 'pending_push',
                        $16::jsonb, $17::jsonb, NOW(), NOW()
                    )`,
                    [
                        leadId,
                        name,
                        title || null,
                        email || null,
                        phone || null,
                        companyName || null,
                        companyDomain || null,
                        location || null,
                        linkedinUrl || null,
                        campaign || null,
                        contactOwner || "Unassigned",
                        leadStatus,
                        lifecycleStage,
                        technology,
                        role,
                        JSON.stringify(channelsData),
                        JSON.stringify(timelineData),
                    ]
                );
                insertedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            totalProcessed: leads.length,
            insertedCount,
            updatedCount,
            skippedCount,
            message: `Successfully imported ${insertedCount + updatedCount} contact(s) (${insertedCount} new, ${updatedCount} updated, ${skippedCount} skipped without name).`,
        });
    } catch (err: any) {
        console.error("POST /api/leads/import-csv error:", err);
        return NextResponse.json(
            { error: "Failed to import leads from CSV", message: err.message },
            { status: 500 }
        );
    }
}
