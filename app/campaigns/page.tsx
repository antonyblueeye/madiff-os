"use client";

import { useState, useEffect } from "react";
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

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<ReplyCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/reply/campaigns");
            if (res.ok) {
                const data = await res.json();
                setCampaigns(data.campaigns || []);
            }
        } catch (err: any) {
            console.error("Failed to load Reply campaigns:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleSync = async () => {
        setIsSyncing(true);
        setNotification("Syncing live campaign metrics from Reply.io...");
        try {
            const res = await fetch("/api/reply/sync", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setNotification(data.message || "Reply.io campaigns updated!");
                await fetchCampaigns();
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
    const totalCampaigns = campaigns.length;
    const totalDeliveries = campaigns.reduce((acc, c) => acc + (c.deliveriesCount || 0), 0);
    const totalOpens = campaigns.reduce((acc, c) => acc + (c.opensCount || 0), 0);
    const totalReplies = campaigns.reduce((acc, c) => acc + (c.repliesCount || 0), 0);
    const totalBounces = campaigns.reduce((acc, c) => acc + (c.bouncesCount || 0), 0);
    const totalProspects = campaigns.reduce((acc, c) => acc + (c.peopleCount || 0), 0);

    const overallOpenRate = totalDeliveries > 0 ? ((totalOpens / totalDeliveries) * 100).toFixed(1) : "0.0";
    const overallReplyRate = totalDeliveries > 0 ? ((totalReplies / totalDeliveries) * 100).toFixed(1) : "0.0";

    const getStatusLabel = (status: number | string) => {
        if (status === 2 || status === "active" || status === "Active") return { text: "Active", variant: "success" as const };
        if (status === 4 || status === "completed" || status === "Completed") return { text: "Completed", variant: "default" as const };
        if (status === 0 || status === "draft" || status === "Draft") return { text: "Draft / Paused", variant: "warning" as const };
        return { text: `Status ${status}`, variant: "default" as const };
    };

    const filteredCampaigns = campaigns.filter((c) => {
        if (statusFilter === "all") return true;
        const s = getStatusLabel(c.status).text.toLowerCase();
        if (statusFilter === "active") return s.includes("active");
        if (statusFilter === "completed") return s.includes("completed");
        if (statusFilter === "draft") return s.includes("draft") || s.includes("paused");
        return true;
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
                            Reply.io Cold Outreach Campaigns
                        </h1>
                        <Badge variant="accent">Live Reply.io Data</Badge>
                    </div>
                    <p className="text-xs text-[#6e84a3]">
                        Real-time delivery statistics, open rates, responses and sequence performance across your mailboxes.
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">Campaigns</span>
                    <div className="text-xl font-extrabold text-[#1f2d3d] font-mono">{totalCampaigns}</div>
                    <span className="text-[10px] text-[#95aac9] block">In Reply.io account</span>
                </Card>

                <Card className="p-4 space-y-1 bg-white border-[#eaedf3]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">Enrolled Prospects</span>
                    <div className="text-xl font-extrabold text-[#1f2d3d] font-mono">{totalProspects.toLocaleString()}</div>
                    <span className="text-[10px] text-[#95aac9] block">Across all sequences</span>
                </Card>

                <Card className="p-4 space-y-1 bg-white border-[#eaedf3]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">Delivered Emails</span>
                    <div className="text-xl font-extrabold text-[#354f52] font-mono">{totalDeliveries.toLocaleString()}</div>
                    <span className="text-[10px] text-[#95aac9] block">Total sent successfully</span>
                </Card>

                <Card className="p-4 space-y-1 bg-white border-[#eaedf3]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">Overall Opens</span>
                    <div className="text-xl font-extrabold text-blue-700 font-mono">
                        {totalOpens.toLocaleString()}{" "}
                        <span className="text-xs font-semibold text-blue-600 font-sans">({overallOpenRate}%)</span>
                    </div>
                    <span className="text-[10px] text-[#95aac9] block">Tracked email views</span>
                </Card>

                <Card className="p-4 space-y-1 bg-white border-[#eaedf3]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">Replies Received</span>
                    <div className="text-xl font-extrabold text-emerald-700 font-mono">
                        {totalReplies}{" "}
                        <span className="text-xs font-semibold text-emerald-600 font-sans">({overallReplyRate}%)</span>
                    </div>
                    <span className="text-[10px] text-[#95aac9] block">Direct prospect replies</span>
                </Card>

                <Card className="p-4 space-y-1 bg-white border-[#eaedf3]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">Bounces</span>
                    <div className="text-xl font-extrabold text-rose-600 font-mono">{totalBounces}</div>
                    <span className="text-[10px] text-[#95aac9] block">Undelivered addresses</span>
                </Card>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    {[
                        { key: "all", label: "All Campaigns" },
                        { key: "active", label: "Active" },
                        { key: "completed", label: "Completed" },
                        { key: "draft", label: "Draft / Paused" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setStatusFilter(tab.key)}
                            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                                statusFilter === tab.key
                                    ? "bg-[#354f52] text-white shadow-xs"
                                    : "border border-[#eaedf3] bg-white text-[#6e84a3] hover:text-[#1f2d3d]"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <span className="text-xs text-[#95aac9] font-medium">
                    Showing {filteredCampaigns.length} of {campaigns.length} campaigns
                </span>
            </div>

            {/* Campaign Cards List */}
            {loading ? (
                <div className="py-16 text-center text-xs text-[#6e84a3] space-y-2">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-[#354f52]" />
                    <p>Loading Reply.io campaigns...</p>
                </div>
            ) : filteredCampaigns.length === 0 ? (
                <Card className="p-8 text-center text-xs text-[#95aac9]">
                    No campaigns found matching the selected filter.
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredCampaigns.map((camp) => {
                        const statusObj = getStatusLabel(camp.status);
                        const delivered = camp.deliveriesCount || 0;
                        const opens = camp.opensCount || 0;
                        const replies = camp.repliesCount || 0;
                        const bounces = camp.bouncesCount || 0;
                        const optOuts = camp.optOutsCount || 0;

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
                                className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-5 hover:border-[#354f52]/40 transition-colors"
                            >
                                {/* Left Info */}
                                <div className="space-y-2 max-w-xl">
                                    <div className="flex flex-wrap items-center gap-2">
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

                                {/* Right: Real Metrics Grid */}
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

                                    {/* Bounces & Opt-outs */}
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
                </div>
            )}
        </div>
    );
}