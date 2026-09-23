"use client";

import { useState } from "react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
    Send,
    Play,
    Pause,
    MailCheck,
    AlertCircle,
    CheckCircle2,
    Users,
    TrendingUp,
} from "lucide-react";

interface OutreachCampaign {
    id: string;
    name: string;
    channel: "Reply.io (Email)" | "LinkedHelper (LinkedIn)";
    status: "active" | "paused";
    delivered: number;
    openRate: string;
    replyRate: string;
    interestedLeads: number;
    inboxHealth: string;
}

const mockCampaigns: OutreachCampaign[] = [
    {
        id: "rep-01",
        name: "EU FinTech CTOs — AI Acceleration Pods",
        channel: "Reply.io (Email)",
        status: "active",
        delivered: 1420,
        openRate: "48.2%",
        replyRate: "11.4%",
        interestedLeads: 24,
        inboxHealth: "99.4% (Optimal)",
    },
    {
        id: "rep-02",
        name: "US Series A-B Founders — Engineering Velocity",
        channel: "Reply.io (Email)",
        status: "active",
        delivered: 980,
        openRate: "42.0%",
        replyRate: "8.9%",
        interestedLeads: 16,
        inboxHealth: "98.9% (Healthy)",
    },
    {
        id: "lh-01",
        name: "LinkedIn Connect & InMail — VP Product & Engineering",
        channel: "LinkedHelper (LinkedIn)",
        status: "active",
        delivered: 650,
        openRate: "64.5%",
        replyRate: "14.2%",
        interestedLeads: 19,
        inboxHealth: "25/day safety limit",
    },
    {
        id: "lh-02",
        name: "Web3 Enterprise Leaders Direct Outreach",
        channel: "LinkedHelper (LinkedIn)",
        status: "paused",
        delivered: 420,
        openRate: "31.0%",
        replyRate: "4.8%",
        interestedLeads: 4,
        inboxHealth: "Paused by admin",
    },
];

export default function ReplyOutreachPage() {
    const [campaigns, setCampaigns] = useState<OutreachCampaign[]>(mockCampaigns);

    const toggleStatus = (id: string) => {
        setCampaigns((prev) =>
            prev.map((c) =>
                c.id === id
                    ? { ...c, status: c.status === "active" ? "paused" : "active" }
                    : c
            )
        );
    };

    return (
        <PagePlaceholder
            title="Reply.io & LinkedHelper Outreach Monitor"
            description="Manage multithreaded cold email campaigns, inbox deliverability health scores, and automated LinkedIn sequences."
            icon={Send}
            tag="Cold Outreach Engine"
        >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase tracking-wide">
                        Connected Sending Inboxes
                    </span>
                    <p className="mt-1 text-2xl font-extrabold text-[#1f2d3d] font-mono">8 Inboxes</p>
                    <span className="text-[11px] text-[#10b981] font-semibold flex items-center gap-1 mt-1">
                        <CheckCircle2 className="h-3 w-3" /> Warm-up score 100%
                    </span>
                </Card>

                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase tracking-wide">
                        Avg Positive Reply Rate
                    </span>
                    <p className="mt-1 text-2xl font-extrabold text-[#10b981] font-mono">11.2%</p>
                    <span className="text-[11px] text-[#6e84a3] font-medium mt-1">
                        Industry benchmark: 3-5%
                    </span>
                </Card>

                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase tracking-wide">
                        Meetings / Interested Leads
                    </span>
                    <p className="mt-1 text-2xl font-extrabold text-[#354f52] font-mono">63 Qualified</p>
                    <span className="text-[11px] text-[#6e84a3] font-medium mt-1">
                        Auto-pushed into HubSpot pipeline
                    </span>
                </Card>
            </div>

            <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-[#1f2d3d]">Active Multi-Channel Campaigns</h3>
                        <p className="text-xs text-[#6e84a3] mt-0.5">
                            Live synchronization with Reply.io API and LinkedHelper Webhooks
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#eaedf3] text-[#6e84a3] font-bold uppercase text-[10px]">
                                <th className="pb-3">Campaign & Sequence</th>
                                <th className="pb-3">Platform</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Delivered</th>
                                <th className="pb-3">Open Rate</th>
                                <th className="pb-3">Reply Rate</th>
                                <th className="pb-3">Safety / Health</th>
                                <th className="pb-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eaedf3]">
                            {campaigns.map((camp) => (
                                <tr key={camp.id} className="hover:bg-[#f8fafc] transition-colors">
                                    <td className="py-3.5 pr-4">
                                        <div className="font-bold text-[#1f2d3d]">{camp.name}</div>
                                        <div className="text-[10px] text-[#95aac9] font-mono">ID: {camp.id}</div>
                                    </td>
                                    <td className="py-3.5">
                                        <span className="rounded bg-[#f1f4f8] px-2 py-0.5 text-[11px] font-medium text-[#354f52] border border-[#e2e8f0]">
                                            {camp.channel}
                                        </span>
                                    </td>
                                    <td className="py-3.5">
                                        <Badge variant={camp.status === "active" ? "success" : "warning"}>
                                            {camp.status}
                                        </Badge>
                                    </td>
                                    <td className="py-3.5 font-bold font-mono text-[#1f2d3d]">
                                        {camp.delivered.toLocaleString()}
                                    </td>
                                    <td className="py-3.5 font-bold font-mono text-[#354f52]">
                                        {camp.openRate}
                                    </td>
                                    <td className="py-3.5 font-bold font-mono text-[#10b981]">
                                        {camp.replyRate}
                                    </td>
                                    <td className="py-3.5 text-[#6e84a3] text-[11px]">
                                        {camp.inboxHealth}
                                    </td>
                                    <td className="py-3.5 text-right">
                                        <button
                                            onClick={() => toggleStatus(camp.id)}
                                            className="inline-flex items-center gap-1 rounded-lg border border-[#eaedf3] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#354f52] hover:bg-[#f1f4f8] transition-colors"
                                        >
                                            {camp.status === "active" ? (
                                                <>
                                                    <Pause className="h-3 w-3 text-amber-600" /> Pause
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="h-3 w-3 text-emerald-600" /> Resume
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </PagePlaceholder>
    );
}
