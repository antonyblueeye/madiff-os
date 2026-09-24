import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";
import { getReplyCampaigns, getReplyEmailAccounts } from "@/lib/reply";

export async function GET() {
    try {
        await initDb();
        const campaigns = await getReplyCampaigns();
        const emailAccounts = await getReplyEmailAccounts();

        return NextResponse.json({
            success: true,
            campaigns,
            emailAccounts,
        });
    } catch (err: any) {
        console.error("GET /api/reply/campaigns error:", err);
        return NextResponse.json(
            { error: "Failed to fetch Reply.io campaigns", details: err.message },
            { status: 500 }
        );
    }
}
