"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, Search, X, CheckCircle2 } from "lucide-react";
import { LeadItem } from "@/lib/mock-data";

interface ApolloImportModalProps {
    onClose: () => void;
    onImportSuccess: (newLeads: LeadItem[]) => void;
}

export function ApolloImportModal({ onClose, onImportSuccess }: ApolloImportModalProps) {
    const [titles, setTitles] = useState("Chief Technology Officer, VP of Engineering, Head of AI");
    const [locations, setLocations] = useState("United Kingdom, Germany, Netherlands, Sweden");
    const [headcount, setHeadcount] = useState("50-500 employees");
    const [keywords, setKeywords] = useState("FinTech, AI, SaaS, Cloud");
    const [minConfidence, setMinConfidence] = useState("95%");
    const [isSearching, setIsSearching] = useState(false);

    const handleImport = () => {
        setIsSearching(true);
        setTimeout(() => {
            setIsSearching(false);
            const imported: LeadItem[] = [
                {
                    id: `ap-${Date.now()}-1`,
                    name: "Maximilian Bauer",
                    title: "VP of Engineering & Architecture",
                    company: "Aether FinTech AG",
                    industry: "Financial Services / Banking API",
                    location: "Frankfurt, Germany",
                    headcount: "100-250",
                    email: "m.bauer@aetherfintech.de",
                    phone: "+49 69 9876 543",
                    stage: "New Sourced",
                    channels: {
                        apollo: { active: true, statusText: "Imported", details: "Verified Apollo (>99%)", dateAdded: "Just now" },
                        hubspot: { active: false },
                        reply: { active: false },
                        linkedhelper: { active: false },
                        zoho: { active: false },
                    },
                    timeline: [
                        { date: "Just now", channel: "Apollo.io", event: "Imported via Apollo Parameters: Frankfurt FinTech" },
                    ],
                },
                {
                    id: `ap-${Date.now()}-2`,
                    name: "Charlotte Hayes",
                    title: "Chief Technology Officer",
                    company: "Nexis Cloud AI",
                    industry: "DevOps & Autonomous Agents",
                    location: "London, UK",
                    headcount: "20-100",
                    email: "charlotte@nexiscloud.ai",
                    stage: "New Sourced",
                    channels: {
                        apollo: { active: true, statusText: "Imported", details: "Verified Apollo (>98%)", dateAdded: "Just now" },
                        hubspot: { active: false },
                        reply: { active: false },
                        linkedhelper: { active: false },
                        zoho: { active: false },
                    },
                    timeline: [
                        { date: "Just now", channel: "Apollo.io", event: "Imported via Apollo Parameters: London AI Pods" },
                    ],
                },
            ];

            onImportSuccess(imported);
        }, 900);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#eaedf3] space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#eaedf3] pb-3">
                    <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-1">
                            <Image
                                src="/apollo.jpg"
                                alt="Apollo.io"
                                fill
                                sizes="36px"
                                className="object-contain p-0.5"
                            />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-[#1f2d3d]">Import Leads from Apollo.io</h3>
                            <p className="text-xs text-[#6e84a3]">Pull verified B2B decision makers directly into CRM</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-[#95aac9] hover:bg-[#f1f4f8] hover:text-[#1f2d3d]"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-[#6e84a3]">Job Titles (Comma separated)</label>
                        <input
                            value={titles}
                            onChange={(e) => setTitles(e.target.value)}
                            className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3.5 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-[#6e84a3]">Target Geographies</label>
                            <input
                                value={locations}
                                onChange={(e) => setLocations(e.target.value)}
                                className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3.5 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-[#6e84a3]">Company Headcount</label>
                            <input
                                value={headcount}
                                onChange={(e) => setHeadcount(e.target.value)}
                                className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3.5 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-[#6e84a3]">Industry Keywords</label>
                            <input
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3.5 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-[#6e84a3]">Verification Confidence</label>
                            <select
                                value={minConfidence}
                                onChange={(e) => setMinConfidence(e.target.value)}
                                className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3.5 py-2 text-xs text-[#1f2d3d] outline-none"
                            >
                                <option value="95%">Verified Work Email (&gt;95%)</option>
                                <option value="99%">Strict Deliverable (&gt;99%)</option>
                                <option value="phone">Require Direct Phone + Email</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#eaedf3]">
                    <button
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 text-xs font-semibold text-[#6e84a3] hover:text-[#1f2d3d]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={isSearching}
                        className="flex items-center gap-1.5 rounded-lg bg-[#354f52] px-5 py-2 text-xs font-bold text-white hover:bg-[#2f3e46] transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        {isSearching ? "Querying Apollo Database..." : "Fetch & Add to CRM"}
                    </button>
                </div>
            </div>
        </div>
    );
}
