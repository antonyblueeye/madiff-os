import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Helper to escape CSV cell value
 */
function escapeCsvCell(val: any): string {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

/**
 * GET /api/leads/export-csv
 * Exports all currently filtered leads matching query parameters to a downloadable CSV
 */
export async function GET(request: Request) {
    try {
        await initDb();
        const { searchParams } = new URL(request.url);

        const searchQuery = searchParams.get("search")?.trim() || "";
        const filterName = searchParams.get("name")?.trim() || "";
        const filterEmail = searchParams.get("email")?.trim() || "";
        const filterCompany = searchParams.get("company")?.trim() || "";
        const filterTitle = searchParams.get("title")?.trim() || "";
        const filterLocation = searchParams.get("location")?.trim() || "";
        const filterOwner = searchParams.get("owner")?.trim() || "";
        const filterLifecycleStage = searchParams.get("lifecycleStage")?.trim() || "";
        const filterLeadStatus = searchParams.get("leadStatus")?.trim() || "";
        const filterCampaign = searchParams.get("campaign")?.trim() || "";
        const filterChannel = searchParams.get("channel")?.trim() || "";
        const filterConnectionStatus = searchParams.get("connectionStatus")?.trim() || "";
        const filterReplied = searchParams.get("replied")?.trim() || "";
        const filterDateFrom = searchParams.get("dateFrom")?.trim() || "";
        const filterDateTo = searchParams.get("dateTo")?.trim() || "";

        // Build SQL conditions exactly matching /api/leads
        const conditions: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        if (searchQuery) {
            conditions.push(`(
                contact_name ILIKE $${paramIndex} OR 
                email ILIKE $${paramIndex} OR 
                company_name ILIKE $${paramIndex} OR 
                title ILIKE $${paramIndex} OR 
                location ILIKE $${paramIndex}
            )`);
            params.push(`%${searchQuery}%`);
            paramIndex++;
        }

        if (filterName) {
            conditions.push(`contact_name ILIKE $${paramIndex}`);
            params.push(`%${filterName}%`);
            paramIndex++;
        }

        if (filterEmail) {
            conditions.push(`email ILIKE $${paramIndex}`);
            params.push(`%${filterEmail}%`);
            paramIndex++;
        }

        if (filterCompany) {
            conditions.push(`company_name ILIKE $${paramIndex}`);
            params.push(`%${filterCompany}%`);
            paramIndex++;
        }

        if (filterTitle) {
            conditions.push(`title ILIKE $${paramIndex}`);
            params.push(`%${filterTitle}%`);
            paramIndex++;
        }

        if (filterLocation) {
            conditions.push(`location ILIKE $${paramIndex}`);
            params.push(`%${filterLocation}%`);
            paramIndex++;
        }

        if (filterOwner && filterOwner !== "All") {
            conditions.push(`contact_owner = $${paramIndex}`);
            params.push(filterOwner);
            paramIndex++;
        }

        if (filterLifecycleStage && filterLifecycleStage !== "All") {
            conditions.push(`lifecycle_stage = $${paramIndex}`);
            params.push(filterLifecycleStage);
            paramIndex++;
        }

        if (filterLeadStatus && filterLeadStatus !== "All") {
            conditions.push(`lead_status = $${paramIndex}`);
            params.push(filterLeadStatus);
            paramIndex++;
        }

        if (filterCampaign && filterCampaign !== "All") {
            conditions.push(`campaign = $${paramIndex}`);
            params.push(filterCampaign);
            paramIndex++;
        }

        if (filterConnectionStatus && filterConnectionStatus !== "All") {
            conditions.push(`linkedin_connection_status ILIKE $${paramIndex}`);
            params.push(filterConnectionStatus);
            paramIndex++;
        }

        if (filterReplied && filterReplied !== "All") {
            if (filterReplied.toLowerCase() === "yes") {
                conditions.push(`(replied = 'true' OR replied = 'Yes')`);
            } else if (filterReplied.toLowerCase() === "no") {
                conditions.push(`(replied IS NULL OR replied = 'false' OR replied = 'No')`);
            }
        }

        if (filterChannel && filterChannel !== "All") {
            conditions.push(`channels->'${filterChannel}'->>'active' = 'true'`);
        }

        if (filterDateFrom) {
            conditions.push(`created_at >= $${paramIndex}`);
            params.push(filterDateFrom);
            paramIndex++;
        }

        if (filterDateTo) {
            conditions.push(`created_at <= $${paramIndex}`);
            params.push(filterDateTo);
            paramIndex++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const query = `
            SELECT 
                contact_name,
                email,
                title,
                company_name,
                company_domain_name,
                phone,
                location,
                linkedin_url,
                contact_owner,
                lead_status,
                lifecycle_stage,
                campaign,
                replied,
                technology,
                role,
                sync_status,
                hubspot_id,
                TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
            FROM leads
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT 50000;
        `;

        const res = await pool.query(query, params);
        const rows = res.rows;

        // CSV Headers
        const headers = [
            "Full Name",
            "Email Address",
            "Job Title",
            "Company Name",
            "Company Domain",
            "Phone",
            "Location",
            "LinkedIn URL",
            "Contact Owner",
            "Lead Status",
            "Lifecycle Stage",
            "Campaign",
            "Replied",
            "Technology",
            "Role",
            "HubSpot ID",
            "Sync Status",
            "Created Date",
        ];

        const csvLines = [headers.join(",")];

        for (const r of rows) {
            const rowValues = [
                escapeCsvCell(r.contact_name),
                escapeCsvCell(r.email),
                escapeCsvCell(r.title),
                escapeCsvCell(r.company_name),
                escapeCsvCell(r.company_domain_name),
                escapeCsvCell(r.phone),
                escapeCsvCell(r.location),
                escapeCsvCell(r.linkedin_url),
                escapeCsvCell(r.contact_owner),
                escapeCsvCell(r.lead_status),
                escapeCsvCell(r.lifecycle_stage),
                escapeCsvCell(r.campaign),
                escapeCsvCell(r.replied === "true" || r.replied === "Yes" ? "Yes" : "No"),
                escapeCsvCell(r.technology),
                escapeCsvCell(r.role),
                escapeCsvCell(r.hubspot_id),
                escapeCsvCell(r.sync_status),
                escapeCsvCell(r.created_at),
            ];
            csvLines.push(rowValues.join(","));
        }

        const csvContent = csvLines.join("\r\n");
        const filename = `crm_leads_export_${new Date().toISOString().split("T")[0]}.csv`;

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "no-store, max-age=0",
            },
        });
    } catch (err: any) {
        console.error("GET /api/leads/export-csv error:", err);
        return NextResponse.json(
            { error: "Failed to export leads to CSV", details: err.message },
            { status: 500 }
        );
    }
}
