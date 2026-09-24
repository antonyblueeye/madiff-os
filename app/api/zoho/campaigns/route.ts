import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";

export async function GET(request: Request) {
    try {
        await initDb();
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "100", 10);
        const onlyNewsletter = searchParams.get("newsletter") !== "false"; // default true

        const campWhere = onlyNewsletter
            ? "WHERE (LOWER(campaign_name) LIKE '%newsletter%' OR LOWER(subject) LIKE '%newsletter%')"
            : "";

        // 1. Consolidated Overall Stats (filtered by newsletter)
        const statsRes = await pool.query(`
            SELECT 
                COUNT(*)::int as total_campaigns,
                COALESCE(SUM(emails_sent_count), 0)::bigint as total_sent,
                COALESCE(SUM(delivered_count), 0)::bigint as total_delivered,
                COALESCE(SUM(opens_count), 0)::bigint as total_opens,
                COALESCE(SUM(bounces_count), 0)::bigint as total_bounces,
                COALESCE(SUM(unsubscribes_count), 0)::bigint as total_unsubs,
                ROUND(AVG(NULLIF(open_percent, 0)), 1)::numeric as avg_open_rate,
                ROUND(AVG(NULLIF(unique_clicked_percent, 0)), 1)::numeric as avg_click_rate,
                ROUND(AVG(NULLIF(delivered_percent, 0)), 1)::numeric as avg_delivery_rate
            FROM zoho_campaigns
            ${campWhere};
        `);
        const stats = statsRes.rows[0];

        // 2. Monthly Trend Aggregation
        const monthlyRes = await pool.query(`
            SELECT 
                TO_CHAR(COALESCE(sent_time, created_time), 'YYYY-MM') as month,
                COUNT(*)::int as campaign_count,
                COALESCE(SUM(emails_sent_count), 0)::bigint as total_sent,
                COALESCE(SUM(delivered_count), 0)::bigint as total_delivered,
                COALESCE(SUM(opens_count), 0)::bigint as total_opens,
                COALESCE(SUM(bounces_count), 0)::bigint as total_bounces,
                ROUND(AVG(NULLIF(open_percent, 0)), 1)::numeric as avg_open_rate,
                ROUND(AVG(NULLIF(delivered_percent, 0)), 1)::numeric as avg_delivery_rate,
                ROUND(AVG(NULLIF(unique_clicked_percent, 0)), 1)::numeric as avg_click_rate
            FROM zoho_campaigns
            ${campWhere ? campWhere + " AND COALESCE(sent_time, created_time) IS NOT NULL" : "WHERE COALESCE(sent_time, created_time) IS NOT NULL"}
            GROUP BY month
            ORDER BY month ASC;
        `);

        // 3. Campaigns List
        const campaignsRes = await pool.query(`
            SELECT 
                campaign_key, campaign_id, campaign_name, subject, from_email,
                campaign_status, sent_time, campaign_preview,
                emails_sent_count, delivered_count, delivered_percent,
                opens_count, open_percent, unique_clicked_percent,
                bounces_count, bounce_percent, unsubscribes_count, unsub_percent,
                synced_at
            FROM zoho_campaigns
            ${campWhere}
            ORDER BY sent_time DESC NULLS LAST, created_time DESC NULLS LAST
            LIMIT $1;
        `, [limit]);

        // 4. Clicked Contacts and URLs
        const clicksRes = await pool.query(`
            SELECT 
                id, campaign_key, campaign_name, contact_email, contact_name,
                clicked_url, click_count, clicked_at, synced_at
            FROM zoho_clicks
            ORDER BY clicked_at DESC, id DESC
            LIMIT 200;
        `);

        // 5. Total active subscribers across lists
        const listsStatsRes = await pool.query(`
            SELECT 
                COUNT(*)::int as total_lists,
                COALESCE(SUM(contacts_count), 0)::int as total_subscribers,
                COALESCE(SUM(unsub_count), 0)::int as total_list_unsubs
            FROM zoho_lists;
        `);
        const listsStats = listsStatsRes.rows[0];

        // 6. Mailing Lists
        const listsRes = await pool.query(`
            SELECT list_key, list_name, contacts_count, unsub_count, bounce_count, created_time
            FROM zoho_lists
            ORDER BY contacts_count DESC;
        `);

        // 7. Last Synced At metadata
        const metaRes = await pool.query(
            "SELECT value, updated_at FROM sync_metadata WHERE key = 'zoho_last_synced_at';"
        );
        const lastSyncedAt = metaRes.rows[0]?.value || metaRes.rows[0]?.updated_at || null;

        return NextResponse.json({
            stats: {
                ...stats,
                total_subscribers: listsStats?.total_subscribers || 0,
                total_lists: listsStats?.total_lists || 0,
                last_synced_at: lastSyncedAt,
            },
            monthlyTrend: monthlyRes.rows,
            campaigns: campaignsRes.rows,
            clicks: clicksRes.rows,
            lists: listsRes.rows,
            lastSyncedAt,
        });
    } catch (err: any) {
        console.error("GET /api/zoho/campaigns error:", err);
        return NextResponse.json(
            { error: "Failed to fetch Zoho Campaigns data", message: err.message },
            { status: 500 }
        );
    }
}
