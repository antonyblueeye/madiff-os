"use client";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Mail, Users, Send, CheckCircle, FileText } from "lucide-react";

interface NewsletterItem {
    id: string;
    subject: string;
    targetSegment: string;
    recipients: number;
    openRate: string;
    clickRate: string;
    date: string;
}

const campaigns: NewsletterItem[] = [
    {
        id: "z-1",
        subject: "Madiff Tech Talent Digest #24: High-Performance Python & Go",
        targetSegment: "Senior Candidates & Engineers (EU)",
        recipients: 2450,
        openRate: "42.8%",
        clickRate: "8.4%",
        date: "2026-09-20",
    },
    {
        id: "z-2",
        subject: "Monthly Madiff Engineering Insights — September Edition",
        targetSegment: "Active Client Contacts & Leads",
        recipients: 1760,
        openRate: "37.5%",
        clickRate: "6.1%",
        date: "2026-09-08",
    },
    {
        id: "z-3",
        subject: "Special Brief: Scaling Autonomous Agentic Pods",
        targetSegment: "CTOs & Tech Directors",
        recipients: 1140,
        openRate: "51.2%",
        clickRate: "12.3%",
        date: "2026-08-28",
    },
];

export default function ZohoNewsletterPage() {
    return (
        <PagePlaceholder
            title="Zoho Campaigns & Talent Newsletter"
            description="Manage candidate community updates, developer newsletter broadcasts, and engagement metrics via Zoho API."
            icon={Mail}
            tag="Zoho Campaigns Sync"
        >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase tracking-wide">Total Subscribers</span>
                    <p className="mt-1 text-2xl font-extrabold text-[#1f2d3d] font-mono">5,350</p>
                    <span className="text-[11px] text-[#10b981] font-semibold flex items-center gap-1 mt-1">
                        <Users className="h-3 w-3" /> Candidate & Client lists
                    </span>
                </Card>
                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase tracking-wide">Average Open Rate</span>
                    <p className="mt-1 text-2xl font-extrabold text-[#354f52] font-mono">43.8%</p>
                    <span className="text-[11px] text-[#6e84a3] font-medium mt-1">Industry standard: 28%</span>
                </Card>
                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase tracking-wide">Unsubscribe Rate</span>
                    <p className="mt-1 text-2xl font-extrabold text-[#1f2d3d] font-mono">0.18%</p>
                    <span className="text-[11px] text-[#10b981] font-semibold mt-1">Exceptional list health</span>
                </Card>
            </div>

            <Card className="p-5">
                <div className="flex items-center justify-between mb-4 border-b border-[#eaedf3] pb-3">
                    <div>
                        <h3 className="text-sm font-bold text-[#1f2d3d]">Broadcast History in Zoho</h3>
                        <p className="text-xs text-[#6e84a3] mt-0.5">Synced via Zoho Campaigns API</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#eaedf3] text-[#6e84a3] font-bold uppercase text-[10px]">
                                <th className="pb-3 font-semibold">Subject Line & Segment</th>
                                <th className="pb-3 font-semibold">Date Sent</th>
                                <th className="pb-3 font-semibold text-right">Recipients</th>
                                <th className="pb-3 font-semibold text-right">Open Rate</th>
                                <th className="pb-3 font-semibold text-right">Click Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eaedf3]">
                            {campaigns.map((c) => (
                                <tr key={c.id} className="hover:bg-[#f8fafc] transition-colors">
                                    <td className="py-3.5 pr-4">
                                        <div className="font-bold text-[#1f2d3d]">{c.subject}</div>
                                        <div className="text-[11px] text-[#354f52] mt-0.5 font-medium">{c.targetSegment}</div>
                                    </td>
                                    <td className="py-3.5 font-mono text-[#6e84a3]">{c.date}</td>
                                    <td className="py-3.5 text-right font-mono font-bold text-[#1f2d3d]">
                                        {c.recipients.toLocaleString()}
                                    </td>
                                    <td className="py-3.5 text-right font-mono font-extrabold text-[#10b981]">
                                        {c.openRate}
                                    </td>
                                    <td className="py-3.5 text-right font-mono font-bold text-[#354f52]">
                                        {c.clickRate}
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
