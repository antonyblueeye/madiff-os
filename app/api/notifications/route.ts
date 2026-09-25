import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await initDb();

        const notifications: any[] = [];

        // 1. Fetch recent webhook events from LinkedHelper
        const lhEventsRes = await pool.query(`
            SELECT id, event_type, campaign_name, full_name, company, created_at
            FROM linkedhelper_events
            ORDER BY created_at DESC
            LIMIT 10;
        `);

        for (const e of lhEventsRes.rows) {
            const timeAgo = formatTimeAgo(e.created_at);
            notifications.push({
                id: `lh_${e.id}`,
                type: "webhook",
                source: "LinkedHelper",
                title: e.event_type === "created_lead" ? "New Lead Captured" : "Lead Webhook Received",
                description: `${e.full_name || "Lead"} (${e.company || "No company"}) captured from sequence '${e.campaign_name || "Network"}'`,
                time: timeAgo,
                rawDate: e.created_at,
                read: false,
                status: "success",
            });
        }

        // 2. Fetch recent scheduled or manual sync runs
        const syncLogsRes = await pool.query(`
            SELECT id, started_at, completed_at, status, trigger_source, summary, error
            FROM scheduled_sync_logs
            ORDER BY started_at DESC
            LIMIT 5;
        `);

        for (const s of syncLogsRes.rows) {
            const timeAgo = formatTimeAgo(s.started_at);
            const isSuccess = s.status === "success";
            notifications.push({
                id: `sync_${s.id}`,
                type: "sync",
                source: "System Orchestrator",
                title: isSuccess ? "Sync Pipeline Completed" : "Sync Run Failed",
                description: s.summary || s.error || "Automated sync pipeline execution",
                time: timeAgo,
                rawDate: s.started_at,
                read: false,
                status: isSuccess ? "info" : "error",
            });
        }

        // 3. Fetch recently synced / pushed contacts
        const pushedRes = await pool.query(`
            SELECT id, contact_name, company_name, campaign, updated_at
            FROM leads
            WHERE sync_status = 'synced' AND hubspot_id IS NOT NULL
            ORDER BY updated_at DESC
            LIMIT 10;
        `);

        for (const p of pushedRes.rows) {
            notifications.push({
                id: `lead_push_${p.id}`,
                type: "push",
                source: "HubSpot CRM",
                title: "Contact Synced to HubSpot",
                description: `${p.contact_name} (${p.company_name || "Madiff Lead"}) synchronized with campaign '${p.campaign || "Network"}'`,
                time: formatTimeAgo(p.updated_at),
                rawDate: p.updated_at,
                read: false,
                status: "accent",
            });
        }

        // Sort all chronologically descending
        notifications.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());

        return NextResponse.json({
            success: true,
            notifications: notifications.slice(0, 20),
            unreadCount: Math.min(notifications.length, 9),
        });
    } catch (err: any) {
        console.error("GET /api/notifications error:", err);
        return NextResponse.json(
            { error: "Failed to fetch notifications", message: err.message },
            { status: 500 }
        );
    }
}

function formatTimeAgo(dateStr: string | Date | null | undefined): string {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
}
