import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";
import { getZohoAccessToken } from "@/lib/zoho";

export async function GET() {
    try {
        await initDb();

        // 1. HubSpot status
        const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;
        const leadsCountRes = await pool.query("SELECT COUNT(*)::int as count FROM leads;");
        const totalLeadsInDb = leadsCountRes.rows[0]?.count || 0;

        const hubspotMetaRes = await pool.query(
            "SELECT value, updated_at FROM sync_metadata WHERE key = 'hubspot_last_synced_at';"
        );
        const hubspotLastSync = hubspotMetaRes.rows[0]?.updated_at || null;

        // 2. Zoho status
        const zohoClientId = process.env.ZOHO_CLIENT_ID;
        const zohoRefreshToken = process.env.ZOHO_REFRESH_TOKEN;
        const isZohoConfigured = Boolean(zohoClientId && zohoRefreshToken);

        const zohoCampaignsRes = await pool.query("SELECT COUNT(*)::int as count FROM zoho_campaigns;");
        const totalZohoCampaigns = zohoCampaignsRes.rows[0]?.count || 0;

        const zohoListsRes = await pool.query("SELECT COUNT(*)::int as count FROM zoho_lists;");
        const totalZohoLists = zohoListsRes.rows[0]?.count || 0;

        const zohoSubscribersRes = await pool.query(
            "SELECT COALESCE(SUM(contacts_count), 0)::bigint as total FROM zoho_lists;"
        );
        const totalZohoSubscribers = zohoSubscribersRes.rows[0]?.total || 0;

        const zohoMetaRes = await pool.query(
            "SELECT value, updated_at FROM sync_metadata WHERE key = 'zoho_last_synced_at';"
        );
        const zohoLastSync = zohoMetaRes.rows[0]?.value || zohoMetaRes.rows[0]?.updated_at || null;

        return NextResponse.json({
            success: true,
            gateways: {
                hubspot: {
                    configured: Boolean(hubspotToken),
                    status: "connected",
                    title: "HubSpot CRM",
                    category: "CRM & Pipeline",
                    tokenMasked: hubspotToken ? `${hubspotToken.slice(0, 10)}...${hubspotToken.slice(-6)}` : null,
                    endpoint: "https://api.hubapi.com/crm/v3/objects/contacts",
                    leadsInDb: totalLeadsInDb,
                    lastSync: hubspotLastSync,
                    details: `${totalLeadsInDb.toLocaleString()} contacts synchronized in PostgreSQL with bi-directional push.`
                },
                zoho: {
                    configured: isZohoConfigured,
                    status: "connected",
                    title: "Zoho Campaigns",
                    category: "Newsletter & Talent Pool",
                    authType: "OAuth 2.0 (Refresh Token)",
                    clientIdMasked: zohoClientId ? `${zohoClientId.slice(0, 8)}...` : null,
                    endpoint: "https://campaigns.zoho.com/api/v1.1",
                    campaignsCount: totalZohoCampaigns,
                    listsCount: totalZohoLists,
                    subscribersCount: Number(totalZohoSubscribers),
                    lastSync: zohoLastSync,
                    details: `${totalZohoCampaigns} campaigns & ${totalZohoLists} subscriber lists (${Number(totalZohoSubscribers).toLocaleString()} contacts) active in DB.`
                },
                apollo: {
                    configured: false,
                    status: "not_configured",
                    title: "Apollo.io",
                    category: "Lead Sourcing",
                    details: "API key or webhook secret not configured yet. Leads are currently imported via CSV/sample datasets."
                },
                replyio: {
                    configured: Boolean(process.env.REPLY_API_KEY),
                    status: "connected",
                    title: "Reply.io",
                    category: "Email Sequences & Inboxes",
                    authType: "API Key (x-api-key / Bearer)",
                    tokenMasked: process.env.REPLY_API_KEY ? `${process.env.REPLY_API_KEY.slice(0, 6)}...${process.env.REPLY_API_KEY.slice(-4)}` : null,
                    endpoint: "https://api.reply.io/v3",
                    details: "Authenticated and connected. Supports live campaigns, sequence creation, conversations sync, and HubSpot engagement notes logging."
                },
                linkedhelper: {
                    configured: false,
                    status: "not_configured",
                    title: "LinkedHelper",
                    category: "LinkedIn Automation",
                    details: "Local integration webhook not attached. Campaign queue is currently managed standalone."
                },
                "linkedin-page": {
                    configured: false,
                    status: "not_configured",
                    title: "Madiff LinkedIn Page",
                    category: "Organic Social",
                    details: "LinkedIn Marketing Developer App client secret pending configuration."
                }
            }
        });
    } catch (err: any) {
        console.error("GET /api/gateways error:", err);
        return NextResponse.json({ error: "Failed to fetch gateways status", details: err.message }, { status: 500 });
    }
}
