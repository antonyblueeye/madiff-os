import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";

// Fallback options for HubSpot 'campaign' enumeration property
const DEFAULT_HUBSPOT_CAMPAIGNS = new Set([
    "US Financial Services",
    "EU Renewable Energy",
    "EY",
    "Polish Tech Hubs",
    "EU Manufacturing",
    "EY - GDS",
    "Station F",
    "Private Equity and Private Capital AI",
    "EU Automotive",
    "US SaaS",
    "Klarna",
    "AI Pack",
    "Network",
]);

let cachedAllowedCampaigns: Set<string> | null = null;
let lastCampaignCacheTime = 0;
const CAMPAIGN_CACHE_TTL_MS = 60 * 1000; // 1 minute cache

async function getHubSpotAllowedCampaigns(token: string): Promise<Set<string>> {
    const now = Date.now();
    if (cachedAllowedCampaigns && (now - lastCampaignCacheTime < CAMPAIGN_CACHE_TTL_MS)) {
        return cachedAllowedCampaigns;
    }
    try {
        const res = await fetch("https://api.hubapi.com/crm/v3/properties/contacts/campaign", {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.options)) {
                const fetched = new Set<string>();
                for (const opt of data.options) {
                    if (opt.value) fetched.add(opt.value);
                    if (opt.label) fetched.add(opt.label);
                }
                cachedAllowedCampaigns = fetched;
                lastCampaignCacheTime = now;
                return fetched;
            }
        }
    } catch (err) {
        console.warn("Could not dynamically fetch HubSpot campaign options:", err);
    }
    return DEFAULT_HUBSPOT_CAMPAIGNS;
}

function parseTimestamp(rawDate: string | null | undefined): string {
    if (!rawDate) return new Date().toISOString();
    const parsed = Date.parse(rawDate);
    if (!isNaN(parsed)) {
        return new Date(parsed).toISOString();
    }
    return new Date().toISOString();
}

