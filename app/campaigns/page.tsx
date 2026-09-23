"use client";

import { useState } from "react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Share2, Play, Pause, Send, Globe, Mail, CheckCircle2, ArrowUpRight } from "lucide-react";

interface CampaignItem {
    id: string;
    name: string;
    channel: "Reply.io" | "LinkedHelper" | "Zoho Campaigns";
    targetAudience: string;
    status: "active" | "paused" | "draft";
    sentCount: number;
    openRate: string;
    replyRate: string;
    leadsGenerated: number;
}

const campaignsList: CampaignItem[] = [
    {
        id: "c-1",
        name: "EU FinTech CTOs & VP Eng — AI Pods Sequence",
        channel: "Reply.io",
        targetAudience: "Apollo filtered: London, Berlin, Amsterdam",
        status: "active",
        sentCount: 1420,
        openRate: "48.2%",
        replyRate: "11.4%",
        leadsGenerated: 24,
    },
    {
        id: "c-2",
        name: "US Series A-B Founders — Speed to Market Outreach",
        channel: "Reply.io",
        targetAudience: "Apollo filtered: YC & Techstars alumni",
        status: "active",
        sentCount: 980,
        openRate: "42.0%",
        replyRate: "8.9%",
        leadsGenerated: 16,
    },
    {
        id: "c-3",
        name: "LinkedIn InMail & Connect Sequence — Product Leaders",
        channel: "LinkedHelper",
        targetAudience: "Heads of Product / AI Directors",
        status: "active",
        sentCount: 650,
        openRate: "64.5%",
        replyRate: "14.2%",
        leadsGenerated: 19,
    },
    {
        id: "c-4",
        name: "Senior Python & LLM Engineers Talent Digest",
        channel: "Zoho Campaigns",
        targetAudience: "Madiff candidate newsletter list",
        status: "active",
        sentCount: 3200,
        openRate: "39.1%",
        replyRate: "5.3%",
        leadsGenerated: 38,
    },
    {
        id: "c-5",
        name: "Web3 & DeFi Enterprise Modernization",
        channel: "LinkedHelper",
        targetAudience: "Founders & Tech leads",
        status: "paused",
        sentCount: 420,
        openRate: "31.0%",
        replyRate: "4.8%",
        leadsGenerated: 4,
    },
];

export default function CampaignsPage() {
    const [filterChannel, setFilterChannel] = useState<string>("all");
    const [campaigns, setCampaigns] = useState<CampaignItem[]>(campaignsList);

    const toggleStatus = (id: string) => {
        setCampaigns((prev) =>
            prev.map((c) =>
                c.id === id
                    ? { ...c, status: c.status === "active" ? "paused" : "active" }
                    : c
            )
        );
    };

    const filtered =
        filterChannel === "all"
            ? campaigns
            : campaigns.filter((c) => c.channel === filterChannel);

    return (
        <PagePlaceholder
            title="Outbound Sequences & Campaigns"
            description="Central control room for cold emails in Reply.io, connection sequences in LinkedHelper, and digests in Zoho."
            icon={Share2}
            tag="Multi-Channel"
        >
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
                {["all", "Reply.io", "LinkedHelper", "Zoho Campaigns"].map((channel) => (
                    <button
                        key={channel}
                        onClick={() => setFilterChannel(channel)}
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                            filterChannel === channel
                                ? "bg-[#354f52] text-white shadow-sm"
                                : "border border-[#eaedf3] bg-white text-[#6e84a3] hover:text-[#1f2d3d]"
                        }`}
                    >
                        {channel === "all" ? "All Platforms" : channel}
                    </button>
                ))}
            </div>

            {/* Campaign Cards */}
            <div className="grid grid-cols-1 gap-4">
                {filtered.map((campaign) => (
                    <Card
                        key={campaign.id}
                        className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-5"
                    >
                        <div className="space-y-1 max-w-xl">
                            <div className="flex items-center gap-2.5">
                                <Badge
                                    variant={
                                        campaign.channel === "Reply.io"
                                            ? "accent"
                                            : campaign.channel === "LinkedHelper"
                                            ? "sage"
                                            : "default"
                                    }
                                >
                                    {campaign.channel}
                                </Badge>
                                <span className="text-xs font-mono text-[#95aac9]">
                                    ID: {campaign.id}
                                </span>
                                <Badge
                                    variant={
                                        campaign.status === "active" ? "success" : "warning"
                                    }
                                >
                                    {campaign.status}
                                </Badge>
                            </div>
                            <h3 className="text-sm font-bold text-[#1f2d3d]">
                                {campaign.name}
                            </h3>
                            <p className="text-xs text-[#6e84a3]">
                                Target Audience: {campaign.targetAudience}
                            </p>
                        </div>

                        {/* Performance metrics pill */}
                        <div className="grid grid-cols-4 gap-4 rounded-xl border border-[#eaedf3] bg-[#f8fafc] px-4 py-3 text-center">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-[#95aac9]">Sent</span>
                                <p className="text-xs font-extrabold font-mono text-[#1f2d3d] mt-0.5">
                                    {campaign.sentCount.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-[#95aac9]">Open Rate</span>
                                <p className="text-xs font-extrabold font-mono text-[#354f52] mt-0.5">
                                    {campaign.openRate}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-[#95aac9]">Reply Rate</span>
                                <p className="text-xs font-extrabold font-mono text-[#10b981] mt-0.5">
                                    {campaign.replyRate}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-[#95aac9]">Meetings/Leads</span>
                                <p className="text-xs font-extrabold font-mono text-amber-600 mt-0.5">
                                    {campaign.leadsGenerated}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end lg:self-center">
                            <button
                                onClick={() => toggleStatus(campaign.id)}
                                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                                    campaign.status === "active"
                                        ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                        : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                }`}
                            >
                                {campaign.status === "active" ? (
                                    <>
                                        <Pause className="h-3.5 w-3.5" /> Pause
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-3.5 w-3.5" /> Resume
                                    </>
                                )}
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        </PagePlaceholder>
    );
}