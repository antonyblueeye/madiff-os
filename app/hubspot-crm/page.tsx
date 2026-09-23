"use client";

import { useState } from "react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
    Database,
    RefreshCw,
    TrendingUp,
    Users,
    DollarSign,
    CheckCircle2,
    Filter,
} from "lucide-react";

interface HubSpotDeal {
    id: string;
    dealName: string;
    company: string;
    stage: "Meeting Scheduled" | "Qualified Discovery" | "Contract / Proposal" | "Closed Won";
    amount: string;
    source: string;
    contactName: string;
    lastActivity: string;
}

const mockHubspotDeals: HubSpotDeal[] = [
    {
        id: "deal-101",
        dealName: "NordicFin AI Dedicated Engineering Pod",
        company: "NordicFin Solutions",
        stage: "Contract / Proposal",
        amount: "$64,000",
        source: "Reply.io (Cold Outreach)",
        contactName: "Viktor Lindgren (CTO)",
        lastActivity: "Call logged 2h ago",
    },
    {
        id: "deal-102",
        dealName: "CloudScale Infrastructure Modernization",
        company: "ScaleWave Cloud",
        stage: "Qualified Discovery",
        amount: "$48,500",
        source: "LinkedHelper Sequence",
        contactName: "Sarah Montgomery (VP Eng)",
        lastActivity: "Email received today",
    },
    {
        id: "deal-103",
        dealName: "AIPEX Autonomous Agents Delivery Team",
        company: "AIPEX Corp",
        stage: "Meeting Scheduled",
        amount: "$72,000",
        source: "Reply.io (Cold Outreach)",
        contactName: "Marc Benioff (Advisor)",
        lastActivity: "Demo booked for Friday",
    },
];

export default function HubSpotCRMPage() {
    const [deals, setDeals] = useState<HubSpotDeal[]>(mockHubspotDeals);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState<string | null>(null);

    const handleSyncHubspot = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            setSyncMessage("HubSpot CRM bi-directional sync completed (420 contacts, 3 deals updated)");
            setTimeout(() => setSyncMessage(null), 3500);
        }, 800);
    };

    return (
        <PagePlaceholder
            title="HubSpot CRM Pipeline & Deal Intelligence"
            description="Inspect synced contacts, real-time pipeline stages, and attribution directly from Madiff outbound campaigns."
            icon={Database}
            tag="Two-way Sync"
            action={
                <button
                    onClick={handleSyncHubspot}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 rounded-lg bg-[#354f52] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#2f3e46] transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                    {isSyncing ? "Syncing HubSpot..." : "Force Sync CRM"}
                </button>
            }
        >
            {syncMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    {syncMessage}
                </div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase tracking-wide">
                        Active Pipeline Value
                    </span>
                    <p className="mt-1 text-2xl font-extrabold text-[#1f2d3d] font-mono">$184,500</p>
                    <span className="text-[11px] text-[#10b981] font-semibold flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" /> 3 high-probability deals
                    </span>
                </Card>

                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase tracking-wide">
                        Synced Contacts in HubSpot
                    </span>
                    <p className="mt-1 text-2xl font-extrabold text-[#1f2d3d] font-mono">1,847</p>
                    <span className="text-[11px] text-[#6e84a3] font-medium mt-1">
                        Auto-created from inbound positive replies
                    </span>
                </Card>

                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase tracking-wide">
                        Lead Attribution
                    </span>
                    <p className="mt-1 text-2xl font-extrabold text-[#354f52] font-mono">86% Outbound</p>
                    <span className="text-[11px] text-[#6e84a3] font-medium mt-1">
                        Reply.io cold sequences + LinkedHelper
                    </span>
                </Card>
            </div>

            {/* Deals Table */}
            <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-[#1f2d3d]">Active Outbound Deals in HubSpot</h3>
                        <p className="text-xs text-[#6e84a3] mt-0.5">
                            Real-time synchronization with HubSpot Sales Hub
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#eaedf3] text-[#6e84a3] font-bold uppercase text-[10px]">
                                <th className="pb-3">Deal Opportunity</th>
                                <th className="pb-3">Primary Contact</th>
                                <th className="pb-3">Stage</th>
                                <th className="pb-3">Deal Value</th>
                                <th className="pb-3">Attribution Source</th>
                                <th className="pb-3 text-right">Latest CRM Activity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eaedf3]">
                            {deals.map((deal) => (
                                <tr key={deal.id} className="hover:bg-[#f8fafc] transition-colors">
                                    <td className="py-3.5 pr-4">
                                        <div className="font-bold text-[#1f2d3d]">{deal.dealName}</div>
                                        <div className="text-[11px] text-[#6e84a3]">{deal.company}</div>
                                    </td>
                                    <td className="py-3.5 text-[#1f2d3d] font-medium">{deal.contactName}</td>
                                    <td className="py-3.5">
                                        <Badge
                                            variant={
                                                deal.stage === "Contract / Proposal"
                                                    ? "accent"
                                                    : deal.stage === "Qualified Discovery"
                                                    ? "brand"
                                                    : "success"
                                            }
                                        >
                                            {deal.stage}
                                        </Badge>
                                    </td>
                                    <td className="py-3.5 font-bold font-mono text-[#1f2d3d]">{deal.amount}</td>
                                    <td className="py-3.5">
                                        <span className="rounded bg-[#f1f5f9] px-2 py-0.5 text-[11px] text-[#475569] font-mono border border-[#e2e8f0]">
                                            {deal.source}
                                        </span>
                                    </td>
                                    <td className="py-3.5 text-right font-medium text-[#6e84a3]">
                                        {deal.lastActivity}
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
