import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";
import { getReplyApiKey, getReplyContactActivities } from "@/lib/reply";

export async function POST(request: Request) {
    try {
        await initDb();
        const key = getReplyApiKey();

        if (!key) {
            return NextResponse.json({ error: "REPLY_API_KEY is not defined" }, { status: 500 });
        }

        // 1. Fetch campaigns from Reply.io
        const campRes = await fetch("https://api.reply.io/v1/campaigns", {
            headers: { "x-api-key": key },
            cache: "no-store",
        });
        const campaigns = await campRes.json();
        let syncedCampaignsCount = 0;

        for (const camp of campaigns) {
            await pool.query(
                `
                INSERT INTO reply_campaigns (
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
                    synced_at = NOW()
                `,
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
            syncedCampaignsCount++;
        }

        // 2. Fetch all contacts from Reply.io via /v1/people (paginated)
        // Reply.io stores ~975 contacts in account
        let contactsUpdatedCount = 0;
        let newContactsCreatedCount = 0;
        let repliesFoundCount = 0;

        // Fetch page 1 to find total pages
        const firstPageRes = await fetch("https://api.reply.io/v1/people?limit=100&page=1", {
            headers: { "x-api-key": key },
            cache: "no-store",
        });
        const firstPageData = await firstPageRes.json();
        const totalPages = Math.min(firstPageData.pagesCount || 10, 15);

        for (let page = 1; page <= totalPages; page++) {
            let pageData = firstPageData;
            if (page > 1) {
                const res = await fetch(`https://api.reply.io/v1/people?limit=100&page=${page}`, {
                    headers: { "x-api-key": key },
                    cache: "no-store",
                });
                pageData = await res.json();
            }

            const people = pageData.people || [];
            if (people.length === 0) break;

            for (const person of people) {
                if (!person.email) continue;
                const contactEmail = person.email.trim().toLowerCase();

                // Fetch activities / conversations for this contact
                let activities: any[] = [];
                try {
                    activities = await getReplyContactActivities(person.id);
                } catch (e) {
                    console.warn(`Could not get activities for ${contactEmail}:`, e);
                }

                const conversations = activities
                    .filter((act: any) =>
                        [
                            "CampaignEmailSent",
                            "OpenTracked",
                            "Replied",
                            "EmailReplied",
                            "OptedOut",
                        ].includes(act.activityType)
                    )
                    .map((act: any) => ({
                        id: act.id,
                        type: act.activityType,
                        date: act.date,
                        campaignId: act.content?.campaignId || null,
                        campaignName: act.content?.campaignName || "Cold Outreach",
                        stepNum: act.content?.stepNum || null,
                        subject: act.content?.emailSubject || null,
                        body: act.content?.emailBody || null,
                        senderEmail: act.content?.emailAccountAddress || null,
                    }));

                const isReplied =
                    activities.some((a) => ["Replied", "EmailReplied"].includes(a.activityType)) ||
                    person.status === "Replied";

                // Check if lead exists in leads table (by email or domain match)
                const leadRes = await pool.query(
                    "SELECT id, contact_name, channels, dirty_fields FROM leads WHERE LOWER(email) = $1 LIMIT 1",
                    [contactEmail]
                );

                if (leadRes.rowCount > 0) {
                    // Update existing lead
                    const currentLead = leadRes.rows[0];
                    const newChannels = {
                        ...(currentLead.channels || {}),
                        reply: {
                            active: true,
                            statusText: isReplied ? "Replied" : "In Sequence",
                            details: conversations[0]?.campaignName ? `Campaign: ${conversations[0].campaignName}` : "Active in Reply.io",
                            dateAdded: new Date().toISOString(),
                        },
                    };

                    const personFullName = `${person.firstName || ""} ${person.lastName || ""}`.trim();
                    const hasMoreCompleteName = personFullName && (!currentLead.contact_name || currentLead.contact_name === person.firstName || currentLead.contact_name === "Not Specified");

                    await pool.query(
                        `
                        UPDATE leads
                        SET 
                            contact_name = CASE WHEN $5 != '' THEN $5 ELSE contact_name END,
                            title = CASE WHEN (title IS NULL OR title = 'Executive / Founder' OR title = 'Executive') AND $6 != '' THEN $6 ELSE title END,
                            company_name = CASE WHEN (company_name IS NULL OR company_name = 'Not Specified' OR company_name = 'Company') AND $7 != '' THEN $7 ELSE company_name END,
                            phone = COALESCE(phone, $8),
                            linkedin_url = COALESCE(linkedin_url, $9),
                            reply_conversations = $1,
                            replied = CASE WHEN $2 = true THEN 'Yes' ELSE replied END,
                            channels = $3,
                            sync_status = CASE WHEN $5 != '' AND $5 != contact_name THEN 'pending_push' ELSE sync_status END,
                            dirty_fields = CASE WHEN $5 != '' AND $5 != contact_name THEN '["contact_name", "title", "company_name", "phone", "linkedin_url"]'::jsonb ELSE dirty_fields END,
                            updated_at = NOW()
                        WHERE id = $4
                        `,
                        [
                            JSON.stringify(conversations),
                            isReplied,
                            JSON.stringify(newChannels),
                            currentLead.id,
                            hasMoreCompleteName ? personFullName : "",
                            person.title || "",
                            person.company || "",
                            person.phone || null,
                            person.linkedInProfile || null,
                        ]
                    );
                    contactsUpdatedCount++;
                } else {
                    // Lead is in Reply.io but not in our database -> INSERT as new lead!
                    const fullName = `${person.firstName || ""} ${person.lastName || ""}`.trim() || person.email.split("@")[0];
                    const domain = person.email.includes("@") ? person.email.split("@")[1] : "";
                    const newId = `reply_${person.id}`;

                    const newChannels = {
                        hubspot: { active: false, statusText: "Not Synced" },
                        reply: {
                            active: true,
                            statusText: isReplied ? "Replied" : "In Sequence",
                            details: conversations[0]?.campaignName ? `Campaign: ${conversations[0].campaignName}` : "Imported from Reply.io",
                            dateAdded: new Date().toISOString(),
                        },
                        linkedhelper: { active: false },
                        zoho: { active: false },
                    };

                    await pool.query(
                        `
                        INSERT INTO leads (
                            id, contact_name, title, email, phone, company_name, company_domain_name, 
                            location, linkedin_url, replied, channels, reply_conversations, sync_status, created_at, updated_at
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending_push', NOW(), NOW())
                        ON CONFLICT (id) DO NOTHING
                        `,
                        [
                            newId,
                            fullName,
                            person.title || "Executive",
                            contactEmail,
                            person.phone || null,
                            person.company || (domain ? domain.split(".")[0].toUpperCase() : "Company"),
                            domain,
                            person.country || person.city || "Global / Remote",
                            person.linkedInProfile || null,
                            isReplied ? "Yes" : "No",
                            JSON.stringify(newChannels),
                            JSON.stringify(conversations),
                        ]
                    );
                    newContactsCreatedCount++;
                }

                if (isReplied) repliesFoundCount++;
            }
        }

        // 3. Update sync metadata
        await pool.query(
            `
            INSERT INTO sync_metadata (key, value, updated_at)
            VALUES ('reply_last_synced_at', NOW()::text, NOW())
            ON CONFLICT (key) DO UPDATE SET
                value = EXCLUDED.value,
                updated_at = NOW()
            `
        );

        return NextResponse.json({
            success: true,
            syncedCampaignsCount,
            contactsUpdatedCount,
            newContactsCreatedCount,
            repliesFoundCount,
            syncedAt: new Date().toISOString(),
            message: `Synchronized ${syncedCampaignsCount} campaigns, updated ${contactsUpdatedCount} existing contacts, created ${newContactsCreatedCount} new leads from Reply.io, and captured ${repliesFoundCount} replies!`,
        });
    } catch (err: any) {
        console.error("POST /api/reply/sync error:", err);
        return NextResponse.json(
            { error: "Failed to sync Reply.io", details: err.message },
            { status: 500 }
        );
    }
}
