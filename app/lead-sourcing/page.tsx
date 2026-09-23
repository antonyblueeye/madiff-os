"use client";

import { useState } from "react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Search, Download, Filter, CheckCircle, Database, ArrowRight } from "lucide-react";

interface ApolloLead {
    id: string;
    name: string;
    role: string;
    company: string;
    location: string;
    headcount: string;
    emailStatus: "verified" | "extrapolated";
    syncedToReply: boolean;
}

const leads: ApolloLead[] = [
    {
        id: "ap-1",
        name: "Marcus Lindqvist",
        role: "Chief Technology Officer",
        company: "NordicFin Tech",
        location: "Stockholm, Sweden",
        headcount: "50-200",
        emailStatus: "verified",
        syncedToReply: true,
    },
    {
        id: "ap-2",
        name: "Sarah Jenkins",
        role: "VP of Engineering",
        company: "CloudScale Systems",
        location: "London, UK",
        headcount: "100-500",
        emailStatus: "verified",
        syncedToReply: true,
    },
    {
        id: "ap-3",
        name: "Alexandre Dupont",
        role: "Co-Founder & CTO",
        company: "PayFlow AI",
        location: "Paris, France",
        headcount: "20-50",
        emailStatus: "verified",
        syncedToReply: false,
    },
    {
        id: "ap-4",
        name: "Elena Rostova",
        role: "Head of Infrastructure",
        company: "DataVibe Analytics",
        location: "Berlin, Germany",
        headcount: "50-100",
        emailStatus: "verified",
        syncedToReply: false,
    },
];

export default function LeadSourcingPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [leadList, setLeadList] = useState<ApolloLead[]>(leads);
    const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

    const handleSyncToReply = (id: string, name: string) => {
        setLeadList((prev) =>
            prev.map((l) => (l.id === id ? { ...l, syncedToReply: true } : l))
        );
        setSyncSuccess(`Contact "${name}" pushed to Reply.io campaign sequence`);
        setTimeout(() => setSyncSuccess(null), 3000);
    };

    return (
        <PagePlaceholder
            title="Apollo.io Lead Sourcing & Enrichment"
            description="Target high-intent B2B accounts, verify direct work emails, and push directly to Reply.io sequences and HubSpot CRM."
            icon={Search}
            tag="Apollo Gateway"
        >
            {syncSuccess && (
                <div className="flex items-center gap-2 rounded-xl border border-[#84a98c]/50 bg-[#84a98c]/15 px-4 py-3 text-xs font-medium text-[#cad2c5]">
                    <CheckCircle className="h-4 w-4 text-[#84a98c]" />
                    {syncSuccess}
                </div>
            )}

            {/* Top filter bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-[#354f52] bg-[#1f2c31] px-3.5 py-2 w-full sm:w-80">
                    <Search className="h-4 w-4 text-[#84a98c]" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search company, title, location..."
                        className="bg-transparent text-xs text-[#cad2c5] outline-none w-full"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 rounded-xl border border-[#354f52] bg-[#2f3e46]/50 px-3.5 py-2 text-xs font-medium text-[#cad2c5] hover:border-[#52796f]">
                        <Filter className="h-3.5 w-3.5 text-[#84a98c]" /> Filter ICP
                    </button>
                    <button className="flex items-center gap-1.5 rounded-xl bg-[#84a98c] px-3.5 py-2 text-xs font-bold text-[#182226] hover:bg-[#96bc9e]">
                        <Download className="h-3.5 w-3.5" /> Export Filtered List
                    </button>
                </div>
            </div>

            {/* Leads Table */}
            <Card className="p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#354f52]/70 text-[#cad2c5]/50 font-mono uppercase text-[10px]">
                                <th className="pb-3 font-semibold">Contact & Title</th>
                                <th className="pb-3 font-semibold">Company & Size</th>
                                <th className="pb-3 font-semibold">Location</th>
                                <th className="pb-3 font-semibold">Apollo Email</th>
                                <th className="pb-3 font-semibold text-right">Outbound State</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#354f52]/40">
                            {leadList.map((lead) => (
                                <tr key={lead.id} className="hover:bg-[#2f3e46]/30 transition-colors">
                                    <td className="py-3.5 pr-4">
                                        <div className="font-semibold text-[#cad2c5]">{lead.name}</div>
                                        <div className="text-[11px] text-[#84a98c]">{lead.role}</div>
                                    </td>
                                    <td className="py-3.5">
                                        <div className="font-medium text-[#cad2c5]">{lead.company}</div>
                                        <div className="text-[10px] text-[#cad2c5]/50 font-mono">
                                            {lead.headcount} employees
                                        </div>
                                    </td>
                                    <td className="py-3.5 text-[#cad2c5]/70">{lead.location}</td>
                                    <td className="py-3.5">
                                        <Badge variant="success">Verified by Apollo</Badge>
                                    </td>
                                    <td className="py-3.5 text-right">
                                        {lead.syncedToReply ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#84a98c]">
                                                <CheckCircle className="h-3 w-3" /> In Reply.io Sequence
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleSyncToReply(lead.id, lead.name)}
                                                className="inline-flex items-center gap-1 rounded-lg border border-[#52796f] bg-[#354f52]/60 px-2.5 py-1 text-[11px] font-medium text-[#cad2c5] hover:border-[#84a98c] hover:text-[#84a98c]"
                                            >
                                                Push to Reply <ArrowRight className="h-3 w-3" />
                                            </button>
                                        )}
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