export async function POST(request: Request) {
    const token = process.env.HUBSPOT_ACCESS_TOKEN;

    if (!token) {
        return NextResponse.json(
            { error: "HUBSPOT_ACCESS_TOKEN is not defined in environment variables" },
            { status: 500 }
        );
    }

    try {
        await initDb();
        const allowedCampaigns = await getHubSpotAllowedCampaigns(token);
        const { searchParams } = new URL(request.url);
        const specificLeadId = searchParams.get("id");

        let bodyLeadIds: string[] = [];
        try {
            const body = await request.clone().json();
            if (Array.isArray(body?.leadIds)) {
                bodyLeadIds = body.leadIds;
            }
        } catch {
            // body is optional or empty
        }

        let selectQuery = `
            SELECT 
                id, hubspot_id, contact_name, title, email, phone, company_name,
                contact_owner, lead_status, lifecycle_stage, location, website_url, linkedin_url,
                campaign, technology, role, type_of_response, company_domain_name, dirty_fields,
                replied, reply_conversations, linkedin_conversations, channels,
                linkedin_connection_status, linkedin_account
            FROM leads 
            WHERE 1=1
        `;
        const params: any[] = [];

        if (specificLeadId) {
            selectQuery += ` AND id = $1`;
            params.push(specificLeadId);
        } else if (bodyLeadIds.length > 0) {
            selectQuery += ` AND id = ANY($1::varchar[])`;
            params.push(bodyLeadIds);
        } else {
            // Push all modified or pending leads
            selectQuery += ` AND sync_status = 'pending_push'`;
        }

        const resLeads = await pool.query(selectQuery, params);
        const pendingLeads = resLeads.rows;

        if (pendingLeads.length === 0) {
            return NextResponse.json({
                success: true,
                pushedCount: 0,
                message: "No contacts to push to HubSpot.",
            });
        }

        // Fetch HubSpot owners to resolve name -> hubspot_owner_id
        const ownerNameToIdMap: Record<string, string> = {};
        try {
            const ownersRes = await fetch("https://api.hubapi.com/crm/v3/owners", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (ownersRes.ok) {
                const ownersData = await ownersRes.json();
                for (const owner of ownersData.results || []) {
                    const fullName = [owner.firstName, owner.lastName].filter(Boolean).join(" ").trim().toLowerCase();
                    const email = (owner.email || "").trim().toLowerCase();
                    if (fullName) ownerNameToIdMap[fullName] = owner.id;
                    if (email) ownerNameToIdMap[email] = owner.id;
                    ownerNameToIdMap[owner.id] = owner.id;
                }
            }
        } catch (e) {
            console.warn("Could not fetch HubSpot owners for ID mapping:", e);
        }

        // Helper to format LinkedIn connection status for HubSpot enum options: 'Not connected' | 'Pending' | 'Accepted'
        function formatHsConnectionStatus(rawStatus: string | null | undefined): string | null {
            if (!rawStatus) return null;
            const s = rawStatus.trim().toLowerCase();
            if (s === "connected" || s === "accepted") return "Accepted";
            if (s === "pending") return "Pending";
            if (s.includes("not")) return "Not connected";
            return "Accepted"; // default for positive connection events
        }

        // Map writable internal column names to valid, non-read-only HubSpot contact properties
        const colToHsProp: Record<string, string> = {
            contact_name: "firstname",
            title: "jobtitle",
            email: "email",
            phone: "phone",
            company_name: "company",
            lead_status: "hs_lead_status",
            lifecycle_stage: "lifecyclestage",
            location: "location",
            website_url: "website",
            linkedin_url: "hs_linkedin_url",
            technology: "technology",
            role: "role",
            type_of_response: "type_of_response",
            linkedin_account: "linkedin_account",
        };

        const updateInputs: any[] = [];
        const createInputs: any[] = [];
        const leadsUpdated: string[] = [];
        const leadsCreated: { localId: string; email: string }[] = [];
        const leadIdToCreatedHsId: Record<string, string> = {};

        for (const lead of pendingLeads) {
            const properties: Record<string, any> = {};
            const dirtyList: string[] = Array.isArray(lead.dirty_fields) ? lead.dirty_fields : [];

            for (const col of dirtyList) {
                if (col === "contact_name") {
                    const parts = (lead.contact_name || "").trim().split(" ");
                    properties.firstname = parts[0] || "";
                    properties.lastname = parts.slice(1).join(" ") || "";
                } else if (col === "campaign") {
                    // Send campaign if present in allowed HubSpot options or if non-empty
                    if (lead.campaign && (allowedCampaigns.has(lead.campaign) || DEFAULT_HUBSPOT_CAMPAIGNS.has(lead.campaign))) {
                        properties.campaign = lead.campaign;
                    }
                } else if (col === "linkedin_connection_status") {
                    const formatted = formatHsConnectionStatus(lead.linkedin_connection_status);
                    if (formatted) properties.linkedin_connection_status = formatted;
                } else if (col === "linkedin_account") {
                    if (lead.linkedin_account && String(lead.linkedin_account).trim()) {
                        properties.linkedin_account = String(lead.linkedin_account).trim();
                    }
                } else if (col === "contact_owner") {
                    if (lead.contact_owner) {
                        const lookupKey = lead.contact_owner.trim().toLowerCase();
                        if (ownerNameToIdMap[lookupKey]) {
                            properties.hubspot_owner_id = ownerNameToIdMap[lookupKey];
                        }
                    }
                } else if (colToHsProp[col]) {
                    const val = lead[col];
                    if (val !== undefined && val !== null) {
                        const strVal = String(val).trim();
                        if (strVal.length > 0) {
                            properties[colToHsProp[col]] = strVal;
                        }
                    }
                }
            }

            // Fallback if dirty_fields was empty or new contact
            if (Object.keys(properties).length === 0 || !lead.hubspot_id) {
                const parts = (lead.contact_name || "").trim().split(" ");
                properties.firstname = parts[0] || "";
                properties.lastname = parts.slice(1).join(" ") || "";
                if (lead.title && String(lead.title).trim()) properties.jobtitle = String(lead.title).trim();
                if (lead.email && String(lead.email).trim()) properties.email = String(lead.email).trim();
                if (lead.phone && String(lead.phone).trim()) properties.phone = String(lead.phone).trim();
                if (lead.company_name && String(lead.company_name).trim()) properties.company = String(lead.company_name).trim();
                if (lead.lead_status && String(lead.lead_status).trim()) properties.hs_lead_status = String(lead.lead_status).trim();
                if (lead.lifecycle_stage && String(lead.lifecycle_stage).trim()) properties.lifecyclestage = String(lead.lifecycle_stage).trim();
                if (lead.location && String(lead.location).trim()) properties.location = String(lead.location).trim();
                if (lead.linkedin_url && String(lead.linkedin_url).trim()) properties.hs_linkedin_url = String(lead.linkedin_url).trim();
                if (lead.linkedin_connection_status) {
                    const formatted = formatHsConnectionStatus(lead.linkedin_connection_status);
                    if (formatted) properties.linkedin_connection_status = formatted;
                }
                if (lead.linkedin_account && String(lead.linkedin_account).trim()) {
                    properties.linkedin_account = String(lead.linkedin_account).trim();
                }
                if (lead.contact_owner) {
                    const lookupKey = lead.contact_owner.trim().toLowerCase();
                    if (ownerNameToIdMap[lookupKey]) {
                        properties.hubspot_owner_id = ownerNameToIdMap[lookupKey];
                    }
                }
                if (lead.campaign && (allowedCampaigns.has(lead.campaign) || DEFAULT_HUBSPOT_CAMPAIGNS.has(lead.campaign))) {
                    properties.campaign = lead.campaign;
                }
            }

            // If lead has replied via Reply.io, reflect it in HubSpot properties
            if (lead.replied === "Yes" || lead.replied === "true") {
                properties.hs_lead_status = "IN_PROGRESS";
            }

            // Check if contact already exists in HubSpot (has real numeric/HubSpot id)
            if (lead.hubspot_id && !lead.hubspot_id.startsWith("reply_") && !lead.hubspot_id.startsWith("lh_")) {
                updateInputs.push({
                    id: lead.hubspot_id,
                    properties,
                });
                leadsUpdated.push(lead.id);
            } else {
                // New contact without HubSpot ID -> create in HubSpot
                createInputs.push({
                    properties,
                });
                leadsCreated.push({ localId: lead.id, email: lead.email });
            }
        }

        // Helper to chunk arrays into batches of max 100 items (HubSpot limit)
        const CHUNK_SIZE = 100;
        function chunkArray<T>(items: T[], size: number): T[][] {
            const chunks: T[][] = [];
            for (let i = 0; i < items.length; i += size) {
                chunks.push(items.slice(i, i + size));
            }
            return chunks;
        }

        // 1. Batch Update existing contacts (chunked <= 100)
        if (updateInputs.length > 0) {
            const updateChunks = chunkArray(updateInputs, CHUNK_SIZE);
            for (const chunk of updateChunks) {
                const hsRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/batch/update", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ inputs: chunk }),
                });

                if (!hsRes.ok) {
                    const errData = await hsRes.json().catch(() => ({}));
                    console.error("HubSpot batch update error:", errData);
                    return NextResponse.json(
                        { error: "HubSpot API rejected batch update", details: errData.message || errData },
                        { status: hsRes.status }
                    );
                }
            }

            const updateChannelsQuery = `
                UPDATE leads 
                SET sync_status = 'synced', 
                    dirty_fields = '[]'::jsonb, 
                    channels = jsonb_set(
                        COALESCE(channels, '{}'::jsonb),
                        '{hubspot}',
                        jsonb_build_object(
                            'active', true,
                            'statusText', COALESCE(lifecycle_stage, 'Synced'),
                            'details', 'Synced to HubSpot CRM',
                            'lastPushedAt', NOW()
                        )
                    ),
                    updated_at = NOW() 
                WHERE id = ANY($1::varchar[])
            `;
            await pool.query(updateChannelsQuery, [leadsUpdated]);
        }

        // 2. Batch Create new contacts in HubSpot (chunked <= 100)
        if (createInputs.length > 0) {
            const createChunks = chunkArray(createInputs, CHUNK_SIZE);
            let createdCursor = 0;

            for (const chunk of createChunks) {
                const hsCreateRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/batch/create", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ inputs: chunk }),
                });

                if (!hsCreateRes.ok) {
                    const errData = await hsCreateRes.json().catch(() => ({}));
                    console.error("HubSpot batch create error:", errData);
                    return NextResponse.json(
                        { error: "HubSpot API rejected batch create", details: errData.message || errData },
                        { status: hsCreateRes.status }
                    );
                }

                const createResultData = await hsCreateRes.json();
                const createdResults = createResultData.results || [];

                for (let i = 0; i < createdResults.length; i++) {
                    const hsObj = createdResults[i];
                    const leadInfo = leadsCreated[createdCursor + i];
                    if (hsObj?.id && leadInfo?.localId) {
                        leadIdToCreatedHsId[leadInfo.localId] = String(hsObj.id);
                        await pool.query(
                            `UPDATE leads 
                             SET hubspot_id = $1::varchar, 
                                 sync_status = 'synced', 
                                 dirty_fields = '[]'::jsonb, 
                                 channels = jsonb_set(
                                     COALESCE(channels, '{}'::jsonb),
                                     '{hubspot}',
                                     jsonb_build_object(
                                         'active', true,
                                         'statusText', 'Created in HubSpot',
                                         'details', 'HubSpot ID: ' || ($1::text),
                                         'lastPushedAt', NOW()
                                     )
                                 ),
                                 updated_at = NOW() 
                             WHERE id = $2::varchar`,
                            [String(hsObj.id), String(leadInfo.localId)]
                        );
                    }
                }
                createdCursor += chunk.length;
            }
        }

        // 3. Automatically log conversation history (Reply.io and LinkedIn) into HubSpot Notes
        for (const lead of pendingLeads) {
            const replyConvs = Array.isArray(lead.reply_conversations) ? lead.reply_conversations : [];
            const linkedinConvs = Array.isArray(lead.linkedin_conversations) ? lead.linkedin_conversations : [];
            const hubspotContactId = leadIdToCreatedHsId[lead.id] || (lead.hubspot_id && !lead.hubspot_id.startsWith("reply_") && !lead.hubspot_id.startsWith("lh_") ? lead.hubspot_id : null);

            // Log Reply.io emails
            if (replyConvs.length > 0 && hubspotContactId) {
                try {
                    const convoLines = replyConvs.map((c: any) => {
                        const dateStr = c.date ? new Date(c.date).toLocaleString("en-GB") : "";
                        return `[${c.type.toUpperCase()}] ${dateStr}\nCampaign: ${c.campaignName || "Outreach"}\nSubject: ${c.subject || "(no subject)"}\n${c.body ? `Message: ${c.body}\n` : ""}`;
                    }).join("\n--------------------\n");

                    const noteBody = `[Reply.io Outreach History]\nContact: ${lead.contact_name} (${lead.email})\nStatus: ${lead.replied === "Yes" || lead.replied === "true" ? "REPLIED" : "In Sequence"}\n\n${convoLines}`;

                    const latestEmailDate = replyConvs[replyConvs.length - 1]?.date;
                    const emailTimestamp = parseTimestamp(latestEmailDate);

                    await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            properties: {
                                hs_note_body: noteBody,
                                hs_timestamp: emailTimestamp,
                            },
                            associations: [
                                {
                                    to: { id: hubspotContactId },
                                    types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }],
                                },
                            ],
                        }),
                    });
                } catch (noteErr) {
                    console.warn(`Could not create HubSpot note for ${lead.email}:`, noteErr);
                }
            }

            // Log LinkedIn / LinkedHelper messages into HubSpot as official LinkedIn Message communications (and summary note)
            if (linkedinConvs.length > 0 && hubspotContactId) {
                // 1. Create individual native LinkedIn Message objects in HubSpot with exact historical timestamps
                for (const msg of linkedinConvs) {
                    if (!msg?.text) continue;
                    try {
                        const msgTimestamp = parseTimestamp(msg.date);
                        const senderName = msg.sender || (msg.isIncoming ? lead.contact_name : "Outreach Rep");
                        const commBody = `[${msg.isIncoming ? "INCOMING LINKEDIN MESSAGE" : "OUTBOUND LINKEDIN MESSAGE"}]\nFrom: ${senderName}\nDate: ${msg.date || ""}\n\n${msg.text}`;

                        await fetch("https://api.hubapi.com/crm/v3/objects/communications", {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                properties: {
                                    hs_communication_channel_type: "LINKEDIN_MESSAGE",
                                    hs_communication_logged_from: "CRM",
                                    hs_communication_body: commBody,
                                    hs_timestamp: msgTimestamp,
                                },
                                associations: [
                                    {
                                        to: { id: hubspotContactId },
                                        types: [
                                            {
                                                associationCategory: "HUBSPOT_DEFINED",
                                                associationTypeId: 81, // communication to contact
                                            },
                                        ],
                                    },
                                ],
                            }),
                        });
                    } catch (commErr) {
                        console.warn(`Could not create HubSpot LinkedIn communication for ${lead.contact_name}:`, commErr);
                    }
                }

                // 2. Also keep a structured Note summary on the contact timeline for quick visibility
                try {
                    const lhLines = linkedinConvs.map((c: any) => {
                        return `[${c.isIncoming ? "REPLY RECEIVED" : "OUTBOUND SENT"}] ${c.date || ""}\nFrom: ${c.sender || "Unknown"}\nMessage: ${c.text || ""}`;
                    }).join("\n--------------------\n");

                    const latestDate = linkedinConvs[linkedinConvs.length - 1]?.date;
                    const noteTimestamp = parseTimestamp(latestDate);
                    const noteBody = `[LinkedIn / LinkedHelper Messages]\nContact: ${lead.contact_name}\nCampaign: ${lead.campaign || "LinkedIn Outreach"}\nStatus: ${lead.replied === "true" || lead.replied === "Yes" ? "REPLIED" : "Connected"}\n\n${lhLines}`;

                    await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            properties: {
                                hs_note_body: noteBody,
                                hs_timestamp: noteTimestamp,
                            },
                            associations: [
                                {
                                    to: { id: hubspotContactId },
                                    types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }],
                                },
                            ],
                        }),
                    });
                } catch (lhNoteErr) {
                    console.warn(`Could not create HubSpot LinkedIn note:`, lhNoteErr);
                }
            }
        }

        const totalPushed = updateInputs.length + createInputs.length;
        return NextResponse.json({
            success: true,
            pushedCount: totalPushed,
            updatedCount: updateInputs.length,
            createdCount: createInputs.length,
            message: `Successfully pushed ${totalPushed} contact(s) to HubSpot CRM (${createInputs.length} created as new, ${updateInputs.length} updated)!`,
        });
    } catch (err: any) {
        console.error("POST /api/leads/push-hubspot error:", err);
        return NextResponse.json(
            { error: "Failed to push updates to HubSpot", message: err.message },
            { status: 500 }
        );
    }
}
