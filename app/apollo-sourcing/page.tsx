"use client";

import { useState } from "react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
    Search,
    Send,
    Filter,
    CheckCircle2,
    Users,
    MapPin,
    Building2,
    Sparkles,
    ArrowRight,
    ExternalLink,
} from "lucide-react";

interface LeadItem {
    id: string;
    name: string;
    title: string;
    company: string;
    industry: string;
    location: string;
    headcount: string;
    email: string;
    verified: boolean;
    selected: boolean;
    sentToReply: boolean;
}

const mockApolloResults: LeadItem[] = [
    {
        id: "ap-1",
        name: "Viktor Lindgren",
        title: "Chief Technology Officer",
        company: "NordicFin Solutions",
        industry: "Financial Services / FinTech",
        location: "Stockholm, Sweden",
        headcount: "50-200",
        email: "viktor.lindgren@nordicfin.io",
        verified: true,
        selected: true,
        sentToReply: false,
    },
    {
        id: "ap-2",
        name: "Sarah Montgomery",
        title: "VP of Engineering",
        company: "ScaleWave Cloud",
        industry: "Software & DevOps",
        location: "London, United Kingdom",
        headcount: "100-500",
        email: "s.montgomery@scalewave.co.uk",
        verified: true,
        selected: true,
        sentToReply: false,
    },
    {
        id: "ap-3",
        name: "Alexandre Moreau",
        title: "Head of Infrastructure & AI",
        company: "PayFlow Europe",
        industry: "Payments / Web3",
        location: "Paris, France",
        headcount: "20-50",
        email: "alexandre@payflow.eu",
        verified: true,
        selected: false,
        sentToReply: false,
    },
    {
        id: "ap-4",
        name: "Elena Vlasova",
        title: "Engineering Director",
        company: "DataVibe AI",
        industry: "Data Intelligence",
        location: "Berlin, Germany",
        headcount: "50-100",
        email: "elena@datavibe.de",
        verified: true,
        selected: false,
        sentToReply: false,
    },
    {
        id: "ap-5",
        name: "David Chen",
        title: "Founder & CTO",
        company: "HyperScale Logic",
        industry: "Enterprise AI",
        location: "Amsterdam, Netherlands",
        headcount: "10-50",
        email: "david@hyperscale.ai",
        verified: true,
        selected: false,
        sentToReply: false,
    },
];

