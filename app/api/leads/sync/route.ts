import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";

// Store in-memory sync state so UI can poll progress
let syncState = {
    isRunning: false,
    syncedCount: 0,
    totalCount: 40142,
    mode: "incremental" as "incremental" | "full",
    currentPage: 0,
    statusMessage: "Idle",
    startedAt: null as string | null,
    finishedAt: null as string | null,
    error: null as string | null,
};

export async function GET() {
    return NextResponse.json(syncState);
}

export async function POST(request: Request) {
    const token = process.env.HUBSPOT_ACCESS_TOKEN;

    if (!token) {
        return NextResponse.json(
            { error: "HUBSPOT_ACCESS_TOKEN is not defined in environment variables" },
            { status: 500 }
        );
    }

    if (syncState.isRunning) {
        return NextResponse.json({
            message: "Sync already in progress",
            syncState,
        });
    }

    const { searchParams } = new URL(request.url);
    const forceFullSync = searchParams.get("full") === "true";

    try {
        await initDb();
    } catch (e: any) {
        return NextResponse.json({ error: "DB init failed", details: e.message }, { status: 500 });
    }

    // Check last sync time from DB
    let lastSyncTimestamp: number | null = null;
    if (!forceFullSync) {
        const metaRes = await pool.query(
            "SELECT value FROM sync_metadata WHERE key = 'hubspot_last_synced_at';"
        );
        if (metaRes.rows[0]?.value) {
            lastSyncTimestamp = parseInt(metaRes.rows[0].value, 10);
        }
    }

    const isIncremental = Boolean(lastSyncTimestamp && !forceFullSync);

    syncState = {
        isRunning: true,
        syncedCount: 0,
        totalCount: isIncremental ? 0 : 40142,
        mode: isIncremental ? "incremental" : "full",
        currentPage: 0,
        statusMessage: isIncremental
            ? `Checking HubSpot for contacts modified since ${new Date(lastSyncTimestamp!).toLocaleTimeString()}...`
            : "Starting full HubSpot sync...",
        startedAt: new Date().toISOString(),
        finishedAt: null,
        error: null,
    };

    const syncStartTime = Date.now();

    // Run async in background without timing out Next.js HTTP request
    (async () => {
        try {
            // 1. Fetch HubSpot owners mapping
            const ownersMap: Record<string, string> = {};
            try {
                const ownersRes = await fetch("https://api.hubapi.com/crm/v3/owners", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (ownersRes.ok) {
                    const ownersData = await ownersRes.json();
                    for (const owner of ownersData.results || []) {
                        const name = [owner.firstName, owner.lastName].filter(Boolean).join(" ") || owner.email;
                        ownersMap[owner.id] = name;
                    }
                }
            } catch (e) {
                console.warn("Failed to fetch HubSpot owners:", e);
            }

            // 2. Fetch notes from HubSpot (up to 100 recent notes)
            const contactNotesMap: Record<string, string[]> = {};
            try {
                const notesRes = await fetch(
                    "https://api.hubapi.com/crm/v3/objects/notes?limit=100&properties=hs_note_body,hs_timestamp",
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (notesRes.ok) {
                    const notesData = await notesRes.json();
                    const notesList = notesData.results || [];

                    if (notesList.length > 0) {
                        const assocRes = await fetch(
                            "https://api.hubapi.com/crm/v3/associations/notes/contacts/batch/read",
                            {
                                method: "POST",
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    inputs: notesList.map((n: any) => ({ id: n.id })),
                                }),
                            }
                        );

                        if (assocRes.ok) {
                            const assocData = await assocRes.json();
                            for (const item of assocData.results || []) {
                                const noteObj = notesList.find((n: any) => n.id === item.from?.id);
                                if (!noteObj?.properties?.hs_note_body) continue;

                                const cleanText = noteObj.properties.hs_note_body
                                    .replace(/<[^>]*>?/gm, " ")
                                    .replace(/&nbsp;/g, " ")
                                    .replace(/\s+/g, " ")
                                    .trim();

                                if (!cleanText) continue;

                                for (const to of item.to || []) {
                                    if (!contactNotesMap[to.id]) contactNotesMap[to.id] = [];
                                    contactNotesMap[to.id].push(cleanText);
                                }
                            }
                        }
                    }
                }
            } catch (noteErr) {
                console.warn("Could not fetch notes:", noteErr);
            }

            const propertiesList = [
                "firstname",
                "lastname",
                "email",
                "jobtitle",
                "company",
                "hs_lead_status",
                "lifecyclestage",
                "hubspot_owner_id",
                "linkedin_connection_status",
                "linkedin_account",
                "location",
                "city",
                "state",
                "country",
                "website",
                "hs_linkedin_url",
                "lgm_linkedinurl",
                "replied",
                "campaign",
                "utm_campaign",
                "hs_analytics_first_touch_converting_campaign",
                "email_status",
                "technology",
                "role",
                "type_of_response",
                "hs_email_domain",
                "createdate",
                "lastmodifieddate",
            ];

            let after: string | undefined = undefined;
            let pageCount = 0;
            let totalSynced = 0;

            do {
                let contacts: any[] = [];

                if (isIncremental) {
                    // Fast incremental query via search endpoint
                    const searchBody: any = {
                        filterGroups: [
                            {
                                filters: [
                                    {
                                        propertyName: "lastmodifieddate",
                                        operator: "GTE",
                                        value: String(lastSyncTimestamp),
                                    },
                                ],
                            },
                        ],
                        properties: propertiesList,
                        limit: 100,
                    };
                    if (after) {
                        searchBody.after = after;
                    }

                    const searchRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(searchBody),
                    });

                    if (!searchRes.ok) {
                        if (searchRes.status === 429) {
                            await new Promise((r) => setTimeout(r, 2000));
                            continue;
                        }
                        const err = await searchRes.json().catch(() => ({}));
                        console.error("HubSpot incremental search error:", err);
                        break;
                    }

                    const searchData = await searchRes.json();
                    contacts = searchData.results || [];
                    syncState.totalCount = searchData.total || 0;
                    after = searchData.paging?.next?.after;
                } else {
                    // Full sequential pagination
                    let apiUrl = `https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=${propertiesList.join(",")}`;
                    if (after) {
                        apiUrl += `&after=${after}`;
                    }

                    const res = await fetch(apiUrl, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });

                    if (!res.ok) {
                        if (res.status === 429) {
                            await new Promise((r) => setTimeout(r, 3000));
                            continue;
                        }
                        const err = await res.json().catch(() => ({}));
                        console.error("HubSpot batch fetch error:", err);
                        break;
                    }

                    const data = await res.json();
                    contacts = data.results || [];
                    after = data.paging?.next?.after;
                }

                if (contacts.length === 0) break;

                // Process contacts in batch transaction
                const client = await pool.connect();
                try {
                    await client.query("BEGIN");

                    for (const c of contacts) {
                        const p = c.properties || {};
                        const fullName = [p.firstname, p.lastname].filter(Boolean).join(" ") || "Unknown Contact";

                        let location = p.location?.trim();
                        if (!location) {
                            const locParts = [p.city, p.state, p.country].filter(Boolean);
                            location = locParts.length > 0 ? locParts.join(", ") : "Global / Remote";
                        }

                        let companyDomain = p.hs_email_domain || "";
                        if (!companyDomain && p.website) {
                            companyDomain = p.website.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").trim();
                        }
                        if (!companyDomain && p.email && p.email.includes("@")) {
                            const domainPart = p.email.split("@")[1]?.trim();
                            if (domainPart && !["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com"].includes(domainPart.toLowerCase())) {
                                companyDomain = domainPart;
                            }
                        }

                        const contactOwner = p.hubspot_owner_id
                            ? ownersMap[p.hubspot_owner_id] || `Owner #${p.hubspot_owner_id}`
                            : "Unassigned";

                        const campaign =
                            p.campaign ||
                            p.utm_campaign ||
                            p.hs_analytics_first_touch_converting_campaign ||
                            null;

                        const linkedinUrl =
                            p.hs_linkedin_url ||
                            p.lgm_linkedinurl ||
                            (p.linkedin_account ? `https://linkedin.com/in/${p.linkedin_account.replace(/^https?:\/\/.*linkedin\.com\/in\//i, "")}` : null);

                        const notes = contactNotesMap[c.id] || [];

                        const channelsJson = JSON.stringify({
                            hubspot: {
                                active: true,
                                statusText: p.lifecyclestage || "Synced",
                                details: `Owner: ${contactOwner} | ID: ${c.id}`,
                                dateAdded: p.createdate ? new Date(p.createdate).toISOString().split("T")[0] : "Active",
                            },
                            reply: { active: false, statusText: "Not Enrolled" },
                            linkedhelper: {
                                active: Boolean(p.linkedin_connection_status && p.linkedin_connection_status !== "not_connected"),
                                statusText: p.linkedin_connection_status || "Not Connected",
                            },
                            zoho: { active: false, statusText: "Not Subscribed" },
                        });

                        const timelineJson = JSON.stringify([
                            {
                                date: p.createdate ? new Date(p.createdate).toISOString().split("T")[0] : "Recent",
                                channel: "HubSpot CRM",
                                event: `Synced contact from HubSpot (Owner: ${contactOwner}, Stage: ${p.lifecyclestage || "lead"})`,
                            },
                        ]);

                        const query = `
                            INSERT INTO leads (
                                id, hubspot_id, contact_name, title, email, company_name,
                                lead_status, lifecycle_stage, contact_owner, linkedin_connection_status,
                                linkedin_account, location, website_url, linkedin_url, replied,
                                campaign, email_status, technology, role, type_of_response,
                                company_domain_name, channels, notes, timeline, phone, created_at, updated_at
                            ) VALUES (
                                $1, $2, $3, $4, $5, $6,
                                $7, $8, $9, $10,
                                $11, $12, $13, $14, $15,
                                $16, $17, $18, $19, $20,
                                $21, $22, $23, $24, $25, COALESCE($26::timestamptz, NOW()), NOW()
                            )
                            ON CONFLICT (id) DO UPDATE SET
                                contact_name = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'contact_name' THEN leads.contact_name ELSE EXCLUDED.contact_name END,
                                title = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'title' THEN leads.title ELSE EXCLUDED.title END,
                                email = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'email' THEN leads.email ELSE EXCLUDED.email END,
                                company_name = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'company_name' THEN leads.company_name ELSE EXCLUDED.company_name END,
                                lead_status = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'lead_status' THEN leads.lead_status ELSE EXCLUDED.lead_status END,
                                lifecycle_stage = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'lifecycle_stage' THEN leads.lifecycle_stage ELSE EXCLUDED.lifecycle_stage END,
                                contact_owner = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'contact_owner' THEN leads.contact_owner ELSE EXCLUDED.contact_owner END,
                                linkedin_connection_status = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'linkedin_connection_status' THEN leads.linkedin_connection_status ELSE EXCLUDED.linkedin_connection_status END,
                                linkedin_account = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'linkedin_account' THEN leads.linkedin_account ELSE EXCLUDED.linkedin_account END,
                                location = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'location' THEN leads.location ELSE EXCLUDED.location END,
                                website_url = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'website_url' THEN leads.website_url ELSE EXCLUDED.website_url END,
                                linkedin_url = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'linkedin_url' THEN leads.linkedin_url ELSE EXCLUDED.linkedin_url END,
                                replied = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'replied' THEN leads.replied ELSE EXCLUDED.replied END,
                                campaign = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'campaign' THEN leads.campaign ELSE EXCLUDED.campaign END,
                                email_status = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'email_status' THEN leads.email_status ELSE EXCLUDED.email_status END,
                                technology = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'technology' THEN leads.technology ELSE EXCLUDED.technology END,
                                role = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'role' THEN leads.role ELSE EXCLUDED.role END,
                                type_of_response = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'type_of_response' THEN leads.type_of_response ELSE EXCLUDED.type_of_response END,
                                company_domain_name = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'company_domain_name' THEN leads.company_domain_name ELSE EXCLUDED.company_domain_name END,
                                phone = CASE WHEN leads.sync_status = 'pending_push' AND leads.dirty_fields ? 'phone' THEN leads.phone ELSE EXCLUDED.phone END,
                                channels = EXCLUDED.channels,
                                notes = CASE WHEN jsonb_array_length(leads.notes) > jsonb_array_length(EXCLUDED.notes) THEN leads.notes ELSE EXCLUDED.notes END,
                                updated_at = NOW();
                        `;

                        await client.query(query, [
                            c.id,
                            c.id,
                            fullName,
                            p.jobtitle || "Executive / Founder",
                            p.email || "",
                            p.company?.trim() || "Not Specified",
                            p.hs_lead_status || "NEW",
                            p.lifecyclestage || "lead",
                            contactOwner,
                            p.linkedin_connection_status || "Not Connected",
                            p.linkedin_account || null,
                            location,
                            p.website || null,
                            linkedinUrl,
                            p.replied ? String(p.replied) : "No",
                            campaign,
                            p.email_status || "Valid",
                            p.technology || null,
                            p.role || null,
                            p.type_of_response || null,
                            companyDomain,
                            channelsJson,
                            JSON.stringify(notes),
                            timelineJson,
                            p.phone || null,
                            p.createdate || null,
                        ]);

                        totalSynced++;
                    }

                    await client.query("COMMIT");
                } catch (batchErr) {
                    await client.query("ROLLBACK");
                    console.error("Batch insert error:", batchErr);
                } finally {
                    client.release();
                }

                pageCount++;
                syncState.currentPage = pageCount;
                syncState.syncedCount = totalSynced;
                syncState.statusMessage = isIncremental
                    ? `Quick Sync: Updated ${totalSynced} modified contacts...`
                    : `Full Sync: Processed ${totalSynced} contacts (page ${pageCount})...`;
            } while (after);

            // Record successful sync timestamp in PostgreSQL
            await pool.query(`
                INSERT INTO sync_metadata (key, value, updated_at)
                VALUES ('hubspot_last_synced_at', $1, NOW())
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
            `, [String(syncStartTime)]);

            syncState.isRunning = false;
            syncState.finishedAt = new Date().toISOString();
            syncState.statusMessage = totalSynced === 0 && isIncremental
                ? "All up-to-date! No changes detected in HubSpot since last sync."
                : `Sync completed! Successfully updated ${totalSynced} contacts.`;
        } catch (err: any) {
            console.error("HubSpot sync error:", err);
            syncState.isRunning = false;
            syncState.error = err.message;
            syncState.statusMessage = `Error: ${err.message}`;
        }
    })();

    return NextResponse.json({
        success: true,
        mode: isIncremental ? "incremental" : "full",
        message: isIncremental
            ? "Instant incremental sync started for recently modified contacts."
            : "Full synchronization started.",
        syncState,
    });
}
