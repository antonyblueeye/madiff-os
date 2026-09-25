import { runFullScheduledSync } from "./orchestrator";
import pool, { initDb } from "@/lib/db";

declare global {
    var _madiffSchedulerStarted: boolean | undefined;
    var _madiffSchedulerTimer: NodeJS.Timeout | undefined;
}

const TARGET_HOUR = 9;   // 9:00 AM
const TARGET_MINUTE = 0; // 00 minutes

/**
 * Calculates milliseconds until the next 9:00 AM local time.
 */
function getMsUntilNext9AM(): number {
    const now = new Date();
    const next9am = new Date(now);
    next9am.setHours(TARGET_HOUR, TARGET_MINUTE, 0, 0);

    // If 9:00 AM already passed today, schedule for 9:00 AM tomorrow
    if (now.getTime() >= next9am.getTime()) {
        next9am.setDate(next9am.getDate() + 1);
    }

    return next9am.getTime() - now.getTime();
}

/**
 * Schedule loop that runs daily at 9:00 AM.
 */
function scheduleNextRun() {
    const msUntilRun = getMsUntilNext9AM();
    const nextDate = new Date(Date.now() + msUntilRun);
    console.log(`[Madiff Daily Sync Scheduler] Next automatic sync scheduled for: ${nextDate.toLocaleString()} (in ${(msUntilRun / 1000 / 60 / 60).toFixed(2)} hours)`);

    if (global._madiffSchedulerTimer) {
        clearTimeout(global._madiffSchedulerTimer);
    }

    global._madiffSchedulerTimer = setTimeout(async () => {
        console.log(`[Madiff Daily Sync Scheduler] It is 9:00 AM! Initiating automated pipeline sync...`);
        try {
            const result = await runFullScheduledSync("daily_cron_9am");
            console.log(`[Madiff Daily Sync Scheduler] Daily sync successfully completed at 9:00 AM:`, result.summary);
        } catch (e: any) {
            console.error(`[Madiff Daily Sync Scheduler] Daily sync run encountered error:`, e.message);
        } finally {
            // Re-arm for 9:00 AM tomorrow
            scheduleNextRun();
        }
    }, msUntilRun);
}

/**
 * Initializes the background scheduler once inside the Node.js / Next.js server runtime.
 */
export function initDailySyncScheduler() {
    if (global._madiffSchedulerStarted) {
        return;
    }

    global._madiffSchedulerStarted = true;
    console.log("[Madiff Daily Sync Scheduler] Initializing Daily 9:00 AM Automation Daemon...");
    scheduleNextRun();
}

export function getSchedulerStatus() {
    const ms = getMsUntilNext9AM();
    const nextDate = new Date(Date.now() + ms);
    return {
        isActive: Boolean(global._madiffSchedulerStarted),
        targetTime: "09:00 AM Daily",
        nextScheduledRun: nextDate.toISOString(),
        hoursRemaining: Number((ms / 1000 / 60 / 60).toFixed(2)),
    };
}
