import { NextRequest, NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * LinkedHelper Webhook Receiver
 * 
 * Supports:
 * 1) GET - To inspect reachability or list recently captured events
 * 2) POST - Receives webhook payloads from LinkedHelper "Send person to webhook" action
 *    - Parses person info and full messaging history
 *    - Normalizes LinkedIn URL (handles trailing slashes, slugs, etc.)
 *    - Searches existing lead in DB by:
 *        a) Email
 *        b) LinkedIn URL / handle
 *        c) Contact Name + Company Name (or Name alone if unique)
 *    - If found: updates profile, sets linkedin_connection_status, replied status, stores conversation history, activates linkedhelper channel
 *    - If not found: creates new lead record in `leads` table with all info
 */

function normalizeLinkedInUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    let clean = url.trim().toLowerCase();
    // Remove query params or anchors
    clean = clean.split("?")[0].split("#")[0];
    // Remove trailing slash
    clean = clean.replace(/\/+$/, "");
    return clean;
}

function parseMessagingHistory(rawHistory: string | null | undefined) {
    if (!rawHistory || typeof rawHistory !== "string") return [];
    
    // Pattern example: "Sender Name [Month DD, YYYY HH:MM:SS AM/PM] Message text"
    // Using a more precise date pattern inside brackets so message text isn't misidentified as sender
    const regex = /([^\[\n\r]+?)\s*\[([A-Za-z]+\s+\d{1,2},?\s+\d{4}\s+[\d:]+\s*(?:AM|PM)?)\]\s*([\s\S]*?)(?=(?:[^\[\n\r]+?\s*\[[A-Za-z]+\s+\d{1,2},?\s+\d{4})|$)/gi;
    const messages = [];
    let match;

    while ((match = regex.exec(rawHistory)) !== null) {
        let sender = match[1]?.trim() || "";
        // Clean sender if it contains residual newline text
        if (sender.includes("\n")) {
            const senderParts = sender.split("\n").map(s => s.trim()).filter(Boolean);
            sender = senderParts[senderParts.length - 1] || sender;
        }
        const dateStr = match[2]?.trim() || "";
        const text = match[3]?.trim() || "";

        if (text) {
            // Determine if incoming (not sent by our team/outreach profile)
            const isOutgoing = /Natalia|Madiff|Anton/i.test(sender);
            messages.push({
                sender,
                date: dateStr,
                text,
                isIncoming: !isOutgoing,
            });
        }
    }

    if (messages.length === 0 && rawHistory.trim()) {
        messages.push({
            sender: "LinkedIn",
            date: new Date().toISOString(),
            text: rawHistory.trim(),
            isIncoming: false,
        });
    }

    return messages;
}

function extractCompanyFromHeadline(rawCompany: string | null | undefined, headline: string | null | undefined): string | null {
    if (rawCompany && rawCompany.trim()) {
        const clean = rawCompany.trim();
        // If company has pipe or long suffix, take prefix: e.g. "Dexis | Custom Software Development" -> "Dexis"
        if (clean.includes("|")) {
            return clean.split("|")[0].trim();
        }
        return clean;
    }

    if (!headline || typeof headline !== "string") return null;

    // Common LinkedIn headline patterns:
    // "CTO at Company" / "VP @ Company" / "Director - Company"
    const patterns = [
        /(?:^|\s)at\s+([A-Z0-9][A-Za-z0-9&.,\s'-]+?)(?:\s*[|•·,;]|\s+and\s+|\s+with\s+|$)/i,
        /(?:^|\s)@\s*([A-Z0-9][A-Za-z0-9&.,\s'-]+?)(?:\s*[|•·,;]|\s+and\s+|\s+with\s+|$)/i,
        /(?:^|\s)[-–—]\s*([A-Z0-9][A-Za-z0-9&.,\s'-]+?)(?:\s*[|•·,;]|$)/i,
    ];

    for (const pat of patterns) {
        const match = headline.match(pat);
        if (match && match[1]) {
            const found = match[1].trim();
            // Discard generic non-company phrases
            if (
                found.length >= 2 &&
                found.length <= 60 &&
                !/^(the|a|an|helping|building|driving|open|stealth|freelance|self-employed)$/i.test(found)
            ) {
                return found;
            }
        }
    }

    return null;
}

export async function GET(req: NextRequest) {
    try {
        await initDb();
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "50", 10);

        const result = await pool.query(
            `SELECT id, event_type, campaign_id, campaign_name, action_name, 
                    profile_id, profile_url, full_name, email, phone, company, occupation,
                    processed_status, lead_id, created_at, raw_payload
             FROM linkedhelper_events 
             ORDER BY created_at DESC 
             LIMIT $1`,
            [limit]
        );

        return NextResponse.json({
            status: "ready",
            message: "LinkedHelper webhook receiver is live and listening.",
            webhook_url: "/api/webhooks/linkedhelper",
            total_events_captured: result.rows.length,
            recent_events: result.rows,
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: "Failed to fetch LinkedHelper events", details: err?.message },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await initDb();

        let rawPayload: any = null;
        const contentType = req.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            rawPayload = await req.json();
        } else if (contentType.includes("application/x-www-form-urlencoded")) {
            const formData = await req.formData();
            rawPayload = Object.fromEntries(formData.entries());
        } else {
            const text = await req.text();
            try {
                rawPayload = JSON.parse(text);
            } catch {
                rawPayload = { raw_body: text };
            }
        }

        const items = Array.isArray(rawPayload)
            ? rawPayload
            : Array.isArray(rawPayload?.items)
            ? rawPayload.items
            : [rawPayload];

        const insertedEvents = [];

        for (const item of items) {
            // Event metadata
            const eventType = item?.event || item?.action || item?.type || item?.status || "webhook_received";
            const campaignId = item?.campaignId || item?.campaign_id || item?.campaign?.id || null;
            const campaignName = item?.campaign_name || item?.campaignName || item?.campaign?.name || item?.campaign || "LinkedHelper Sequence";
            const actionName = item?.action_name || item?.actionName || item?.step || null;

            // Profile fields (checking both direct LinkedHelper flat fields and nested objects)
            const profile = item?.profile || item?.person || item?.contact || item;
            const profileId = profile?.id || item?.id || profile?.memberId || item?.member_id || null;
            
            const rawProfileUrl = profile?.url || profile?.profileUrl || profile?.profile_url || item?.profile_url || item?.publicUrl || item?.linkedin_url || null;
            const profileUrl = normalizeLinkedInUrl(rawProfileUrl);

            const fullName = (
                profile?.fullName || 
                profile?.full_name || 
                item?.original_full_name || 
                item?.full_name || 
                [profile?.firstName || item?.original_first_name || item?.first_name, profile?.lastName || item?.original_last_name || item?.last_name].filter(Boolean).join(" ") ||
                profile?.name || 
                null
            )?.trim();

            const email = (
                profile?.email || 
                profile?.workEmail || 
                profile?.personalEmail || 
                item?.third_party_email_1 || 
                item?.email || 
                null
            )?.trim().toLowerCase() || null;

            const phone = (profile?.phone || profile?.mobilePhone || item?.phone || null)?.trim() || null;

            const occupation = (
                profile?.occupation || 
                profile?.title || 
                profile?.headline || 
                item?.original_headline || 
                item?.current_company_position || 
                item?.headline || 
                null
            )?.trim() || null;

            const rawCompany = (
                profile?.company || 
                profile?.companyName || 
                item?.original_current_company || 
                item?.current_company || 
                item?.company_name || 
                item?.company || 
                null
            );

            const company = extractCompanyFromHeadline(rawCompany, occupation);

            const location = (
                item?.location_name || 
                item?.location || 
                profile?.location || 
                null
            )?.trim() || null;

            // Conversations & Messaging history
            const fullHistoryRaw = item?.full_messaging_history || profile?.full_messaging_history || null;
            const parsedConversations = parseMessagingHistory(fullHistoryRaw);

            // Determine connection & reply status
            const memberDistance = item?.member_distance || profile?.member_distance || "";
            const isDistance1 = memberDistance.includes("1") || memberDistance.toLowerCase() === "distance_1";
            const isConnected = isDistance1 || 
                                Boolean(item?.connected_at_iso) || 
                                eventType.includes("connect") || 
                                eventType.includes("accept");

            const isLastMessageIncoming = item?.is_last_message_incoming === "true" || item?.is_last_message_incoming === true;
            const hasIncomingReplies = parsedConversations.some((m) => m.isIncoming) || isLastMessageIncoming;

            // Extract outreach account (our LinkedIn profile used for the campaign)
            const outreachAccount = (
                item?.my_full_name || 
                item?.my_name || 
                item?.sender_name || 
                parsedConversations.find(m => !m.isIncoming)?.sender || 
                null
            )?.trim() || null;

            // 1. Insert into linkedhelper_events log table
            const insertResult = await pool.query(
                `INSERT INTO linkedhelper_events (
                    event_type, campaign_id, campaign_name, action_name,
                    profile_id, profile_url, full_name, email, phone, company, occupation,
                    raw_payload, processed_status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'received')
                RETURNING id`,
                [
                    eventType,
                    campaignId ? String(campaignId) : null,
                    campaignName ? String(campaignName) : null,
                    actionName ? String(actionName) : null,
                    profileId ? String(profileId) : null,
                    rawProfileUrl || profileUrl,
                    fullName,
                    email,
                    phone,
                    company,
                    occupation,
                    item,
                ]
            );

            const eventLogId = insertResult.rows[0]?.id;

            // 2. Multi-tier Matching for Leads
            let matchedLeadId: string | null = null;
            let existingLead: any = null;

            // Strategy A: Match by email (exact)
            if (email) {
                const res = await pool.query(
                    `SELECT id, channels, notes, timeline, linkedin_conversations, linkedin_connection_status, linkedin_account, replied, linkedin_url, company_name 
                     FROM leads WHERE LOWER(email) = LOWER($1) LIMIT 1`,
                    [email]
                );
                if (res.rows.length > 0) {
                    existingLead = res.rows[0];
                    matchedLeadId = existingLead.id;
                }
            }

            // Strategy B: Match by LinkedIn URL / slug (without trailing slashes and vanity prefixes)
            if (!matchedLeadId && profileUrl) {
                // Extract slug: e.g. "https://www.linkedin.com/in/komar-ivan/" -> "komar-ivan"
                const matchSlug = profileUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "").replace(/\/+$/, "");
                if (matchSlug && matchSlug.length > 2) {
                    const res = await pool.query(
                        `SELECT id, channels, notes, timeline, linkedin_conversations, linkedin_connection_status, linkedin_account, replied, linkedin_url, company_name 
                         FROM leads 
                         WHERE linkedin_url ILIKE $1 
                            OR linkedin_url ILIKE $2 
                         LIMIT 1`,
                        [`%${matchSlug}%`, `%${profileUrl}%`]
                    );
                    if (res.rows.length > 0) {
                        existingLead = res.rows[0];
                        matchedLeadId = existingLead.id;
                    }
                }
            }

            // Strategy C: Match by Name + Company
            if (!matchedLeadId && fullName && company) {
                const res = await pool.query(
                    `SELECT id, channels, notes, timeline, linkedin_conversations, linkedin_connection_status, linkedin_account, replied, linkedin_url, company_name 
                     FROM leads 
                     WHERE LOWER(TRIM(contact_name)) = LOWER(TRIM($1)) 
                       AND (LOWER(TRIM(company_name)) = LOWER(TRIM($2)) OR company_name ILIKE $3)
                     LIMIT 1`,
                    [fullName, company, `%${company}%`]
                );
                if (res.rows.length > 0) {
                    existingLead = res.rows[0];
                    matchedLeadId = existingLead.id;
                }
            }

            // Strategy D: Match by Name alone if exact & non-ambiguous
            if (!matchedLeadId && fullName) {
                const res = await pool.query(
                    `SELECT id, channels, notes, timeline, linkedin_conversations, linkedin_connection_status, linkedin_account, replied, linkedin_url, company_name 
                     FROM leads 
                     WHERE LOWER(TRIM(contact_name)) = LOWER(TRIM($1))
                     LIMIT 2`,
                    [fullName]
                );
                if (res.rows.length === 1) {
                    existingLead = res.rows[0];
                    matchedLeadId = existingLead.id;
                }
            }

            // 3. Process Lead (Update Existing or Create New)
            if (matchedLeadId && existingLead) {
                // UPDATE EXISTING LEAD
                const channels = existingLead.channels || {};
                channels.linkedhelper = {
                    active: true,
                    statusText: hasIncomingReplies ? "Replied on LinkedIn" : isConnected ? "1st Connection" : "In Outreach Flow",
                    details: `Campaign: ${campaignName} | ${parsedConversations.length} message(s)`,
                    lastReceivedAt: new Date().toISOString(),
                };

                // Merge linkedin conversations
                const existingConv = existingLead.linkedin_conversations || [];
                const mergedConv = [...existingConv];
                for (const msg of parsedConversations) {
                    const alreadyExists = mergedConv.some(
                        (c: any) => c.text === msg.text && c.sender === msg.sender
                    );
                    if (!alreadyExists) {
                        mergedConv.push(msg);
                    }
                }

                // Add timeline entry
                const timeline = existingLead.timeline || [];
                timeline.push({
                    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                    channel: "LinkedHelper",
                    event: `Synced from sequence '${campaignName}' (${parsedConversations.length} LinkedIn messages recorded)`,
                });

                const connectionStatus = isConnected ? "CONNECTED" : existingLead.linkedin_connection_status || "PENDING";
                const isReplied = hasIncomingReplies ? "true" : existingLead.replied || "false";
                const typeOfResponse = hasIncomingReplies ? (item?.last_received_message_text ? "LinkedIn Message" : existingLead.type_of_response || "LinkedIn Reply") : existingLead.type_of_response;

                await pool.query(
                    `UPDATE leads 
                     SET channels = $1,
                         linkedin_conversations = $2,
                         timeline = $3,
                         linkedin_connection_status = $4,
                         replied = $5,
                         type_of_response = COALESCE($6, type_of_response),
                         linkedin_url = COALESCE(linkedin_url, $7),
                         company_name = CASE WHEN company_name IS NULL OR company_name = '' THEN $8 ELSE company_name END,
                         title = CASE WHEN title IS NULL OR title = '' THEN $9 ELSE title END,
                         phone = CASE WHEN phone IS NULL OR phone = '' THEN $10 ELSE phone END,
                         linkedin_account = COALESCE(NULLIF($11, ''), linkedin_account),
                         updated_at = NOW()
                     WHERE id = $12`,
                    [
                        JSON.stringify(channels),
                        JSON.stringify(mergedConv),
                        JSON.stringify(timeline),
                        connectionStatus,
                        isReplied,
                        typeOfResponse,
                        rawProfileUrl || profileUrl,
                        company,
                        occupation,
                        phone,
                        outreachAccount,
                        matchedLeadId,
                    ]
                );

                await pool.query(
                    `UPDATE linkedhelper_events 
                     SET processed_status = 'linked_to_lead', lead_id = $1 
                     WHERE id = $2`,
                    [matchedLeadId, eventLogId]
                );

                insertedEvents.push({
                    id: eventLogId,
                    leadId: matchedLeadId,
                    action: "updated_lead",
                    fullName,
                    company,
                    messagesCount: parsedConversations.length,
                    isConnected,
                    hasReplies: hasIncomingReplies,
                });
            } else {
                // CREATE NEW LEAD
                const newLeadId = `lh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
                const initialChannels = {
                    hubspot: { active: false, statusText: "Not Synced" },
                    reply: { active: false, statusText: "Not Enrolled" },
                    linkedhelper: {
                        active: true,
                        statusText: hasIncomingReplies ? "Replied on LinkedIn" : isConnected ? "1st Connection" : "In Outreach Flow",
                        details: `Campaign: ${campaignName} | ${parsedConversations.length} message(s)`,
                        lastReceivedAt: new Date().toISOString(),
                    },
                    zoho: { active: false, statusText: "Not Subscribed" },
                };

                const initialTimeline = [
                    {
                        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                        channel: "LinkedHelper",
                        event: `Lead captured via LinkedHelper sequence '${campaignName}'`,
                    },
                ];

                await pool.query(
                    `INSERT INTO leads (
                        id, contact_name, title, email, phone, company_name,
                        location, linkedin_url, linkedin_connection_status, linkedin_account, replied,
                        campaign, lifecycle_stage, lead_status, sync_status,
                        channels, timeline, notes, linkedin_conversations, created_at, updated_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6,
                        $7, $8, $9, $10, $11,
                        $12, $13, $14, 'pending_push',
                        $15, $16, '[]'::jsonb, $17, NOW(), NOW()
                    )`,
                    [
                        newLeadId,
                        fullName || "LinkedIn Lead",
                        occupation || "",
                        email || "",
                        phone || "",
                        company || "",
                        location || "",
                        rawProfileUrl || profileUrl || "",
                        isConnected ? "CONNECTED" : "PENDING",
                        outreachAccount,
                        hasIncomingReplies ? "true" : "false",
                        campaignName,
                        "lead",
                        hasIncomingReplies ? "OPEN_DEAL" : "NEW",
                        JSON.stringify(initialChannels),
                        JSON.stringify(initialTimeline),
                        JSON.stringify(parsedConversations),
                    ]
                );

                await pool.query(
                    `UPDATE linkedhelper_events 
                     SET processed_status = 'created_lead', lead_id = $1 
                     WHERE id = $2`,
                    [newLeadId, eventLogId]
                );

                insertedEvents.push({
                    id: eventLogId,
                    leadId: newLeadId,
                    action: "created_new_lead",
                    fullName,
                    company,
                    messagesCount: parsedConversations.length,
                    isConnected,
                    hasReplies: hasIncomingReplies,
                });
            }
        }

        return NextResponse.json({
            success: true,
            processedCount: insertedEvents.length,
            events: insertedEvents,
        });
    } catch (err: any) {
        console.error("[LinkedHelper Webhook] Handler error:", err);
        return NextResponse.json(
            { success: false, error: err?.message || "Webhook processing failed" },
            { status: 500 }
        );
    }
}
