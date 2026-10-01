import { NextRequest, NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";
import { executeEngineWorkflow } from "@/lib/engine-orchestrator";
import { getReplyCampaigns } from "@/lib/reply";

// GET /api/engines - List all engines & campaigns
export async function GET(req: NextRequest) {
    try {
        await initDb();
        const client = await pool.connect();
        try {
            const enginesRes = await client.query(`
                SELECT e.*, 
                       (SELECT json_agg(r ORDER BY r.started_at DESC) 
                        FROM (SELECT * FROM engine_runs WHERE engine_id = e.id ORDER BY started_at DESC LIMIT 5) r
                       ) as recent_runs
                FROM outbound_engines e
                ORDER BY e.created_at DESC
            `);

            // Fetch reply campaigns for dropdown
            let replyCampaigns: any[] = [];
            try {
                replyCampaigns = await getReplyCampaigns();
            } catch (rErr) {
                console.warn("Could not fetch Reply campaigns:", rErr);
            }

            return NextResponse.json({
                success: true,
                engines: enginesRes.rows,
                replyCampaigns,
            });
        } finally {
            client.release();
        }
    } catch (err: any) {
        console.error("GET /api/engines error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// POST /api/engines - Create a new outbound engine OR trigger run
export async function POST(req: NextRequest) {
    try {
        await initDb();
        const body = await req.json();

        // If action is "run", execute workflow immediately
        if (body.action === "run" && body.engineId) {
            const result = await executeEngineWorkflow(Number(body.engineId));
            return NextResponse.json({ success: true, runResult: result });
        }

        // If action is "toggle_status"
        if (body.action === "toggle_status" && body.engineId) {
            const client = await pool.connect();
            try {
                const current = await client.query(`SELECT status FROM outbound_engines WHERE id = $1`, [body.engineId]);
                const nextStatus = current.rows[0]?.status === "active" ? "paused" : "active";
                await client.query(`UPDATE outbound_engines SET status = $1, updated_at = NOW() WHERE id = $2`, [nextStatus, body.engineId]);
                return NextResponse.json({ success: true, status: nextStatus });
            } finally {
                client.release();
            }
        }

        // Otherwise create new Engine
        const {
            name,
            targetRole,
            roleDescription,
            scrapeKeywords = [],
            scrapeLocation = "Poland",
            targetTitles = [],
            targetIndustries = [],
            employeeRanges = [],
            leadsPerRun = 25,
            replyCampaignId = null,
            replyCampaignName = null,
            emailSubject = null,
            emailBody = null,
            frequency = "daily",
        } = body;

        if (!name || !targetRole || !roleDescription) {
            return NextResponse.json(
                { success: false, error: "Name, Target Role, and Role Description are required." },
                { status: 400 }
            );
        }

        const client = await pool.connect();
        try {
            const insertRes = await client.query(
                `INSERT INTO outbound_engines (
                    name, target_role, role_description, scrape_keywords,
                    scrape_location, target_titles, target_industries,
                    employee_ranges, leads_per_run, reply_campaign_id,
                    reply_campaign_name, email_subject, email_body,
                    frequency, status, stats
                ) VALUES (
                    $1, $2, $3, $4,
                    $5, $6, $7,
                    $8, $9, $10,
                    $11, $12, $13,
                    $14, 'active', '{"totalScraped":0,"aiApproved":0,"aiRejected":0,"leadsFound":0,"pushedToReply":0}'::jsonb
                ) RETURNING *`,
                [
                    name.trim(),
                    targetRole.trim(),
                    roleDescription.trim(),
                    scrapeKeywords,
                    scrapeLocation,
                    targetTitles,
                    targetIndustries,
                    employeeRanges,
                    Number(leadsPerRun) || 25,
                    replyCampaignId ? Number(replyCampaignId) : null,
                    replyCampaignName,
                    emailSubject,
                    emailBody,
                    frequency || "daily",
                ]
            );

            const newEngine = insertRes.rows[0];

            // If user checked "Run immediately upon creation"
            let initialRunResult = null;
            if (body.runImmediately) {
                initialRunResult = await executeEngineWorkflow(newEngine.id);
            }

            return NextResponse.json({
                success: true,
                engine: newEngine,
                initialRunResult,
            });
        } finally {
            client.release();
        }
    } catch (err: any) {
        console.error("POST /api/engines error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// DELETE /api/engines?id=xxx - Delete an engine
export async function DELETE(req: NextRequest) {
    try {
        await initDb();
        const { searchParams } = new URL(req.url);
        const engineId = searchParams.get("id");

        if (!engineId) {
            return NextResponse.json({ success: false, error: "engineId is required" }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            await client.query(`DELETE FROM outbound_engines WHERE id = $1`, [engineId]);
            return NextResponse.json({ success: true, message: "Engine deleted successfully" });
        } finally {
            client.release();
        }
    } catch (err: any) {
        console.error("DELETE /api/engines error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
