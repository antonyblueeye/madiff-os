"use client";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Database, DollarSign, TrendingUp, UserCheck, ArrowRight, ExternalLink } from "lucide-react";

interface Deal {
    id: string;
    client: string;
    stage: "Meeting Booked" | "Discovery Call" | "Proposal Sent" | "Closed Won";
    value: string;
    source: "Reply.io Outbound" | "LinkedHelper" | "Madiff LinkedIn Page";
    owner: string;
}

const deals: Deal[] = [
    {
        id: "deal-1",
        client: "NordicFin Tech",
        stage: "Proposal Sent",
        value: "$64,000",
        source: "Reply.io Outbound",
        owner: "Fernando",
    },
    {
        id: "deal-2",
        client: "CloudScale Systems",
        stage: "Discovery Call",
        value: "$48,500",
        source: "LinkedHelper",
        owner: "Fernando",
    },
    {
        id: "deal-3",
        client: "AIPEX Corp",
        stage: "Meeting Booked",
        value: "$72,000",
        source: "Reply.io Outbound",
        owner: "Outbound AI",
    },
];

export default function HubSpotCRMPage() {
    return (
        <PagePlaceholder
            title="HubSpot CRM Pipeline & Contacts"
            description="Two-way synchronization for incoming leads from Reply.io and LinkedHelper into active deals, contacts, and pipeline stages."
            icon={Database}
            tag="CRM Sync Live"
        >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="p-4">
                    <span className="text-[11px] font-mono uppercase text-[#cad2c5]/60">Total Pipeline Value</span>
                    <p className="mt-1 text-2xl font-bold text-[#cad2c5]">$184,500</p>
                    <span className="text-[11px] text-[#84a98c] flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" /> 3 active opportunities
                    </span>
                </Card>
                <Card className="p-4">
                    <span className="text-[11px] font-mono uppercase text-[#cad2c5]/60">HubSpot Sync Interval</span>
                    <p className="mt-1 text-2xl font-bold text-[#84a98c]">Every 15 min</p>
                    <span className="text-[11px] text-[#cad2c5]/60 mt-1">Webhook automatic triggers</span>
                </Card>
                <Card className="p-4">
                    <span className="text-[11px] font-mono uppercase text-[#cad2c5]/60">Attribution Source</span>
                    <p className="mt-1 text-2xl font-bold text-[#cad2c5]">82% Outbound</p>
                    <span className="text-[11px] text-[#84a98c] mt-1">Reply.io + LinkedHelper</span>
                </Card>
            </div>

            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-[#cad2c5]">Active Outbound Deals in HubSpot</h3>
                        <p className="text-xs text-[#cad2c5]/60 mt-0.5">Updated automatically via webhook</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#354f52]/70 text-[#cad2c5]/50 font-mono uppercase text-[10px]">
                                <th className="pb-3 font-semibold">Account / Company</th>
                                <th className="pb-3 font-semibold">Stage</th>
                                <th className="pb-3 font-semibold">Value</th>
                                <th className="pb-3 font-semibold">Attribution Channel</th>
                                <th className="pb-3 font-semibold text-right">Owner</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#354f52]/40">
                            {deals.map((deal) => (
                                <tr key={deal.id} className="hover:bg-[#2f3e46]/30 transition-colors">
                                    <td className="py-3.5 font-semibold text-[#cad2c5]">{deal.client}</td>
                                    <td className="py-3.5">
                                        <Badge
                                            variant={
                                                deal.stage === "Proposal Sent"
                                                    ? "accent"
                                                    : deal.stage === "Discovery Call"
                                                    ? "warning"
                                                    : "success"
                                            }
                                        >
                                            {deal.stage}
                                        </Badge>
                                    </td>
                                    <td className="py-3.5 font-mono font-bold text-[#cad2c5]">{deal.value}</td>
                                    <td className="py-3.5">
                                        <span className="rounded bg-[#354f52]/40 px-2 py-0.5 text-[11px] text-[#84a98c] border border-[#52796f]/40 font-mono">
                                            {deal.source}
                                        </span>
                                    </td>
                                    <td className="py-3.5 text-right font-medium text-[#cad2c5]/80">
                                        {deal.owner}
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
