import { NextResponse } from "next/server";
import pool, { initDb } from "@/lib/db";
import { pushContactToCampaign, createReplySequence } from "@/lib/reply";

export async function POST(request: Request) {
    try {
        await initDb();
        const body = await request.json();
        const {
            leadIds,
            campaignId: reqCampaignId,
            createNew,
            newCampaignName,
            newCampaignSubject,
            newCampaignBody,
            emailAccountId,
        } = body;

        if (!Array.isArray(leadIds) || leadIds.length === 0) {
            return NextResponse.json({ error: "leadIds must be a non-empty array" }, { status: 400 });
        }

        let targetCampaignId = reqCampaignId ? parseInt(reqCampaignId, 10) : null;
        let campaignName = "";

        if (createNew) {
            if (!newCampaignName || !newCampaignSubject || !newCampaignBody) {
                return NextResponse.json(
                    { error: "newCampaignName, newCampaignSubject, and newCampaignBody are required when createNew is true" },
                    { status: 400 }
                );
            }

            const createdSeq = await createReplySequence({
                name: newCampaignName,
                subject: newCampaignSubject,
                body: newCampaignBody,
                emailAccountId: emailAccountId ? parseInt(emailAccountId, 10) : undefined,
            });

            targetCampaignId = createdSeq.id;
            campaignName = createdSeq.name;
        }

        if (!targetCampaignId) {
            return NextResponse.json({ error: "No target campaign specified" }, { status: 400 });
        }

        const leadsRes = await pool.query(
            "SELECT id, contact_name, email, phone, company_name, title, channels FROM leads WHERE id = ANY($1::varchar[])",
            [leadIds]
        );
        const leads = leadsRes.rows;

        let pushedCount = 0;
        const errors: any[] = [];

        for (const lead of leads) {
            if (!lead.email) {
                errors.push({ id: lead.id, error: "No email address" });
                continue;
            }

            try {
                const nameParts = (lead.contact_name || "").trim().split(" ");
                const firstName = nameParts[0] || "";
                const lastName = nameParts.slice(1).join(" ") || "";

                await pushContactToCampaign({
                    campaignId: targetCampaignId,
                    email: lead.email,
                    firstName,
                    lastName,
                    company: lead.company_name || "",
                    title: lead.title || "",
                    phone: lead.phone || "",
                });

                const currentChannels = lead.channels || {};
                currentChannels.reply = {
                    active: true,
                    statusText: "Enrolled",
                    details: `Campaign: ${campaignName || targetCampaignId}`,
                    dateAdded: new Date().toISOString(),
                };

                await pool.query(
                    "UPDATE leads SET channels = $1, updated_at = NOW() WHERE id = $2",
                    [JSON.stringify(currentChannels), lead.id]
                );

                pushedCount++;
            } catch (err: any) {
                console.error(`Failed to push lead ${lead.email} to Reply.io:`, err);
                errors.push({ id: lead.id, email: lead.email, error: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            pushedCount,
            totalRequested: leadIds.length,
            campaignId: targetCampaignId,
            campaignName,
            errors,
            message: `Successfully pushed ${pushedCount} lead(s) to Reply.io sequence #${targetCampaignId}!`,
        });
    } catch (err: any) {
        console.error("POST /api/reply/push error:", err);
        return NextResponse.json(
            { error: "Failed to push contacts to Reply.io", details: err.message },
            { status: 500 }
        );
    }
}
