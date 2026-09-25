import { NextResponse } from "next/server";
import { runFullScheduledSync } from "@/lib/sync/orchestrator";
import { initDailySyncScheduler, getSchedulerStatus } from "@/lib/sync/scheduler";
import pool, { initDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Ensure scheduler is armed when this route or server starts
initDailySyncScheduler();

/**
 * GET /api/sync/orchestrator
 * Returns:
 * - Scheduler status (Active, Target: 09:00 AM Daily, Next Run timestamp, Hours remaining)
 * - Last 10 automated sync runs with step details, duration, and status
 */
export async function GET() {
    try {
        await initDb();
        initDailySyncScheduler();

        const scheduler = getSchedulerStatus();

        const logsRes = await pool.query(`
            SELECT id, started_at, completed_at, status, trigger_source, steps, summary, error
            FROM scheduled_sync_logs
            ORDER BY started_at DESC
            LIMIT 10;
        `);

        return NextResponse.json({
            success: true,
            scheduler,
            history: logsRes.rows,
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: "Failed to fetch scheduler status", details: err.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/sync/orchestrator
 * Allows manual trigger of the full pipeline (or test run)
 * executing all sync stages in logical sequence.
 */
export async function POST(req: Request) {
    try {
        await initDb();
        initDailySyncScheduler();

        let triggerSource = "manual_trigger";
        try {
            const body = await req.json();
            if (body?.triggerSource) {
                triggerSource = body.triggerSource;
            }
        } catch {
            // body is optional
        }

        const result = await runFullScheduledSync(triggerSource);

        return NextResponse.json({
            success: true,
            message: "Automated pipeline synchronization completed successfully.",
            result,
        });
    } catch (err: any) {
        return NextResponse.json(
            {
                success: false,
                error: err.message || "Failed to execute synchronized pipeline",
            },
            { status: 500 }
        );
    }
}
