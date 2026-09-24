"use client";

import { useState, useEffect } from "react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
    Send,
    Play,
    Pause,
    MailCheck,
    AlertCircle,
    CheckCircle2,
    Users,
    TrendingUp,
    RefreshCw,
    Mail,
    Plus,
} from "lucide-react";
import Link from "next/link";

interface OutreachCampaign {
    id: string;
    name: string;
    channel: "Reply.io (Email)" | "LinkedHelper (LinkedIn)";
    status: "active" | "paused" | "completed" | "draft";
    delivered: number;
    openRate: string;
    replyRate: string;
    inboxHealth: string;
    emailAccount?: string;
}

export default function ReplyOutreachPage() {
    const [campaigns, setCampaigns] = useState<OutreachCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [emailAccountsCount, setEmailAccountsCount] = useState(4);
    const [totalDeliveries, setTotalDeliveries] = useState(0);
    const [totalReplies, setTotalReplies] = useState(0);

    const loadLiveCampaigns = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/reply/campaigns");
            if (res.ok) {
                const data = await res.json();
                const camps: OutreachCampaign[] = (data.campaigns || []).map((c: any) => {
                    const delivered = c.deliveriesCount || 0;
                    const opens = c.opensCount || 0;
                    const replies = c.repliesCount || 0;
                    const openRate = delivered > 0 ? `${((opens / delivered) * 100).toFixed(1)}%` : "0.0%";
                    const replyRate = delivered > 0 ? `${((replies / delivered) * 100).toFixed(1)}%` : "0.0%";
                    const statusStr = c.status === 2 || c.status === "active" ? "active" : c.status === 4 ? "completed" : "paused";

                    return {
                        id: String(c.id),
                        name: c.name,
                        channel: "Reply.io (Email)",
                        status: statusStr,
                        delivered,
                        openRate,
                        replyRate,
                        inboxHealth: c.emailAccount ? `${c.emailAccount} (Optimal)` : "Active Senders",
                        emailAccount: c.emailAccount,
                    };
                });

                setCampaigns(camps);
                if (data.emailAccounts) {
                    setEmailAccountsCount(data.emailAccounts.length);
                }

                const sumDeliv = camps.reduce((acc, c) => acc + c.delivered, 0);
                const sumRep = (data.campaigns || []).reduce((acc: number, c: any) => acc + (c.repliesCount || 0), 0);
                setTotalDeliveries(sumDeliv);
                setTotalReplies(sumRep);
            }
        } catch (e: any) {
            console.error("Failed to load campaigns", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLiveCampaigns();
    }, []);

    const handleSync = async () => {
        setIsSyncing(true);
        setNotification("Synchronizing live data with Reply.io...");
        try {
            const res = await fetch("/api/reply/sync", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setNotification(data.message || `Reply.io synchronized successfully!`);
                await loadLiveCampaigns();
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

    return (
        <PagePlaceholder
            title="Reply.io Outreach Monitor"
            description="Manage multithreaded cold email campaigns, live deliveries, and sync conversations with HubSpot CRM."
            icon={Send}
            tag="Reply.io Live"
            actions={
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="flex items-center gap-1.5 rounded-lg border border-[#eaedf3] bg-white px-3 py-2 text-xs font-bold text-[#354f52] shadow-xs hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 ${isSyncing ? "animate-spin" : ""}`} />
                        {isSyncing ? "Syncing..." : "Sync Reply.io"}
                    </button>
                    <Link
                        href="/crm"
                        className="flex items-center gap-1.5 rounded-lg bg-[#354f52] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#2f3e46] transition-colors"
                    >
                        <Users className="h-4 w-4" /> Push Leads from CRM
                    </Link>
                </div>
            }
        >
            {notification && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    {notification}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase tracking-wide">
                        Connected Email Mailboxes
                    </span>
                    <p className="mt-1 text-2xl font-extrabold text-[#1f2d3d] font-mono">
                        {emailAccountsCount} Inboxes
                    </p>
                    <span className="text-[11px] text-[#10b981] font-semibold flex items-center gap-1 mt-1">
                        <CheckCircle2 className="h-3 w-3" /> Warmup active • Gmail & Outlook
                    </span>
                </Card>

                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase tracking-wide">
                        Total Deliveries (Outreach)
                    </span>
                    <p className="mt-1 text-2xl font-extrabold text-[#354f52] font-mono">
                        {totalDeliveries.toLocaleString()} emails
                    </p>
                    <span className="text-[11px] text-[#6e84a3] font-medium mt-1">
                        Across {campaigns.length} sequence campaigns
                    </span>
                </Card>

                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase tracking-wide">
                        Replies Captured
                    </span>
                    <p className="mt-1 text-2xl font-extrabold text-[#10b981] font-mono">
                        {totalReplies} Direct Replies
                    </p>
                    <span className="text-[11px] text-[#6e84a3] font-medium mt-1">
                        Auto-logged into HubSpot Notes & CRM cards
                    </span>
                </Card>
            </div>

            <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-[#1f2d3d]">Live Reply.io Campaigns & Sequences</h3>
                        <p className="text-xs text-[#6e84a3] mt-0.5">
                            Real-time campaigns pulled directly via Reply.io API v3/v1
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#eaedf3] text-[#6e84a3] font-bold uppercase text-[10px]">
                                <th className="pb-3">Campaign & Sequence</th>
                                <th className="pb-3">Sender Inbox</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Delivered</th>
                                <th className="pb-3">Open Rate</th>
                                <th className="pb-3">Reply Rate</th>
                                <th className="pb-3">Platform</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eaedf3]">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-[#95aac9]">
                                        <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-emerald-600" />
                                        Loading campaigns from Reply.io...
                                    </td>
                                </tr>
                            ) : campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-[#95aac9]">
                                        No campaigns found in Reply.io
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map((camp) => (
                                    <tr key={camp.id} className="hover:bg-[#f8fafc] transition-colors">
                                        <td className="py-3.5 pr-4">
                                            <div className="font-bold text-[#1f2d3d]">{camp.name}</div>
                                            <div className="text-[10px] text-[#95aac9] font-mono">ID: {camp.id}</div>
                                        </td>
                                        <td className="py-3.5 text-[#52796f] font-mono text-[11px]">
                                            {camp.emailAccount || "Auto-assigned"}
                                        </td>
                                        <td className="py-3.5">
                                            <Badge
                                                variant={
                                                    camp.status === "active"
                                                        ? "success"
                                                        : camp.status === "completed"
                                                        ? "sage"
                                                        : "warning"
                                                }
                                            >
                                                {camp.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3.5 font-bold font-mono text-[#1f2d3d]">
                                            {camp.delivered.toLocaleString()}
                                        </td>
                                        <td className="py-3.5 font-bold font-mono text-[#354f52]">
                                            {camp.openRate}
                                        </td>
                                        <td className="py-3.5 font-bold font-mono text-[#10b981]">
                                            {camp.replyRate}
                                        </td>
                                        <td className="py-3.5">
                                            <span className="rounded bg-[#f1f4f8] px-2 py-0.5 text-[11px] font-medium text-[#354f52] border border-[#e2e8f0]">
                                                {camp.channel}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </PagePlaceholder>
    );
}
