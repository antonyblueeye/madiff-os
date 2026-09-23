"use client";

import { useState } from "react";
import Image from "next/image";
import { LeadItem } from "@/lib/mock-data";
import { Send, CheckCircle2, X } from "lucide-react";

interface ChannelPushModalProps {
    channelKey: "apollo" | "hubspot" | "reply" | "linkedhelper" | "zoho";
    leads: LeadItem[]; // 1 lead for single click, or multiple for bulk
    onClose: () => void;
    onSuccess: (channelKey: string, leadIds: string[], details: string) => void;
}

const channelMeta = {
    apollo: {
        name: "Apollo.io",
        logo: "/apollo.jpg",
        title: "Enrich & Verify via Apollo",
        description: "Pull updated phone numbers, tech stacks, and verify deliverability before outreach.",
        actionButton: "Run Apollo Enrichment",
    },
    hubspot: {
        name: "HubSpot CRM",
        logo: "/hubspot.png",
        title: "Sync to HubSpot CRM",
        description: "Create or update CRM contact and automatically generate deal in sales pipeline.",
        actionButton: "Sync to HubSpot Pipeline",
    },
    reply: {
        name: "Reply.io",
        logo: "/reply.png",
        title: "Enroll into Reply.io Sequence",
        description: "Push selected contacts into a multi-step cold email sequence.",
        actionButton: "Push to Reply Sequence",
    },
    linkedhelper: {
        name: "LinkedHelper",
        logo: "/linkedhelper.png",
        title: "Dispatch to LinkedHelper Flow",
        description: "Queue connection requests and LinkedIn InMail cadence within safety limits.",
        actionButton: "Queue in LinkedHelper",
    },
    zoho: {
        name: "Zoho Campaigns",
        logo: "/zoho_campaigns.webp",
        title: "Add to Zoho Newsletter Pool",
        description: "Subscribe contacts to candidate digest or client tech editorial lists.",
        actionButton: "Subscribe in Zoho",
    },
};

