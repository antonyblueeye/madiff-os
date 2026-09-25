"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
    Share2,
    Send,
    RefreshCw,
    Mail,
    Users,
    Eye,
    CornerUpLeft,
    AlertOctagon,
    Calendar,
    UserCheck,
    CheckCircle2,
    BarChart3,
    ArrowUpRight,
    MessageSquare,
    ExternalLink,
    Filter,
} from "lucide-react";
import Link from "next/link";

interface ReplyCampaign {
    id: number;
    name: string;
    created?: string;
    status: number | string;
    emailAccount?: string;
    emailAccounts?: string[];
    ownerEmail?: string;
    deliveriesCount: number;
    opensCount: number;
    repliesCount: number;
    bouncesCount: number;
    optOutsCount: number;
    outOfOfficeCount?: number;
    peopleCount: number;
    peopleFinished?: number;
    peopleActive?: number;
    peoplePaused?: number;
}

interface LinkedHelperCampaign {
    id: string;
    name: string;
    source: string;
    status: string;
    prospectsCount: number;
    connectedCount: number;
    messagedCount: number;
    repliedCount: number;
    connectionRate: string;
    replyRate: string;
    firstEventAt?: string;
    lastEventAt?: string;
    recentActivity?: {
        id: number;
        fullName?: string;
        company?: string;
        occupation?: string;
        profileUrl?: string;
        eventType?: string;
        createdAt?: string;
    }[];
}

