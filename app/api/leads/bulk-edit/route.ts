import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Bulk update selected leads
 * Request body:
 * {
 *   leadIds: string[],
 *   updates: {
 *     campaign?: string,
 *     contactOwner?: string,
 *     lifecycleStage?: string,
 *     leadStatus?: string,
 *     linkedinConnectionStatus?: string,
 *     replied?: string,
 *     typeOfResponse?: string,
 *     technology?: string,
 *     role?: string,
 *   }
 * }
 */
export async function POST(req: Request) {
    try {
        await initDb();
        const body = await req.json();
        const { leadIds, updates } = body;

        if (!Array.isArray(leadIds) || leadIds.length === 0) {
            return NextResponse.json({ error: "No lead IDs provided" }, { status: 400 });
        }

        if (!updates || typeof updates !== "object" || Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No update fields provided" }, { status: 400 });
        }

        const setClauses: string[] = [];
        const params: any[] = [];
        let pIdx = 1;

        const updatedColumns: string[] = [];
        if (updates.campaign !== undefined) {
            setClauses.push(`campaign = $${pIdx++}`);
            params.push(updates.campaign);
            updatedColumns.push("campaign");
        }
        if (updates.contactOwner !== undefined) {
            setClauses.push(`contact_owner = $${pIdx++}`);
            params.push(updates.contactOwner);
            updatedColumns.push("contact_owner");
        }
        if (updates.lifecycleStage !== undefined) {
            setClauses.push(`lifecycle_stage = $${pIdx++}`);
            params.push(updates.lifecycleStage);
            updatedColumns.push("lifecycle_stage");
        }
        if (updates.leadStatus !== undefined) {
            setClauses.push(`lead_status = $${pIdx++}`);
            params.push(updates.leadStatus);
            updatedColumns.push("lead_status");
        }
        if (updates.linkedinConnectionStatus !== undefined) {
            setClauses.push(`linkedin_connection_status = $${pIdx++}`);
            params.push(updates.linkedinConnectionStatus);
            updatedColumns.push("linkedin_connection_status");
        }
        if (updates.replied !== undefined) {
            setClauses.push(`replied = $${pIdx++}`);
            params.push(updates.replied);
            updatedColumns.push("replied");
        }
        if (updates.typeOfResponse !== undefined) {
            setClauses.push(`type_of_response = $${pIdx++}`);
            params.push(updates.typeOfResponse);
            updatedColumns.push("type_of_response");
        }
        if (updates.technology !== undefined) {
            setClauses.push(`technology = $${pIdx++}`);
            params.push(updates.technology);
            updatedColumns.push("technology");
        }
        if (updates.role !== undefined) {
            setClauses.push(`role = $${pIdx++}`);
            params.push(updates.role);
            updatedColumns.push("role");
        }

        if (setClauses.length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        // Track dirty fields so push knows which attributes changed
        setClauses.push(`dirty_fields = (
            SELECT COALESCE(jsonb_agg(DISTINCT elem), '[]'::jsonb)
            FROM jsonb_array_elements_text(COALESCE(dirty_fields, '[]'::jsonb) || $${pIdx++}::jsonb) AS elem
        )`);
        params.push(JSON.stringify(updatedColumns));

        // Mark sync_status = 'pending_push' so changes can be synced to HubSpot if desired
        setClauses.push(`sync_status = 'pending_push'`);
        setClauses.push(`updated_at = NOW()`);

        // Add leadIds param
        params.push(leadIds);
        const query = `
            UPDATE leads
            SET ${setClauses.join(", ")}
            WHERE id = ANY($${pIdx}::varchar[])
            RETURNING id;
        `;

        const res = await pool.query(query, params);

        return NextResponse.json({
            success: true,
            updatedCount: res.rowCount,
            updatedLeadIds: res.rows.map((r: any) => r.id),
            message: `Successfully updated ${res.rowCount} lead(s)`,
        });
    } catch (err: any) {
        console.error("POST /api/leads/bulk-edit error:", err);
        return NextResponse.json(
            { error: "Failed to perform bulk edit", details: err?.message },
            { status: 500 }
        );
    }
}
