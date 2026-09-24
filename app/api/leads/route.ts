import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "25", 10)));
    const offset = (page - 1) * limit;

    const querySearch = searchParams.get("search")?.trim();
    const filterName = searchParams.get("name")?.trim();
    const filterEmail = searchParams.get("email")?.trim();
    const filterCompany = searchParams.get("company")?.trim();
    const filterOwner = searchParams.get("owner")?.trim();
    const filterLifecycleStage = searchParams.get("lifecycleStage")?.trim();
    const filterCampaign = searchParams.get("campaign")?.trim();
    const filterChannel = searchParams.get("channel")?.trim();
    const filterDateFrom = searchParams.get("dateFrom")?.trim();
    const filterDateTo = searchParams.get("dateTo")?.trim();

    try {
        await initDb();

        const conditions: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        if (querySearch) {
            conditions.push(
                `(contact_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR company_name ILIKE $${paramIndex} OR title ILIKE $${paramIndex})`
            );
            params.push(`%${querySearch}%`);
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

        if (filterCampaign && filterCampaign !== "All") {
            conditions.push(`campaign = $${paramIndex}`);
            params.push(filterCampaign);
            paramIndex++;
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

        // Count total matching
        const countQuery = `SELECT COUNT(*) AS total FROM leads ${whereClause}`;
        const countRes = await pool.query(countQuery, params);
        const totalCount = parseInt(countRes.rows[0]?.total || "0", 10);

        // Fetch distinct owners and campaigns for filter dropdowns
        const filterMetaQuery = `
            SELECT 
                ARRAY_AGG(DISTINCT contact_owner) FILTER (WHERE contact_owner IS NOT NULL AND contact_owner != 'Unassigned') AS owners,
                ARRAY_AGG(DISTINCT lifecycle_stage) FILTER (WHERE lifecycle_stage IS NOT NULL) AS stages,
                ARRAY_AGG(DISTINCT campaign) FILTER (WHERE campaign IS NOT NULL AND TRIM(campaign) != '' AND campaign != 'Direct / Inbound') AS campaigns
            FROM leads;
        `;
        const metaRes = await pool.query(filterMetaQuery);
        const availableOwners = metaRes.rows[0]?.owners || [];
        const availableStages = metaRes.rows[0]?.stages || [];
        const availableCampaigns = metaRes.rows[0]?.campaigns || [];

        // Count pending push to HubSpot
        const pendingCountRes = await pool.query(
            "SELECT COUNT(*)::int AS count FROM leads WHERE sync_status = 'pending_push';"
        );
        const pendingPushCount = pendingCountRes.rows[0]?.count || 0;

        // Fetch paginated leads
        const leadsQuery = `
            SELECT 
                id,
                hubspot_id AS "hubspotId",
                contact_name AS "name",
                title,
                email,
                phone,
                company_name AS "company",
                lead_status AS "leadStatus",
                lifecycle_stage AS "lifecycleStage",
                contact_owner AS "contactOwner",
                linkedin_connection_status AS "linkedinConnectionStatus",
                linkedin_account AS "linkedinAccount",
                location,
                website_url AS "websiteUrl",
                linkedin_url AS "linkedinUrl",
                replied,
                campaign,
                email_status AS "emailStatus",
                technology,
                role,
                type_of_response AS "typeOfResponse",
                company_domain_name AS "companyDomainName",
                sync_status AS "syncStatus",
                dirty_fields AS "dirtyFields",
                channels,
                notes,
                timeline,
                reply_conversations AS "replyConversations",
                TO_CHAR(created_at, 'YYYY-MM-DD') AS "createdDate"
            FROM leads
            ${whereClause}
            ORDER BY (sync_status = 'pending_push') DESC, created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
        `;
        params.push(limit, offset);

        const leadsRes = await pool.query(leadsQuery, params);

        return NextResponse.json({
            leads: leadsRes.rows,
            totalCount,
            page,
            limit,
            availableOwners,
            availableStages,
            availableCampaigns,
            pendingPushCount,
        });
    } catch (err: any) {
        console.error("GET /api/leads error:", err);
        return NextResponse.json(
            { error: "Failed to fetch leads", details: err.message },
            { status: 500 }
        );
    }
}
