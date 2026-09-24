import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: "Lead ID required" }, { status: 400 });
    }

    try {
        await initDb();
        const body = await request.json();

        // 1. Fetch current lead state to accurately compare which fields actually changed
        const currentRes = await pool.query("SELECT * FROM leads WHERE id = $1", [id]);
        if (currentRes.rowCount === 0) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }
        const current = currentRes.rows[0];

        // Mapping from payload property names to database columns
        const fieldMapping: Record<string, string> = {
            name: "contact_name",
            title: "title",
            email: "email",
            phone: "phone",
            company: "company_name",
            leadStatus: "lead_status",
            lifecycleStage: "lifecycle_stage",
            contactOwner: "contact_owner",
            location: "location",
            websiteUrl: "website_url",
            linkedinUrl: "linkedin_url",
            campaign: "campaign",
            technology: "technology",
            role: "role",
            typeOfResponse: "type_of_response",
            companyDomainName: "company_domain_name",
            notes: "notes",
        };

        const updates: string[] = [];
        const values: any[] = [];
        const changedColumns: string[] = [];
        let valIndex = 1;

        for (const [key, col] of Object.entries(fieldMapping)) {
            if (key in body) {
                const newVal = body[key];
                const oldVal = current[col];

                // Check if value actually changed
                const isChanged =
                    key === "notes"
                        ? JSON.stringify(newVal || []) !== JSON.stringify(oldVal || [])
                        : String(newVal ?? "") !== String(oldVal ?? "");

                if (key === "notes") {
                    updates.push(`${col} = $${valIndex}::jsonb`);
                    values.push(JSON.stringify(newVal || []));
                } else {
                    updates.push(`${col} = $${valIndex}`);
                    values.push(newVal || null);
                }
                valIndex++;

                if (isChanged) {
                    changedColumns.push(col);
                }
            }
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: "No fields provided to update" }, { status: 400 });
        }

        // Only mark pending_push if columns actually changed
        if (changedColumns.length > 0) {
            updates.push(`sync_status = 'pending_push'`);
            updates.push(`dirty_fields = (
                SELECT COALESCE(jsonb_agg(DISTINCT elem), '[]'::jsonb) 
                FROM (
                    SELECT jsonb_array_elements_text(dirty_fields) as elem FROM leads WHERE id = $${valIndex}
                    UNION 
                    SELECT unnest($${valIndex + 1}::text[]) as elem
                ) s
            )`);
            values.push(id, changedColumns);
            valIndex += 2;
        }

        updates.push(`updated_at = NOW()`);
        values.push(id);

        const sql = `
            UPDATE leads 
            SET ${updates.join(", ")}
            WHERE id = $${valIndex}
            RETURNING *;
        `;

        const res = await pool.query(sql, values);

        return NextResponse.json({
            success: true,
            lead: res.rows[0],
            changedColumns,
            message: changedColumns.length > 0 
                ? "Lead updated and marked as pending push to HubSpot"
                : "No fields modified",
        });
    } catch (err: any) {
        console.error("PATCH /api/leads/[id] error:", err);
        return NextResponse.json(
            { error: "Failed to update lead", message: err.message },
            { status: 500 }
        );
    }
}