export function ChannelPushModal({
    channelKey,
    leads,
    onClose,
    onSuccess,
}: ChannelPushModalProps) {
    const meta = channelMeta[channelKey];
    const [selectedSequence, setSelectedSequence] = useState("EU FinTech CTOs Acceleration");
    const [selectedDealStage, setSelectedDealStage] = useState("Qualified Discovery");
    const [dealAmount, setDealAmount] = useState("$50,000");
    const [newsletterList, setNewsletterList] = useState("Madiff Engineering Talent Digest");
    const [linkedHelperCampaign, setLinkedHelperCampaign] = useState("VP & CTO Connect Flow");
    const [isExecuting, setIsExecuting] = useState(false);

    const handleConfirm = () => {
        setIsExecuting(true);
        setTimeout(() => {
            setIsExecuting(false);
            let detail = "";
            if (channelKey === "reply") detail = `Sequence: ${selectedSequence}`;
            else if (channelKey === "hubspot") detail = `Stage: ${selectedDealStage} (${dealAmount})`;
            else if (channelKey === "linkedhelper") detail = `Flow: ${linkedHelperCampaign}`;
            else if (channelKey === "zoho") detail = `List: ${newsletterList}`;
            else detail = "Enriched contact parameters";

            onSuccess(
                channelKey,
                leads.map((l) => l.id),
                detail
            );
        }, 600);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#eaedf3] space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-[#eaedf3] pb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-1.5 shadow-sm">
                            <Image
                                src={meta.logo}
                                alt={meta.name}
                                fill
                                sizes="40px"
                                className="object-contain p-1"
                            />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-[#1f2d3d]">{meta.title}</h3>
                            <p className="text-xs text-[#6e84a3]">{meta.name} Integration Gateway</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-[#95aac9] hover:bg-[#f1f4f8] hover:text-[#1f2d3d]"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <p className="text-xs text-[#475569] leading-relaxed">{meta.description}</p>

                {/* Target Audience Pill */}
                <div className="rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-3 text-xs">
                    <span className="font-bold text-[#6e84a3] uppercase text-[10px] block mb-1">
                        Selected Contacts ({leads.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                        {leads.map((l) => (
                            <span
                                key={l.id}
                                className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-xs font-semibold text-[#1f2d3d] border border-[#e2e8f0]"
                            >
                                {l.name} <span className="text-[#6e84a3] text-[10px]">({l.company})</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Channel-Specific Configuration Form */}
                <div className="space-y-3 pt-1">
                    {channelKey === "reply" && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-[#6e84a3]">
                                    Target Cold Sequence
                                </label>
                                <select
                                    value={selectedSequence}
                                    onChange={(e) => setSelectedSequence(e.target.value)}
                                    className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-2 text-xs font-medium text-[#1f2d3d] outline-none"
                                >
                                    <option value="EU FinTech CTOs Acceleration">EU FinTech CTOs Acceleration (4 Steps)</option>
                                    <option value="US AI Founders — Engineering Velocity">US AI Founders — Engineering Velocity (3 Steps)</option>
                                    <option value="Web3 & DeFi Enterprise Modernization">Web3 & DeFi Enterprise Modernization (3 Steps)</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-[#6e84a3]">Sending Mailbox</label>
                                <input
                                    readOnly
                                    value="anton@madiff.io (Warmup score 100%, 45 emails/day limit)"
                                    className="w-full rounded-lg border border-[#eaedf3] bg-[#f1f4f8] px-3 py-2 text-xs text-[#6e84a3] outline-none"
                                />
                            </div>
                        </>
                    )}

                    {channelKey === "hubspot" && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-[#6e84a3]">Pipeline Stage</label>
                            <select
                                value={selectedDealStage}
                                onChange={(e) => setSelectedDealStage(e.target.value)}
                                className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-2 text-xs font-medium text-[#1f2d3d] outline-none"
                            >
                                <option value="Lead Qualification">Lead Qualification</option>
                                <option value="Qualified Discovery">Qualified Discovery</option>
                                <option value="Proposal Sent">Proposal Sent</option>
                                <option value="Meeting Scheduled">Meeting Scheduled</option>
                            </select>
                        </div>
                    )}

                    {channelKey === "linkedhelper" && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-[#6e84a3]">LinkedHelper Flow Type</label>
                            <select
                                value={linkedHelperCampaign}
                                onChange={(e) => setLinkedHelperCampaign(e.target.value)}
                                className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-2 text-xs font-medium text-[#1f2d3d] outline-none"
                            >
                                <option value="VP & CTO Connect Flow">1st Connection Request + Personalized Intro Note</option>
                                <option value="InMail Direct Message Sequence">Direct InMail to Open Profiles (No Connect required)</option>
                                <option value="Profile Visit & Follow Cadence">Pre-warm Profile View + Endorsement</option>
                            </select>
                        </div>
                    )}

                    {channelKey === "zoho" && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-[#6e84a3]">Zoho Subscriber List</label>
                            <select
                                value={newsletterList}
                                onChange={(e) => setNewsletterList(e.target.value)}
                                className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-2 text-xs font-medium text-[#1f2d3d] outline-none"
                            >
                                <option value="Madiff Engineering Talent Digest">Madiff Engineering Talent Digest (3,890 subs)</option>
                                <option value="Client Executive Monthly Insights">Client Executive Monthly Insights (1,460 subs)</option>
                            </select>
                        </div>
                    )}

                    {channelKey === "apollo" && (
                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                            ✓ Verified email will be re-validated through Apollo real-time MX & SMTP ping.
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#eaedf3]">
                    <button
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 text-xs font-semibold text-[#6e84a3] hover:text-[#1f2d3d]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isExecuting}
                        className="flex items-center gap-1.5 rounded-lg bg-[#354f52] px-5 py-2 text-xs font-bold text-white hover:bg-[#2f3e46] transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Send className="h-3.5 w-3.5" />
                        {isExecuting ? "Executing Dispatch..." : meta.actionButton}
                    </button>
                </div>
            </div>
        </div>
    );
}
