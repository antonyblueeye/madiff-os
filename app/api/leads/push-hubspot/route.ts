import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";

// Allowed options for HubSpot 'campaign' enumeration property
const ALLOWED_HUBSPOT_CAMPAIGNS = new Set([
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
]);

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
                lead_status, lifecycle_stage, location, website_url, linkedin_url,
                campaign, technology, role, type_of_response, company_domain_name, dirty_fields,
                replied, reply_conversations
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
        };

        const updateInputs: any[] = [];
        const createInputs: any[] = [];
        const leadsUpdated: string[] = [];
        const leadsCreated: { localId: string; email: string }[] = [];

        for (const lead of pendingLeads) {
            const properties: Record<string, any> = {};
            const dirtyList: string[] = Array.isArray(lead.dirty_fields) ? lead.dirty_fields : [];

            for (const col of dirtyList) {
                if (col === "contact_name") {
                    const parts = (lead.contact_name || "").trim().split(" ");
                    properties.firstname = parts[0] || "";
                    properties.lastname = parts.slice(1).join(" ") || "";
                } else if (col === "campaign") {
                    // Only send campaign if it matches HubSpot's valid enum options
                    if (lead.campaign && ALLOWED_HUBSPOT_CAMPAIGNS.has(lead.campaign)) {
                        properties.campaign = lead.campaign;
                    }
                } else if (colToHsProp[col]) {
                    if (lead[col] !== undefined && lead[col] !== null) {
                        properties[colToHsProp[col]] = lead[col];
                    }
                }
            }

            // Fallback if dirty_fields was empty or generic
            if (Object.keys(properties).length === 0 || !lead.hubspot_id) {
                const parts = (lead.contact_name || "").trim().split(" ");
                properties.firstname = parts[0] || "";
                properties.lastname = parts.slice(1).join(" ") || "";
                if (lead.title) properties.jobtitle = lead.title;
                if (lead.email) properties.email = lead.email;
                if (lead.phone) properties.phone = lead.phone;
                if (lead.company_name) properties.company = lead.company_name;
                if (lead.lead_status) properties.hs_lead_status = lead.lead_status;
                if (lead.lifecycle_stage) properties.lifecyclestage = lead.lifecycle_stage;
                if (lead.location) properties.location = lead.location;
                if (lead.linkedin_url) properties.hs_linkedin_url = lead.linkedin_url;
            }

            // If lead has replied via Reply.io, reflect it in HubSpot properties
            if (lead.replied === "Yes") {
                properties.hs_lead_status = "IN_PROGRESS";
            }

            // Check if contact already exists in HubSpot (has hubspot_id)
            if (lead.hubspot_id && !lead.id.startsWith("reply_")) {
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

        // 1. Batch Update existing contacts
        if (updateInputs.length > 0) {
            const hsRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/batch/update", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ inputs: updateInputs }),
            });

            if (!hsRes.ok) {
                const errData = await hsRes.json().catch(() => ({}));
                console.error("HubSpot batch update error:", errData);
                return NextResponse.json(
                    { error: "HubSpot API rejected batch update", details: errData.message || errData },
                    { status: hsRes.status }
                );
            }

            await pool.query(
                `UPDATE leads SET sync_status = 'synced', dirty_fields = '[]'::jsonb, updated_at = NOW() WHERE id = ANY($1::varchar[])`,
                [leadsUpdated]
            );
        }

        // 2. Batch Create new contacts in HubSpot
        if (createInputs.length > 0) {
            const hsCreateRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/batch/create", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ inputs: createInputs }),
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

            // Update leads table with returned hubspot_ids
            for (let i = 0; i < createdResults.length; i++) {
                const hsObj = createdResults[i];
                const leadInfo = leadsCreated[i];
                if (hsObj?.id && leadInfo?.localId) {
                    await pool.query(
                        `UPDATE leads SET hubspot_id = $1, sync_status = 'synced', dirty_fields = '[]'::jsonb, updated_at = NOW() WHERE id = $2`,
                        [hsObj.id, leadInfo.localId]
                    );
                }
            }
        }

        // 3. Automatically log Reply.io conversation history into HubSpot Notes
        for (const lead of pendingLeads) {
            const conversations = Array.isArray(lead.reply_conversations) ? lead.reply_conversations : [];
            const hubspotContactId = lead.hubspot_id || lead.id;

            if (conversations.length > 0 && hubspotContactId && !hubspotContactId.startsWith("reply_")) {
                try {
                    const convoLines = conversations.map((c: any) => {
                        const dateStr = c.date ? new Date(c.date).toLocaleString("en-GB") : "";
                        return `[${c.type.toUpperCase()}] ${dateStr}\nCampaign: ${c.campaignName || "Outreach"}\nSubject: ${c.subject || "(no subject)"}\n${c.body ? `Message: ${c.body}\n` : ""}`;
                    }).join("\n--------------------\n");

                    const noteBody = `[Reply.io Outreach History]\nContact: ${lead.contact_name} (${lead.email})\nStatus: ${lead.replied === "Yes" ? "REPLIED" : "In Sequence"}\n\n${convoLines}`;

                    await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            properties: {
                                hs_note_body: noteBody,
                                hs_timestamp: new Date().toISOString(),
                            },
                            associations: [
                                {
                                    to: { id: hubspotContactId },
                                    types: [
                                        {
                                            associationCategory: "HUBSPOT_DEFINED",
                                            associationTypeId: 202,
                                        },
                                    ],
                                },
                            ],
                        }),
                    });
                } catch (noteErr) {
                    console.warn(`Could not create HubSpot note for ${lead.email}:`, noteErr);
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
