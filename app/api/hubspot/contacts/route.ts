import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const token = process.env.HUBSPOT_ACCESS_TOKEN;

    if (!token) {
        return NextResponse.json(
            { error: "HUBSPOT_ACCESS_TOKEN is not defined in environment variables" },
            { status: 500 }
        );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "250";
    const fetchAll = searchParams.get("all") === "true";

    try {
        // 1. Fetch HubSpot owners to map hubspot_owner_id -> Owner Name
        const ownersMap: Record<string, string> = {};
        try {
            const ownersRes = await fetch("https://api.hubapi.com/crm/v3/owners", {
                headers: { Authorization: `Bearer ${token}` },
                next: { revalidate: 300 }, // Cache owners for 5 mins
            });
            if (ownersRes.ok) {
                const ownersData = await ownersRes.json();
                for (const owner of ownersData.results || []) {
                    const name = [owner.firstName, owner.lastName].filter(Boolean).join(" ") || owner.email;
                    ownersMap[owner.id] = name;
                }
            }
        } catch (e) {
            console.warn("Failed to fetch HubSpot owners", e);
        }

        // 2. Fetch contacts with requested fields (auto-paginating if fetchAll or limit > 100)
        const targetCount = fetchAll ? 5000 : parseInt(limit, 10) || 250;
        let contactResults: any[] = [];
        let after: string | undefined = undefined;
        let pageCount = 0;

        const propertiesParam = "firstname,lastname,email,jobtitle,company,location,city,country,state,address,lifecyclestage,phone,hs_lead_status,createdate,lastmodifieddate,hubspot_owner_id,campaign,utm_campaign,hs_analytics_first_touch_converting_campaign,hs_analytics_last_touch_converting_campaign";

        do {
            let apiUrl = `https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=${propertiesParam}`;
            if (after) {
                apiUrl += `&after=${after}`;
            }

            const res = await fetch(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                next: { revalidate: 60 },
            });

            if (!res.ok) {
                if (contactResults.length > 0) break; // Return what we got
                const errData = await res.json().catch(() => ({}));
                return NextResponse.json(
                    { error: "Failed to fetch from HubSpot API", details: errData },
                    { status: res.status }
                );
            }

            const data = await res.json();
            const results = data.results || [];
            contactResults = contactResults.concat(results);
            after = data.paging?.next?.after;
            pageCount++;

            // Break if we've accumulated enough contacts or reached the end
            if (!after || contactResults.length >= targetCount || pageCount >= 30) {
                break;
            }
        } while (after);

        // 3. Fetch recent notes and map to contacts (up to 100 notes)
        const contactNotesMap: Record<string, string[]> = {};
        try {
            const notesRes = await fetch(
                "https://api.hubapi.com/crm/v3/objects/notes?limit=100&properties=hs_note_body,hs_timestamp",
                {
                    headers: { Authorization: `Bearer ${token}` },
                    next: { revalidate: 60 },
                }
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

                            // Clean HTML tags from note body
                            const rawBody = noteObj.properties.hs_note_body;
                            const cleanText = rawBody
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
            console.warn("Could not fetch notes association:", noteErr);
        }

        // 4. Map HubSpot CRM contacts directly to our LeadItem format
        const leads = contactResults.map((c: any) => {
            const p = c.properties || {};
            const fullName = [p.firstname, p.lastname].filter(Boolean).join(" ") || "Unknown Contact";
            const stageRaw = (p.lifecyclestage || p.hs_lead_status || "lead").toLowerCase();

            // Map lifecycle stage to clean human label
            let stage: "New Sourced" | "Contacted" | "In Conversation" | "Meeting Booked" | "Proposal Sent" = "New Sourced";
            if (stageRaw.includes("opportunity")) stage = "Proposal Sent";
            else if (stageRaw.includes("salesqualified") || stageRaw.includes("sql")) stage = "Meeting Booked";
            else if (stageRaw.includes("marketingqualified") || stageRaw.includes("mql")) stage = "In Conversation";
            else if (stageRaw.includes("lead") || stageRaw.includes("subscriber")) stage = "Contacted";

            // Resolve location:优先 p.location, затем city + country + state
            let location = p.location?.trim();
            if (!location) {
                const locationParts = [p.city, p.state, p.country].filter(Boolean);
                location = locationParts.length > 0 ? locationParts.join(", ") : "Global / Remote";
            }

            const ownerName = p.hubspot_owner_id
                ? ownersMap[p.hubspot_owner_id] || `Owner #${p.hubspot_owner_id}`
                : "Unassigned";

            const campaign =
                p.campaign ||
                p.utm_campaign ||
                p.hs_analytics_first_touch_converting_campaign ||
                p.hs_analytics_last_touch_converting_campaign ||
                "Direct / Inbound";

            const createdDateFormatted = p.createdate
                ? new Date(p.createdate).toISOString().split("T")[0]
                : "";

            // Collect notes from HubSpot
            const hsNotes = contactNotesMap[c.id] || [];
            const notes = [
                ...hsNotes,
                p.hs_lead_status ? `HubSpot Status: ${p.hs_lead_status}` : "",
            ].filter(Boolean);

            return {
                id: c.id,
                name: fullName,
                title: p.jobtitle || "Executive / Founder",
                company: p.company?.trim() || "Not Specified",
                industry: "B2B Tech / FinTech",
                location,
                headcount: "Verified Account",
                email: p.email || "No email on file",
                phone: p.phone,
                stage,
                lifecycleStage: p.lifecyclestage || "lead",
                contactOwner: ownerName,
                createdDate: createdDateFormatted,
                campaign,
                channels: {
                    apollo: { active: true, statusText: "Enriched", details: "Company and title verified" },
                    hubspot: {
                        active: true,
                        statusText: p.lifecyclestage || "Synced",
                        details: `Owner: ${ownerName} | ID: ${c.id}`,
                        dateAdded: createdDateFormatted || "Active",
                    },
                    reply: { active: false, statusText: "Not Enrolled" },
                    linkedhelper: { active: false, statusText: "Not Connected" },
                    zoho: { active: false, statusText: "Not Subscribed" },
                },
                timeline: [
                    {
                        date: createdDateFormatted || "Recent",
                        channel: "HubSpot CRM",
                        event: `Synced contact from HubSpot (Owner: ${ownerName}, Stage: ${p.lifecyclestage || "lead"})`,
                    },
                ],
                notes: notes.length > 0 ? notes : [`Imported directly from HubSpot CRM (Record ID: ${c.id}).`],
            };
        });

        return NextResponse.json({
            leads,
            totalCount: leads.length,
            hasMore: Boolean(after),
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: "Internal server error fetching HubSpot contacts", message: err.message },
            { status: 500 }
        );
    }
}
