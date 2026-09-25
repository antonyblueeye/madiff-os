import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await initDb();

        const query = `
            SELECT 
                COALESCE(campaign_name, 'Network Sequence') AS name,
                campaign_id AS "campaignId",
                COUNT(*) AS "totalEvents",
                COUNT(DISTINCT COALESCE(profile_url, full_name)) AS "prospectsCount",
                COUNT(DISTINCT CASE 
                    WHEN (raw_payload->>'member_distance' ILIKE '%1%' OR raw_payload->>'connected_at_iso' IS NOT NULL) 
                    THEN COALESCE(profile_url, full_name) 
                END) AS "connectedCount",
                COUNT(DISTINCT CASE 
                    WHEN (
                        raw_payload->>'is_last_message_incoming' = 'true' 
                        OR raw_payload->>'has_unread_messages' = 'true'
                        OR (raw_payload->>'full_messaging_history' IS NOT NULL AND length(raw_payload->>'full_messaging_history') > 20)
                    ) 
                    THEN COALESCE(profile_url, full_name) 
                END) AS "messagedCount",
                COUNT(DISTINCT CASE 
                    WHEN raw_payload->>'is_last_message_incoming' = 'true' 
                    THEN COALESCE(profile_url, full_name) 
                END) AS "repliedCount",
                MIN(created_at) AS "firstEventAt",
                MAX(created_at) AS "lastEventAt",
                jsonb_agg(
                    jsonb_build_object(
                        'id', id,
                        'fullName', full_name,
                        'company', company,
                        'occupation', occupation,
                        'profileUrl', profile_url,
                        'eventType', event_type,
                        'createdAt', created_at
                    ) ORDER BY created_at DESC
                ) FILTER (WHERE id IS NOT NULL) AS "recentActivity"
            FROM linkedhelper_events
            WHERE campaign_name IS NOT NULL AND campaign_name != ''
            GROUP BY COALESCE(campaign_name, 'Network Sequence'), campaign_id
            ORDER BY MAX(created_at) DESC;
        `;

        const res = await pool.query(query);

        const campaigns = res.rows.map((row: any) => {
            const prospects = parseInt(row.prospectsCount || "0", 10);
            const connected = parseInt(row.connectedCount || "0", 10);
            const messaged = parseInt(row.messagedCount || "0", 10);
            const replied = parseInt(row.repliedCount || "0", 10);
            const connectionRate = prospects > 0 ? ((connected / prospects) * 100).toFixed(1) : "0.0";
            const replyRate = messaged > 0 ? ((replied / messaged) * 100).toFixed(1) : "0.0";

            return {
                id: row.campaignId || `lh_${row.name.toLowerCase().replace(/\s+/g, "_")}`,
                name: row.name,
                source: "LinkedHelper",
                status: "Active (Webhook Live)",
                prospectsCount: prospects,
                connectedCount: connected,
                messagedCount: messaged,
                repliedCount: replied,
                connectionRate,
                replyRate,
                firstEventAt: row.firstEventAt,
                lastEventAt: row.lastEventAt,
                recentActivity: (row.recentActivity || []).slice(0, 5),
            };
        });

        return NextResponse.json({
            success: true,
            totalCampaigns: campaigns.length,
            campaigns,
        });
    } catch (err: any) {
        console.error("GET /api/linkedhelper/campaigns error:", err);
        return NextResponse.json(
            { error: "Failed to fetch LinkedHelper campaigns", details: err?.message },
            { status: 500 }
        );
    }
}
