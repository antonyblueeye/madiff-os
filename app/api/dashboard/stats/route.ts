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

        // 6. Real Channel Presence Breakdown (HubSpot, LinkedHelper, Apollo)
        const channelsRes = await pool.query(`
            SELECT
                count(*) filter (where hubspot_id is not null or (channels->'hubspot'->>'active')::boolean = true)::int as hubspot_count,
                count(*) filter (where channels->'linkedhelper'->>'active' = 'true' or id like 'lh_%')::int as linkedhelper_count,
                count(*) filter (where channels->'apollo'->>'active' = 'true' or id like 'apollo_%' or id like 'ap-%')::int as apollo_count,
                count(*) filter (where channels->'reply'->>'active' = 'true' or id like 'reply_%')::int as reply_count
            FROM leads;
        `);

        // 7. Messaging & Reply Analytics
        const commsRes = await pool.query(`
            SELECT 
                coalesce(sum(jsonb_array_length(reply_conversations)), 0)::int as reply_messages_total,
                coalesce(sum(jsonb_array_length(linkedin_conversations)), 0)::int as linkedin_messages_total,
                count(*) filter (where replied = 'true' or replied = 'Yes')::int as total_replied_leads,
                count(*) filter (where id like 'lh_%' or channels->'linkedhelper'->>'active' = 'true')::int as total_linkedin_leads,
                count(*) filter (where (id like 'lh_%' or channels->'linkedhelper'->>'active' = 'true') and (replied = 'true' or replied = 'Yes'))::int as linkedin_replied_leads,
                count(*) filter (where id like 'reply_%' or channels->'reply'->>'active' = 'true')::int as total_email_leads,
                count(*) filter (where (id like 'reply_%' or channels->'reply'->>'active' = 'true') and (replied = 'true' or replied = 'Yes'))::int as email_replied_leads
            FROM leads;
        `);
        const comms = commsRes.rows[0] || {};
        const totalMessages = (comms.reply_messages_total || 0) + (comms.linkedin_messages_total || 0);
        const totalOutboundLeads = (comms.total_linkedin_leads || 0) + (comms.total_email_leads || 0);
        const overallReplyRate = totalOutboundLeads > 0 
            ? ((comms.total_replied_leads / totalOutboundLeads) * 100).toFixed(1) 
            : "0.0";

        // 8. Recent Responses / Messages preview (both LinkedIn & Reply.io)
        const recentResponsesRes = await pool.query(`
            SELECT 
                id,
                contact_name as "name",
                title,
                company_name as "company",
                email,
                replied,
                type_of_response as "typeOfResponse",
                campaign,
                reply_conversations as "replyConversations",
                linkedin_conversations as "linkedinConversations",
                TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI') as "updatedAt"
            FROM leads
            WHERE (replied = 'true' OR replied = 'Yes' 
                   OR jsonb_array_length(coalesce(reply_conversations, '[]'::jsonb)) > 0 
                   OR jsonb_array_length(coalesce(linkedin_conversations, '[]'::jsonb)) > 0)
            ORDER BY updated_at DESC
            LIMIT 50;
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
            channels: {
                hubspot_count: channelsRes.rows[0]?.hubspot_count || 0,
                linkedhelper_count: channelsRes.rows[0]?.linkedhelper_count || 0,
                apollo_count: channelsRes.rows[0]?.apollo_count || 0,
                reply_count: channelsRes.rows[0]?.reply_count || 0,
            },
            messaging: {
                totalMessages,
                replyMessagesTotal: comms.reply_messages_total || 0,
                linkedinMessagesTotal: comms.linkedin_messages_total || 0,
                totalRepliedLeads: comms.total_replied_leads || 0,
                overallReplyRate,
                linkedinReplyRate: comms.total_linkedin_leads > 0 
                    ? ((comms.linkedin_replied_leads / comms.total_linkedin_leads) * 100).toFixed(1) 
                    : "0.0",
                emailReplyRate: comms.total_email_leads > 0 
                    ? ((comms.email_replied_leads / comms.total_email_leads) * 100).toFixed(1) 
                    : "0.0",
            },
            recentResponses: recentResponsesRes.rows,
        });
    } catch (err: any) {
        console.error("GET /api/dashboard/stats error:", err);
        return NextResponse.json(
            { error: "Failed to fetch dashboard statistics", message: err.message },
            { status: 500 }
        );
    }
}