export default function CampaignsPage() {
    const [replyCampaigns, setReplyCampaigns] = useState<ReplyCampaign[]>([]);
    const [lhCampaigns, setLhCampaigns] = useState<LinkedHelperCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    
    // Channel filter: All channels, Reply.io (Email), or LinkedHelper (LinkedIn)
    const [channelTab, setChannelTab] = useState<"all" | "reply" | "linkedhelper">("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const fetchAllCampaigns = async () => {
        try {
            setLoading(true);
            const [replyRes, lhRes] = await Promise.all([
                fetch("/api/reply/campaigns"),
                fetch("/api/linkedhelper/campaigns"),
            ]);

            if (replyRes.ok) {
                const data = await replyRes.json();
                setReplyCampaigns(data.campaigns || []);
            }

            if (lhRes.ok) {
                const data = await lhRes.json();
                setLhCampaigns(data.campaigns || []);
            }
        } catch (err: any) {
            console.error("Failed to load campaigns:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllCampaigns();
    }, []);

    const handleSync = async () => {
        setIsSyncing(true);
        setNotification("Syncing live campaign metrics from Reply.io and LinkedHelper...");
        try {
            const res = await fetch("/api/reply/sync", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setNotification(data.message || "Outreach campaigns updated!");
                await fetchAllCampaigns();
            } else {
                setNotification(`Sync error: ${data.error || "Failed"}`);
            }
        } catch (err: any) {
            setNotification(`Sync failed: ${err.message}`);
        } finally {
            setIsSyncing(false);
            setTimeout(() => setNotification(null), 5000);
        }
    };

    // Calculate aggregated metrics
    const totalReplyCampaigns = replyCampaigns.length;
    const totalLhCampaigns = lhCampaigns.length;
    const totalCampaigns = totalReplyCampaigns + totalLhCampaigns;

    const totalReplyDeliveries = replyCampaigns.reduce((acc, c) => acc + (c.deliveriesCount || 0), 0);
    const totalReplyOpens = replyCampaigns.reduce((acc, c) => acc + (c.opensCount || 0), 0);
    const totalReplyReplies = replyCampaigns.reduce((acc, c) => acc + (c.repliesCount || 0), 0);
    const totalReplyBounces = replyCampaigns.reduce((acc, c) => acc + (c.bouncesCount || 0), 0);
    const totalReplyProspects = replyCampaigns.reduce((acc, c) => acc + (c.peopleCount || 0), 0);

    const totalLhProspects = lhCampaigns.reduce((acc, c) => acc + (c.prospectsCount || 0), 0);
    const totalLhConnected = lhCampaigns.reduce((acc, c) => acc + (c.connectedCount || 0), 0);
    const totalLhReplies = lhCampaigns.reduce((acc, c) => acc + (c.repliedCount || 0), 0);

    const overallTotalProspects = totalReplyProspects + totalLhProspects;
    const overallTotalReplies = totalReplyReplies + totalLhReplies;

    const overallOpenRate = totalReplyDeliveries > 0 ? ((totalReplyOpens / totalReplyDeliveries) * 100).toFixed(1) : "0.0";
    const overallReplyRate = totalReplyDeliveries > 0 ? ((totalReplyReplies / totalReplyDeliveries) * 100).toFixed(1) : "0.0";

    const getStatusLabel = (status: number | string) => {
        if (typeof status === "string") return { text: status, variant: "neutral" as const };
        switch (status) {
            case 0:
                return { text: "Draft", variant: "neutral" as const };
            case 1:
                return { text: "Active", variant: "success" as const };
            case 2:
                return { text: "Paused", variant: "warning" as const };
            case 3:
                return { text: "Archived", variant: "neutral" as const };
            case 4:
                return { text: "Completed", variant: "accent" as const };
            default:
                return { text: `Status #${status}`, variant: "neutral" as const };
        }
    };

    const filteredReply = replyCampaigns.filter((c) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "active") return c.status === 1 || c.status === "Active";
        if (statusFilter === "completed") return c.status === 4 || c.status === "Completed";
        if (statusFilter === "draft") return c.status === 0 || c.status === 2 || c.status === "Paused" || c.status === "Draft";
        return true;
    });

    const filteredLh = lhCampaigns.filter((c) => {
        if (statusFilter === "completed") return false;
        if (statusFilter === "draft") return false;
        return true; // LH campaigns with incoming webhooks are considered active
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eaedf3] pb-5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#354f52] text-white shadow-xs">
                            <Share2 className="h-5 w-5" />
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight text-[#1f2d3d]">
                            Outbound Sequences & Campaigns
                        </h1>
                        <Badge variant="accent">Reply.io + LinkedHelper</Badge>
                    </div>
                    <p className="text-xs text-[#6e84a3]">
                        Central outreach cockpit combining cold email cadences (Reply.io) and automated LinkedIn sequences (LinkedHelper 2).
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="inline-flex items-center gap-2 rounded-xl bg-white border border-[#eaedf3] px-3.5 py-2 text-xs font-bold text-[#1f2d3d] hover:bg-[#f8fafc] hover:border-[#354f52] transition-colors shadow-xs"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 text-[#354f52] ${isSyncing ? "animate-spin" : ""}`} />
                        <span>{isSyncing ? "Syncing..." : "Update Live Stats"}</span>
                    </button>
                    <Link
                        href="/crm"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#354f52] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#2f3e46] transition-colors shadow-xs"
                    >
                        <Users className="h-3.5 w-3.5" />
                        <span>View Leads in CRM</span>
                    </Link>
                </div>
            </div>

            {/* Notification Toast */}
            {notification && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-xs flex items-center justify-between animate-in fade-in">
                    <span>{notification}</span>
                    <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">
                        ✕
                    </button>
                </div>
            )}

            {/* Top Aggregated Analytics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <Card className="p-4 space-y-1 bg-white border-[#eaedf3]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">Total Campaigns</span>
                    <div className="text-xl font-extrabold text-[#1f2d3d] font-mono">{totalCampaigns}</div>
                    <span className="text-[10px] text-[#95aac9] block">
                        {totalReplyCampaigns} Reply + {totalLhCampaigns} LinkedIn
                    </span>
                </Card>

                <Card className="p-4 space-y-1 bg-white border-[#eaedf3]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">Enrolled Prospects</span>
                    <div className="text-xl font-extrabold text-[#1f2d3d] font-mono">{overallTotalProspects.toLocaleString()}</div>
                    <span className="text-[10px] text-[#95aac9] block">Across Email & LinkedIn</span>
                </Card>

                <Card className="p-4 space-y-1 bg-white border-[#eaedf3]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">LinkedIn 1st Degree</span>
                    <div className="text-xl font-extrabold text-[#0077b5] font-mono">{totalLhConnected.toLocaleString()}</div>
                    <span className="text-[10px] text-[#95aac9] block">Via LinkedHelper webhook</span>
                </Card>

                <Card className="p-4 space-y-1 bg-white border-[#eaedf3]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">Email Deliveries</span>
                    <div className="text-xl font-extrabold text-[#354f52] font-mono">{totalReplyDeliveries.toLocaleString()}</div>
                    <span className="text-[10px] text-[#95aac9] block">{overallOpenRate}% open rate</span>
                </Card>

                <Card className="p-4 space-y-1 bg-white border-[#eaedf3]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">Total Replies</span>
                    <div className="text-xl font-extrabold text-emerald-700 font-mono">
                        {overallTotalReplies}{" "}
                        <span className="text-xs font-semibold text-emerald-600 font-sans">
                            ({totalReplyReplies} Email)
                        </span>
                    </div>
                    <span className="text-[10px] text-[#95aac9] block">Direct prospect responses</span>
                </Card>

                <Card className="p-4 space-y-1 bg-white border-[#eaedf3]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">Email Bounces</span>
                    <div className="text-xl font-extrabold text-rose-600 font-mono">{totalReplyBounces}</div>
                    <span className="text-[10px] text-[#95aac9] block">Undelivered addresses</span>
                </Card>
            </div>

            {/* Channel Tabs & Status Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Channel Selector Pills */}
                <div className="flex items-center gap-1.5 p-1 bg-[#f1f4f8] rounded-xl border border-[#eaedf3]">
                    <button
                        onClick={() => setChannelTab("all")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            channelTab === "all" ? "bg-white text-[#1f2d3d] shadow-xs" : "text-[#6e84a3] hover:text-[#1f2d3d]"
                        }`}
                    >
                        <span>All Channels</span>
                        <span className="rounded-full bg-[#e2e8f0] px-1.5 py-0.2 text-[10px] font-mono text-[#475569]">
                            {totalCampaigns}
                        </span>
                    </button>

                    <button
                        onClick={() => setChannelTab("reply")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            channelTab === "reply" ? "bg-white text-[#1f2d3d] shadow-xs" : "text-[#6e84a3] hover:text-[#1f2d3d]"
                        }`}
                    >
                        <div className="relative h-4 w-4">
                            <Image src="/reply.png" alt="Reply.io" fill className="object-contain" sizes="16px" />
                        </div>
                        <span>Reply.io Email</span>
                        <span className="rounded-full bg-[#e2e8f0] px-1.5 py-0.2 text-[10px] font-mono text-[#475569]">
                            {totalReplyCampaigns}
                        </span>
                    </button>

                    <button
                        onClick={() => setChannelTab("linkedhelper")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            channelTab === "linkedhelper" ? "bg-white text-[#1f2d3d] shadow-xs" : "text-[#6e84a3] hover:text-[#1f2d3d]"
                        }`}
                    >
                        <div className="relative h-4 w-4">
                            <Image src="/linkedhelper.png" alt="LinkedHelper" fill className="object-contain" sizes="16px" />
                        </div>
                        <span>LinkedHelper</span>
                        <span className="rounded-full bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[10px] font-mono font-bold">
                            {totalLhCampaigns}
                        </span>
                    </button>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    {[
                        { key: "all", label: "All Statuses" },
                        { key: "active", label: "Active" },
                        { key: "completed", label: "Completed" },
                        { key: "draft", label: "Draft / Paused" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setStatusFilter(tab.key)}
                            className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                                statusFilter === tab.key
                                    ? "bg-[#354f52] text-white shadow-xs"
                                    : "border border-[#eaedf3] bg-white text-[#6e84a3] hover:text-[#1f2d3d]"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Campaign Cards List */}
            {loading ? (
                <div className="py-16 text-center text-xs text-[#6e84a3] space-y-2">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-[#354f52]" />
                    <p>Loading campaigns from Reply.io and LinkedHelper...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {/* SECTION 1: LINKEDHELPER CAMPAIGNS */}
                    {(channelTab === "all" || channelTab === "linkedhelper") && (
                        <>
                            {filteredLh.map((lhCamp) => (
                                <Card
                                    key={lhCamp.id}
                                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-5 border-l-4 border-l-[#0077b5] hover:border-[#354f52]/40 transition-colors bg-white shadow-xs"
                                >
                                    {/* Left Info */}
                                    <div className="space-y-2 max-w-xl">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#0077b5]/10 px-2 py-0.5 text-[11px] font-bold text-[#0077b5]">
                                                <div className="relative h-3.5 w-3.5">
                                                    <Image src="/linkedhelper.png" alt="LinkedHelper" fill className="object-contain" sizes="14px" />
                                                </div>
                                                LinkedHelper Sequence
                                            </span>
                                            <Badge variant="success">Webhook Active</Badge>
                                            <span className="text-[11px] font-mono text-[#95aac9]">Campaign ID: {lhCamp.id}</span>
                                        </div>

                                        <h3 className="text-base font-extrabold text-[#1f2d3d] flex items-center gap-2">
                                            <span>{lhCamp.name}</span>
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#6e84a3]">
                                            <div className="flex items-center gap-1.5">
                                                <Users className="h-3.5 w-3.5 text-[#0077b5]" />
                                                <span>
                                                    <strong>{lhCamp.prospectsCount}</strong> LinkedIn profiles captured
                                                </span>
                                            </div>
                                            {lhCamp.lastEventAt && (
                                                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                                    <Calendar className="h-3.5 w-3.5 text-[#95aac9]" />
                                                    <span>Last event: {new Date(lhCamp.lastEventAt).toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Micro recent activity avatar/name pill */}
                                        {lhCamp.recentActivity && lhCamp.recentActivity.length > 0 && (
                                            <div className="pt-1 flex items-center gap-1 text-[11px] text-[#6e84a3]">
                                                <span className="font-semibold text-[#1f2d3d]">Latest profiles:</span>
                                                <span className="truncate max-w-md">
                                                    {lhCamp.recentActivity.map((a) => a.fullName).filter(Boolean).join(", ")}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: LinkedHelper Real Metrics Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-3 text-center min-w-[360px]">
                                        {/* Captured Profiles */}
                                        <div className="px-2 py-1">
                                            <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-[#6e84a3]">
                                                <Users className="h-3 w-3 text-[#354f52]" />
                                                <span>Profiles</span>
                                            </div>
                                            <p className="text-sm font-extrabold font-mono text-[#1f2d3d] mt-0.5">
                                                {lhCamp.prospectsCount}
                                            </p>
                                            <span className="text-[10px] text-[#95aac9]">From sequence</span>
                                        </div>

                                        {/* 1st Connections */}
                                        <div className="px-2 py-1">
                                            <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-[#6e84a3]">
                                                <CheckCircle2 className="h-3 w-3 text-[#0077b5]" />
                                                <span>Connected</span>
                                            </div>
                                            <p className="text-sm font-extrabold font-mono text-[#0077b5] mt-0.5">
                                                {lhCamp.connectedCount}
                                            </p>
                                            <span className="text-[10px] font-semibold text-[#0077b5] font-mono">
                                                {lhCamp.connectionRate}%
                                            </span>
                                        </div>

                                        {/* Messages Exchanged */}
                                        <div className="px-2 py-1">
                                            <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-[#6e84a3]">
                                                <MessageSquare className="h-3 w-3 text-emerald-600" />
                                                <span>Messages</span>
                                            </div>
                                            <p className="text-sm font-extrabold font-mono text-emerald-700 mt-0.5">
                                                {lhCamp.messagedCount}
                                            </p>
                                            <span className="text-[10px] font-semibold text-emerald-600 font-mono">
                                                Threads
                                            </span>
                                        </div>

                                        {/* Inbound Replies */}
                                        <div className="px-2 py-1">
                                            <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-[#6e84a3]">
                                                <CornerUpLeft className="h-3 w-3 text-purple-600" />
                                                <span>Replies</span>
                                            </div>
                                            <p className="text-sm font-extrabold font-mono text-purple-700 mt-0.5">
                                                {lhCamp.repliedCount}
                                            </p>
                                            <span className="text-[10px] font-semibold text-purple-600 font-mono">
                                                {lhCamp.replyRate}%
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </>
                    )}

                    {/* SECTION 2: REPLY.IO CAMPAIGNS */}
                    {(channelTab === "all" || channelTab === "reply") && (
                        <>
                            {filteredReply.map((camp) => {
                                const statusObj = getStatusLabel(camp.status);
                                const delivered = camp.deliveriesCount || 0;
                                const opens = camp.opensCount || 0;
                                const replies = camp.repliesCount || 0;
                                const bounces = camp.bouncesCount || 0;

                                const openPct = delivered > 0 ? ((opens / delivered) * 100).toFixed(1) : "0.0";
                                const replyPct = delivered > 0 ? ((replies / delivered) * 100).toFixed(1) : "0.0";
                                const bouncePct = delivered > 0 ? ((bounces / delivered) * 100).toFixed(1) : "0.0";

                                const senderMailbox =
                                    camp.emailAccounts && camp.emailAccounts.length > 0
                                        ? camp.emailAccounts.join(", ")
                                        : camp.emailAccount || "Auto-assigned Mailbox";

                                return (
                                    <Card
                                        key={camp.id}
                                        className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-5 border-l-4 border-l-[#52796f] hover:border-[#354f52]/40 transition-colors bg-white shadow-xs"
                                    >
                                        {/* Left Info */}
                                        <div className="space-y-2 max-w-xl">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#52796f]/10 px-2 py-0.5 text-[11px] font-bold text-[#354f52]">
                                                    <div className="relative h-3.5 w-3.5">
                                                        <Image src="/reply.png" alt="Reply.io" fill className="object-contain" sizes="14px" />
                                                    </div>
                                                    Reply.io Cold Email
                                                </span>
                                                <Badge variant={statusObj.variant}>{statusObj.text}</Badge>
                                                <span className="text-[11px] font-mono text-[#95aac9]">ID: {camp.id}</span>
                                                <span className="inline-flex items-center gap-1 rounded bg-[#f1f4f8] px-2 py-0.5 text-[11px] font-medium text-[#475569]">
                                                    <Mail className="h-3 w-3 text-[#354f52]" />
                                                    <span>{senderMailbox}</span>
                                                </span>
                                            </div>

                                            <h3 className="text-base font-extrabold text-[#1f2d3d] flex items-center gap-2">
                                                <span>{camp.name}</span>
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-4 text-xs text-[#6e84a3]">
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="h-3.5 w-3.5 text-[#354f52]" />
                                                    <span>
                                                        <strong>{camp.peopleCount || 0}</strong> prospects enrolled
                                                        {camp.peopleActive ? ` (${camp.peopleActive} active)` : ""}
                                                    </span>
                                                </div>
                                                {camp.ownerEmail && (
                                                    <div className="flex items-center gap-1.5">
                                                        <UserCheck className="h-3.5 w-3.5 text-[#95aac9]" />
                                                        <span>Owner: {camp.ownerEmail}</span>
                                                    </div>
                                                )}
                                                {camp.created && (
                                                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                                        <Calendar className="h-3.5 w-3.5 text-[#95aac9]" />
                                                        <span>{new Date(camp.created).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: Reply.io Real Metrics Grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-3 text-center min-w-[360px]">
                                            {/* Deliveries */}
                                            <div className="px-2 py-1">
                                                <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-[#6e84a3]">
                                                    <Send className="h-3 w-3 text-[#354f52]" />
                                                    <span>Delivered</span>
                                                </div>
                                                <p className="text-sm font-extrabold font-mono text-[#1f2d3d] mt-0.5">
                                                    {delivered.toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Opens */}
                                            <div className="px-2 py-1">
                                                <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-[#6e84a3]">
                                                    <Eye className="h-3 w-3 text-blue-600" />
                                                    <span>Opens</span>
                                                </div>
                                                <p className="text-sm font-extrabold font-mono text-blue-700 mt-0.5">
                                                    {opens}
                                                </p>
                                                <span className="text-[10px] font-semibold text-blue-600 font-mono">
                                                    {openPct}%
                                                </span>
                                            </div>

                                            {/* Replies */}
                                            <div className="px-2 py-1">
                                                <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-[#6e84a3]">
                                                    <CornerUpLeft className="h-3 w-3 text-emerald-600" />
                                                    <span>Replies</span>
                                                </div>
                                                <p className="text-sm font-extrabold font-mono text-emerald-700 mt-0.5">
                                                    {replies}
                                                </p>
                                                <span className="text-[10px] font-semibold text-emerald-600 font-mono">
                                                    {replyPct}%
                                                </span>
                                            </div>

                                            {/* Bounces */}
                                            <div className="px-2 py-1">
                                                <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-[#6e84a3]">
                                                    <AlertOctagon className="h-3 w-3 text-rose-500" />
                                                    <span>Bounces</span>
                                                </div>
                                                <p className="text-sm font-extrabold font-mono text-rose-600 mt-0.5">
                                                    {bounces}
                                                </p>
                                                <span className="text-[10px] font-semibold text-rose-500 font-mono">
                                                    {bouncePct}%
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </>
                    )}

                    {filteredReply.length === 0 && filteredLh.length === 0 && (
                        <Card className="p-8 text-center text-xs text-[#95aac9]">
                            No campaigns found matching the selected channel or filter.
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}