export default function ApolloSourcingPage() {
    const [leads, setLeads] = useState<LeadItem[]>(mockApolloResults);
    const [titleFilter, setTitleFilter] = useState("CTO, VP of Engineering, Tech Director");
    const [locationFilter, setLocationFilter] = useState("United Kingdom, Germany, Sweden, France");
    const [headcountFilter, setHeadcountFilter] = useState("20-500 employees");
    const [industryFilter, setIndustryFilter] = useState("FinTech, AI, SaaS");
    const [isSearching, setIsSearching] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    const toggleSelect = (id: string) => {
        setLeads((prev) =>
            prev.map((l) => (l.id === id ? { ...l, selected: !l.selected } : l))
        );
    };

    const toggleSelectAll = () => {
        const anyUnselected = leads.some((l) => !l.selected);
        setLeads((prev) => prev.map((l) => ({ ...l, selected: anyUnselected })));
    };

    const handleRunSearch = () => {
        setIsSearching(true);
        setTimeout(() => {
            setIsSearching(false);
            setNotification("Apollo search query executed. 5 verified contacts ready for export.");
            setTimeout(() => setNotification(null), 3000);
        }, 700);
    };

    const handleExportToReply = () => {
        const selectedCount = leads.filter((l) => l.selected).length;
        if (selectedCount === 0) {
            alert("Please select at least 1 contact to export");
            return;
        }

        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            setLeads((prev) =>
                prev.map((l) => (l.selected ? { ...l, sentToReply: true, selected: false } : l))
            );
            setNotification(`Successfully dispatched ${selectedCount} contacts directly into Reply.io sequence "EU Tech Leaders"!`);
            setTimeout(() => setNotification(null), 4000);
        }, 900);
    };

    const selectedCount = leads.filter((l) => l.selected).length;

    return (
        <PagePlaceholder
            title="Apollo.io Lead Sourcing & ICP Builder"
            description="Define target parameters, pull verified decision-maker emails via Apollo API, and directly push prospects to Reply.io."
            icon={Search}
            tag="Lead Sourcing Gateway"
            action={
                <button
                    onClick={handleExportToReply}
                    disabled={isExporting}
                    className="flex items-center gap-1.5 rounded-lg bg-[#354f52] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#2f3e46] transition-colors disabled:opacity-50"
                >
                    <Send className="h-3.5 w-3.5" />
                    {isExporting ? "Pushing to Reply.io..." : `Send Selected (${selectedCount}) to Reply.io`}
                </button>
            }
        >
            {notification && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    {notification}
                </div>
            )}

            {/* ICP Filter Controls Card */}
            <Card className="p-5">
                <div className="flex items-center justify-between border-b border-[#eaedf3] pb-3 mb-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-[#354f52]" />
                        <h3 className="text-sm font-bold text-[#1f2d3d]">Apollo ICP Search Parameters</h3>
                    </div>
                    <span className="text-[11px] font-mono text-[#6e84a3]">Apollo API: Connected (Tier 1)</span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#6e84a3] uppercase tracking-wide">
                            Target Job Titles
                        </label>
                        <input
                            value={titleFilter}
                            onChange={(e) => setTitleFilter(e.target.value)}
                            className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#6e84a3] uppercase tracking-wide">
                            Geography / Locations
                        </label>
                        <input
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#6e84a3] uppercase tracking-wide">
                            Company Headcount
                        </label>
                        <input
                            value={headcountFilter}
                            onChange={(e) => setHeadcountFilter(e.target.value)}
                            className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#6e84a3] uppercase tracking-wide">
                            Industry / Keywords
                        </label>
                        <input
                            value={industryFilter}
                            onChange={(e) => setIndustryFilter(e.target.value)}
                            className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                        />
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#eaedf3] pt-3">
                    <span className="text-xs text-[#6e84a3]">
                        Verified Business Emails only (Deliverability guarantee &gt; 98%)
                    </span>
                    <button
                        onClick={handleRunSearch}
                        className="flex items-center gap-1.5 rounded-lg bg-[#354f52] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#2f3e46] transition-colors"
                    >
                        <Sparkles className="h-3.5 w-3.5 text-[#cad2c5]" />
                        {isSearching ? "Searching Apollo DB..." : "Query Apollo DB"}
                    </button>
                </div>
            </Card>

            {/* Sourced Leads Table */}
            <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#1f2d3d]">Available Enriched Prospects</h3>
                        <Badge variant="accent">{leads.length} Contacts Found</Badge>
                    </div>

                    <button
                        onClick={toggleSelectAll}
                        className="text-xs font-semibold text-[#52796f] hover:underline"
                    >
                        {leads.every((l) => l.selected) ? "Deselect All" : "Select All"}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#eaedf3] text-[#6e84a3] font-bold uppercase text-[10px]">
                                <th className="pb-3 w-8">
                                    <input
                                        type="checkbox"
                                        checked={leads.every((l) => l.selected)}
                                        onChange={toggleSelectAll}
                                        className="rounded border-[#eaedf3] text-[#354f52]"
                                    />
                                </th>
                                <th className="pb-3">Contact & Role</th>
                                <th className="pb-3">Company & Industry</th>
                                <th className="pb-3">Location</th>
                                <th className="pb-3">Email & Verification</th>
                                <th className="pb-3 text-right">Destination State</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eaedf3]">
                            {leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-[#f8fafc] transition-colors">
                                    <td className="py-3.5">
                                        <input
                                            type="checkbox"
                                            checked={lead.selected}
                                            onChange={() => toggleSelect(lead.id)}
                                            className="rounded border-[#eaedf3] text-[#354f52]"
                                        />
                                    </td>
                                    <td className="py-3.5 pr-4">
                                        <div className="font-bold text-[#1f2d3d]">{lead.name}</div>
                                        <div className="text-[11px] text-[#52796f] font-medium">{lead.title}</div>
                                    </td>
                                    <td className="py-3.5">
                                        <div className="font-semibold text-[#1f2d3d]">{lead.company}</div>
                                        <div className="text-[11px] text-[#6e84a3]">
                                            {lead.industry} · {lead.headcount}
                                        </div>
                                    </td>
                                    <td className="py-3.5 text-[#6e84a3]">{lead.location}</td>
                                    <td className="py-3.5 font-mono text-[11px]">
                                        <span className="text-[#1f2d3d]">{lead.email}</span>
                                        <div className="mt-0.5">
                                            <Badge variant="success">Apollo Verified</Badge>
                                        </div>
                                    </td>
                                    <td className="py-3.5 text-right">
                                        {lead.sentToReply ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                <CheckCircle2 className="h-3 w-3" /> Dispatched to Reply.io
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    toggleSelect(lead.id);
                                                    handleExportToReply();
                                                }}
                                                className="inline-flex items-center gap-1 rounded-lg border border-[#eaedf3] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#354f52] hover:bg-[#f1f4f8] transition-colors"
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
