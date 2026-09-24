import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";
import { getZohoAccessToken } from "@/lib/zoho";

export async function POST(request: Request) {
    try {
        await initDb();
        const { accessToken } = await getZohoAccessToken();

        // 1. Fetch all recent campaigns
        const campUrl = `https://campaigns.zoho.com/api/v1.1/recentcampaigns?resfmt=JSON&range=100`;
        const campRes = await fetch(campUrl, {
            headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
        });
        const campData = await campRes.json();
        const campaigns = campData.recent_campaigns || [];

        let syncedCampaignsCount = 0;

        // Process campaigns and their detailed performance reports
        for (const camp of campaigns) {
            const campKey = camp.campaign_key || camp.campaignKey;
            if (!campKey) continue;

            let report: any = {};
            try {
                // Fetch report stats for campaign
                const repUrl = `https://campaigns.zoho.com/api/v1.1/getcampaignreports?resfmt=JSON&campaignkey=${campKey}`;
                const repRes = await fetch(repUrl, {
                    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
                });
                const repData = await repRes.json();
                if (repData["campaign-reports"] && repData["campaign-reports"].length > 0) {
                    report = repData["campaign-reports"][0];
                }
            } catch (err) {
                console.warn(`Failed to fetch report for campaign ${campKey}:`, err);
            }

            const sentTime = camp.sent_time ? new Date(parseInt(camp.sent_time, 10)) : null;
            const createdTime = camp.created_time ? new Date(parseInt(camp.created_time, 10)) : null;

            const emailsSent = parseInt(report.emails_sent_count || "0", 10);
            const delivered = parseInt(report.delivered_count || "0", 10);
            const deliveredPercent = parseFloat(report.delivered_percent || "0");
            const opens = parseInt(report.opens_count || "0", 10);
            const openPercent = parseFloat(report.open_percent || "0");
            const clickPercent = parseFloat(report.unique_clicked_percent || "0");
            const bounces = parseInt(report.bounces_count || "0", 10);
            const bouncePercent = parseFloat(report.bounce_percent || "0");
            const unsubs = parseInt(report.unsubscribes_count || "0", 10);
            const unsubPercent = parseFloat(report.unsub_percent || "0");

            await pool.query(
                `
                INSERT INTO zoho_campaigns (
                    campaign_key, campaign_id, campaign_name, subject, from_email,
                    reply_to, campaign_status, sent_time, created_time, campaign_preview,
                    emails_sent_count, delivered_count, delivered_percent, opens_count,
                    open_percent, unique_clicked_percent, bounces_count, bounce_percent,
                    unsubscribes_count, unsub_percent, raw_report, synced_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                    $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW()
                )
                ON CONFLICT (campaign_key) DO UPDATE SET
                    campaign_name = EXCLUDED.campaign_name,
                    subject = EXCLUDED.subject,
                    campaign_status = EXCLUDED.campaign_status,
                    sent_time = EXCLUDED.sent_time,
                    emails_sent_count = EXCLUDED.emails_sent_count,
                    delivered_count = EXCLUDED.delivered_count,
                    delivered_percent = EXCLUDED.delivered_percent,
                    opens_count = EXCLUDED.opens_count,
                    open_percent = EXCLUDED.open_percent,
                    unique_clicked_percent = EXCLUDED.unique_clicked_percent,
                    bounces_count = EXCLUDED.bounces_count,
                    bounce_percent = EXCLUDED.bounce_percent,
                    unsubscribes_count = EXCLUDED.unsubscribes_count,
                    unsub_percent = EXCLUDED.unsub_percent,
                    raw_report = EXCLUDED.raw_report,
                    synced_at = NOW();
                `,
                [
                    campKey,
                    camp.campaignId || null,
                    camp.campaign_name || camp.subject || "Untitled Campaign",
                    camp.subject || "",
                    camp.from_email || "",
                    camp.reply_to || "",
                    camp.campaign_status || "Sent",
                    sentTime,
                    createdTime,
                    camp.campaign_preview || null,
                    emailsSent,
                    delivered,
                    deliveredPercent,
                    opens,
                    openPercent,
                    clickPercent,
                    bounces,
                    bouncePercent,
                    unsubs,
                    unsubPercent,
                    JSON.stringify(report),
                ]
            );
            syncedCampaignsCount++;

            // If campaign has clicks, fetch clicked contacts and URLs
            const isNewsletter =
                (camp.campaign_name || "").toLowerCase().includes("newsletter") ||
                (camp.subject || "").toLowerCase().includes("newsletter");

            if (isNewsletter || clickPercent > 0 || parseInt(report.clicks_count || "0", 10) > 0) {
                try {
                    const clickUrl = `https://campaigns.zoho.com/api/v1.1/getcampaignrecipientsdata?resfmt=JSON&campaignkey=${encodeURIComponent(campKey)}&action=clickedcontacts&range=100`;

                    const clickRes = await fetch(clickUrl, {
                        method: "POST",
                        headers: {
                            Authorization: `Zoho-oauthtoken ${accessToken}`,
                        },
                    });

                    const clickData = await clickRes.json().catch(() => ({}));
                    const clickedRecipients = clickData.recipients || [];
                    console.log(`Campaign "${camp.campaign_name}": found ${clickedRecipients.length} click recipients. Status: ${clickData.status}`);

                    for (const r of clickedRecipients) {
                        const email = r.contactemailaddress;
                        if (!email) continue;

                        const name = [r.contactfn, r.contactln].filter(Boolean).join(" ") || null;
                        const urlClicks = Array.isArray(r.urlclicks) ? r.urlclicks : [];

                        if (urlClicks.length > 0) {
                            for (const uc of urlClicks) {
                                const url = uc.url;
                                const count = parseInt(uc.count || "1", 10);
                                if (!url) continue;

                                await pool.query(
                                    `
                                    INSERT INTO zoho_clicks (
                                        campaign_key, campaign_name, contact_email, contact_name,
                                        clicked_url, click_count, clicked_at, synced_at
                                    ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                                    ON CONFLICT (campaign_key, contact_email, clicked_url) DO UPDATE SET
                                        click_count = EXCLUDED.click_count,
                                        contact_name = COALESCE(EXCLUDED.contact_name, zoho_clicks.contact_name),
                                        synced_at = NOW();
                                    `,
                                    [campKey, camp.campaign_name || "Newsletter", email, name, url, count]
                                );
                            }
                        } else if (r.clickedurls) {
                            // Raw string or list
                            const urls = String(r.clickedurls)
                                .replace(/[\[\]]/g, "")
                                .split(",")
                                .map((u) => u.trim())
                                .filter(Boolean);

                            for (const url of urls) {
                                await pool.query(
                                    `
                                    INSERT INTO zoho_clicks (
                                        campaign_key, campaign_name, contact_email, contact_name,
                                        clicked_url, click_count, clicked_at, synced_at
                                    ) VALUES ($1, $2, $3, $4, $5, 1, NOW(), NOW())
                                    ON CONFLICT (campaign_key, contact_email, clicked_url) DO NOTHING;
                                    `,
                                    [campKey, camp.campaign_name || "Newsletter", email, name, url]
                                );
                            }
                        }
                    }
                } catch (clickErr) {
                    console.warn(`Error fetching clicked contacts for ${campKey}:`, clickErr);
                }
            }
        }

        // 2. Fetch and sync mailing lists
        const listsUrl = `https://campaigns.zoho.com/api/v1.1/getmailinglists?resfmt=JSON`;
        const listsRes = await fetch(listsUrl, {
            headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
        });
        const listsData = await listsRes.json();
        const lists = listsData.list_of_details || [];

        let syncedListsCount = 0;
        for (const l of lists) {
            const listKey = l.listkey;
            if (!listKey) continue;

            const createdTime = l.created_time ? new Date(parseInt(l.created_time, 10)) : null;

            await pool.query(
                `
                INSERT INTO zoho_lists (
                    list_key, list_name, contacts_count, unsub_count, bounce_count, created_time, synced_at
                ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
                ON CONFLICT (list_key) DO UPDATE SET
                    list_name = EXCLUDED.list_name,
                    contacts_count = EXCLUDED.contacts_count,
                    unsub_count = EXCLUDED.unsub_count,
                    bounce_count = EXCLUDED.bounce_count,
                    synced_at = NOW();
                `,
                [
                    listKey,
                    l.listname || "Untitled List",
                    parseInt(l.noofcontacts || "0", 10),
                    parseInt(l.noofunsubcnt || "0", 10),
                    parseInt(l.noofbouncecnt || "0", 10),
                    createdTime,
                ]
            );
            syncedListsCount++;
        }

        // 3. Update sync_metadata with latest sync timestamp
        await pool.query(`
            INSERT INTO sync_metadata (key, value, updated_at)
            VALUES ('zoho_last_synced_at', NOW()::text, NOW())
            ON CONFLICT (key) DO UPDATE SET
                value = NOW()::text,
                updated_at = NOW();
        `);

        // Check how many clicks stored
        const clicksCountRes = await pool.query('SELECT COUNT(*)::int as count FROM zoho_clicks;');
        const totalClicksInDb = clicksCountRes.rows[0]?.count || 0;

        return NextResponse.json({
            success: true,
            syncedCampaignsCount,
            syncedListsCount,
            totalClicksInDb,
            syncedAt: new Date().toISOString(),
            message: `Synchronized ${syncedCampaignsCount} newsletters, ${syncedListsCount} subscriber lists, and ${totalClicksInDb} link clicks from Zoho Campaigns!`,
        });
    } catch (err: any) {
        console.error("POST /api/zoho/sync error:", err);
        return NextResponse.json(
            { error: err.message || "Failed to sync Zoho Campaigns", details: String(err) },
            { status: 500 }
        );
    }
}
