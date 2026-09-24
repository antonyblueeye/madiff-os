"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { LeadItem } from "@/lib/mock-data";
import { Send, CheckCircle2, X, PlusCircle, List, Mail, AlertCircle, RefreshCw } from "lucide-react";

interface ChannelPushModalProps {
    channelKey: "hubspot" | "reply" | "linkedhelper" | "zoho";
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
        description: "Push selected contacts into a live Reply.io cold email sequence or create a new campaign on the fly.",
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
    const [isExecuting, setIsExecuting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Reply.io specific states
    const [replyCampaigns, setReplyCampaigns] = useState<any[]>([]);
    const [replyEmailAccounts, setReplyEmailAccounts] = useState<any[]>([]);
    const [isLoadingReplyData, setIsLoadingReplyData] = useState(false);
    const [replyMode, setReplyMode] = useState<"existing" | "new">("existing");
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
    
    // New Campaign Form
    const [newCampName, setNewCampName] = useState("");
    const [newCampSubject, setNewCampSubject] = useState("Exploring AI Engineering Collaboration with {{Company}}");
    const [newCampBody, setNewCampBody] = useState("Hi {{FirstName}},\n\nI noticed {{Company}}'s growth across technology initiatives. At MADIFF, we support leading enterprises with dedicated AI and software engineering teams.\n\nWould you be open to a brief introductory conversation this week?\n\nBest regards,\nMichal Ostrowski");
    const [selectedEmailAccId, setSelectedEmailAccId] = useState<string>("");

    // Other channels state
    const [selectedDealStage, setSelectedDealStage] = useState("Qualified Discovery");
    const [dealAmount, setDealAmount] = useState("$50,000");
    const [newsletterList, setNewsletterList] = useState("Madiff Engineering Talent Digest");
    const [linkedHelperCampaign, setLinkedHelperCampaign] = useState("VP & CTO Connect Flow");

    useEffect(() => {
        if (channelKey === "reply") {
            setIsLoadingReplyData(true);
            fetch("/api/reply/campaigns")
                .then((r) => r.json())
                .then((data) => {
                    if (data.campaigns && data.campaigns.length > 0) {
                        setReplyCampaigns(data.campaigns);
                        setSelectedCampaignId(String(data.campaigns[0].id));
                    }
                    if (data.emailAccounts && data.emailAccounts.length > 0) {
                        setReplyEmailAccounts(data.emailAccounts);
                        setSelectedEmailAccId(String(data.emailAccounts[0].id));
                    }
                })
                .catch((err) => {
                    console.error("Failed to load reply campaigns:", err);
                })
                .finally(() => {
                    setIsLoadingReplyData(false);
                });
        }
    }, [channelKey]);

    const handleConfirm = async () => {
        setIsExecuting(true);
        setErrorMsg(null);

        try {
            if (channelKey === "reply") {
                const payload: any = {
                    leadIds: leads.map((l) => l.id),
                    createNew: replyMode === "new",
                };

                if (replyMode === "existing") {
                    payload.campaignId = selectedCampaignId;
                } else {
                    payload.newCampaignName = newCampName.trim() || `New Sequence — ${new Date().toLocaleDateString()}`;
                    payload.newCampaignSubject = newCampSubject;
                    payload.newCampaignBody = newCampBody;
                    if (selectedEmailAccId) payload.emailAccountId = selectedEmailAccId;
                }

                const res = await fetch("/api/reply/push", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Failed to push to Reply.io");
                }

                const campTitle = replyMode === "new" ? data.campaignName : replyCampaigns.find((c) => String(c.id) === selectedCampaignId)?.name || "Sequence";
                onSuccess(
                    channelKey,
                    leads.map((l) => l.id),
                    `Enrolled in Reply.io Campaign: "${campTitle}"`
                );
            } else {
                // Other channels fallback
                let detail = "";
                if (channelKey === "hubspot") detail = `Stage: ${selectedDealStage} (${dealAmount})`;
                else if (channelKey === "linkedhelper") detail = `Flow: ${linkedHelperCampaign}`;
                else if (channelKey === "zoho") detail = `List: ${newsletterList}`;
                else detail = "Enriched contact parameters";

                onSuccess(
                    channelKey,
                    leads.map((l) => l.id),
                    detail
                );
            }
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-[#eaedf3] space-y-4">
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
                            <p className="text-xs text-[#6e84a3]">
                                {meta.name} Integration Gateway • {leads.length > 1 ? `Bulk Dispatch (${leads.length} leads)` : "Single Contact"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-[#95aac9] hover:bg-[#f1f4f8] hover:text-[#1f2d3d]"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {errorMsg && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Target Audience Pill */}
                <div className="rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-3 text-xs">
                    <span className="font-bold text-[#6e84a3] uppercase text-[10px] block mb-1">
                        Recipients to enroll ({leads.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                        {leads.map((l) => (
                            <span
                                key={l.id}
                                className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-xs font-semibold text-[#1f2d3d] border border-[#e2e8f0]"
                            >
                                {l.name} <span className="text-[#6e84a3] text-[10px]">({l.email})</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Channel-Specific Configuration Form */}
                <div className="space-y-3 pt-1">
                    {channelKey === "reply" && (
                        <div className="space-y-3">
                            {/* Toggle mode: Existing Sequence vs Create New */}
                            <div className="flex rounded-lg border border-[#eaedf3] p-1 bg-[#f8fafc] text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setReplyMode("existing")}
                                    className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                                        replyMode === "existing"
                                            ? "bg-white text-[#1f2d3d] shadow-xs font-bold"
                                            : "text-[#6e84a3] hover:text-[#1f2d3d]"
                                    }`}
                                >
                                    <List className="h-3.5 w-3.5" /> Select Existing Campaign
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReplyMode("new")}
                                    className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                                        replyMode === "new"
                                            ? "bg-white text-[#1f2d3d] shadow-xs font-bold"
                                            : "text-[#6e84a3] hover:text-[#1f2d3d]"
                                    }`}
                                >
                                    <PlusCircle className="h-3.5 w-3.5 text-emerald-600" /> Create New Sequence
                                </button>
                            </div>

                            {replyMode === "existing" ? (
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase text-[#6e84a3] flex items-center justify-between">
                                        <span>Target Reply.io Campaign</span>
                                        {isLoadingReplyData && <span className="text-emerald-600">Loading campaigns...</span>}
                                    </label>
                                    <select
                                        value={selectedCampaignId}
                                        onChange={(e) => setSelectedCampaignId(e.target.value)}
                                        className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-2 text-xs font-medium text-[#1f2d3d] outline-none focus:border-[#354f52]"
                                    >
                                        {replyCampaigns.map((camp) => (
                                            <option key={camp.id} value={camp.id}>
                                                {camp.name} ({camp.deliveriesCount || 0} sent • {camp.repliesCount || 0} replies)
                                            </option>
                                        ))}
                                    </select>
                                    <div className="text-[11px] text-[#6e84a3] bg-[#f8fafc] p-2.5 rounded-lg border border-[#eaedf3]">
                                        Contacts will be immediately added and processed according to sequence steps & schedules.
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2.5 border border-emerald-100 bg-[#f4f9f6]/40 p-3.5 rounded-xl">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-[#52796f]">Sequence Name</label>
                                        <input
                                            value={newCampName}
                                            onChange={(e) => setNewCampName(e.target.value)}
                                            placeholder="e.g., Q4 Enterprise AI Outreach — Poland"
                                            className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52]"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-[#52796f]">Sender Email Mailbox</label>
                                        <select
                                            value={selectedEmailAccId}
                                            onChange={(e) => setSelectedEmailAccId(e.target.value)}
                                            className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52]"
                                        >
                                            {replyEmailAccounts.map((acc) => (
                                                <option key={acc.id} value={acc.id}>
                                                    {acc.senderName} ({acc.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-[#52796f]">Step 1: Email Subject</label>
                                        <input
                                            value={newCampSubject}
                                            onChange={(e) => setNewCampSubject(e.target.value)}
                                            placeholder="Subject..."
                                            className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs font-semibold text-[#1f2d3d] outline-none focus:border-[#354f52]"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-[#52796f]">Step 1: Email Body Template</label>
                                        <textarea
                                            value={newCampBody}
                                            onChange={(e) => setNewCampBody(e.target.value)}
                                            rows={4}
                                            className="w-full rounded-lg border border-[#eaedf3] bg-white p-2.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] leading-relaxed font-sans"
                                        />
                                        <span className="text-[10px] text-[#6e84a3]">Supported variables: <code>{'{{FirstName}}'}</code>, <code>{'{{Company}}'}</code></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {channelKey === "hubspot" && (
                        <div className="space-y-2">
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
                        <div className="space-y-2">
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
                        <div className="space-y-2">
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
                        {isExecuting ? (
                            <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Send className="h-3.5 w-3.5" />
                                {replyMode === "new" ? "Create & Push to Sequence" : meta.actionButton}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
