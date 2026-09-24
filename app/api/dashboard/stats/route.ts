import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";

export async function GET() {
    try {
        await initDb();

        // 1. KPI Counts
        const kpiRes = await pool.query(`
            SELECT 
                count(*)::int as total_contacts,
                count(distinct company_name)::int as unique_companies,
                count(*) filter (where email is not null and email != '' and email != 'No email on file')::int as with_email,
                count(*) filter (where linkedin_url is not null and linkedin_url != '')::int as with_linkedin,
                count(*) filter (where company_domain_name is not null and company_domain_name != '')::int as with_domain,
                count(*) filter (where replied is not null and replied != '' and replied != 'No' and replied != '0')::int as with_replied
            FROM leads;
        `);
        const kpi = kpiRes.rows[0] || {};

        // 2. Monthly Creation Trend (Last 12-14 active months)
        const monthlyRes = await pool.query(`
            SELECT 
                to_char(created_at, 'Mon YY') as label,
                to_char(created_at, 'YYYY-MM') as month_key,
                count(*)::int as count 
            FROM leads 
            WHERE created_at IS NOT NULL 
            GROUP BY month_key, label 
            ORDER BY month_key ASC;
        `);

        // 3. Contacts per Owner (Histogram)
        const ownersRes = await pool.query(`
            SELECT 
                coalesce(nullif(contact_owner, ''), 'Unassigned') as owner, 
                count(*)::int as count 
            FROM leads 
            GROUP BY owner 
            ORDER BY count DESC 
            LIMIT 7;
        `);

        // 4. Contacts per Campaign (only contacts that have a campaign assigned)
        const campaignsRes = await pool.query(`
            SELECT 
                campaign, 
                count(*)::int as count 
            FROM leads 
            WHERE campaign IS NOT NULL AND TRIM(campaign) != '' AND campaign != 'Direct / Inbound'
            GROUP BY campaign 
            ORDER BY count DESC 
            LIMIT 10;
        `);

        // 5. Lifecycle Stages Breakdown
        const stagesRes = await pool.query(`
            SELECT 
                coalesce(nullif(lifecycle_stage, ''), 'lead') as stage, 
                count(*)::int as count 
            FROM leads 
            GROUP BY stage 
            ORDER BY count DESC;
        `);

        // 6. Channel Presence Breakdown
        const channelsRes = await pool.query(`
            SELECT
                count(*) filter (where (channels->'hubspot'->>'active')::boolean = true)::int as hubspot_count,
                count(*) filter (where (channels->'reply'->>'active')::boolean = true)::int as reply_count,
                count(*) filter (where (channels->'linkedhelper'->>'active')::boolean = true)::int as linkedhelper_count,
                count(*) filter (where (channels->'zoho'->>'active')::boolean = true)::int as zoho_count
            FROM leads;
        `);

        return NextResponse.json({
            kpi: {
                totalContacts: kpi.total_contacts || 0,
                uniqueCompanies: kpi.unique_companies || 0,
                withEmail: kpi.with_email || 0,
                withLinkedin: kpi.with_linkedin || 0,
                withDomain: kpi.with_domain || 0,
                withReplied: kpi.with_replied || 0,
            },
            monthlyTrend: monthlyRes.rows,
            contactsByOwner: ownersRes.rows,
            contactsByCampaign: campaignsRes.rows,
            stages: stagesRes.rows,
            channels: channelsRes.rows[0] || {},
        });
    } catch (err: any) {
        console.error("GET /api/dashboard/stats error:", err);
        return NextResponse.json(
            { error: "Failed to fetch dashboard statistics", message: err.message },
            { status: 500 }
        );
    }
}
