"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import {
    Mail,
    Users,
    RefreshCw,
    ExternalLink,
    MousePointerClick,
    CheckCircle2,
    Calendar,
    Search,
    Link2,
    BarChart3
} from "lucide-react";
import { NewsletterPerformanceCharts } from "@/components/newsletter/NewsletterPerformanceCharts";

interface ZohoCampaign {
    campaign_key: string;
    campaign_id: string;
    campaign_name: string;
    subject: string;
    from_email: string;
    campaign_status: string;
    sent_time: string;
    campaign_preview: string | null;
    emails_sent_count: number;
    delivered_count: number;
    delivered_percent: string;
    opens_count: number;
    open_percent: string;
    unique_clicked_percent: string;
    bounces_count: number;
    bounce_percent: string;
    unsubscribes_count: number;
    synced_at: string;
}

interface ZohoClick {
    id: number;
    campaign_key: string;
    campaign_name: string;
    contact_email: string;
    contact_name: string | null;
    clicked_url: string;
    click_count: number;
    clicked_at: string;
}

interface ZohoList {
    list_key: string;
    list_name: string;
    contacts_count: number;
    unsub_count: number;
    bounce_count: number;
    created_time: string;
}

interface MonthlyTrendItem {
    month: string;
    campaign_count: number;
    total_sent: string;
    total_delivered: string;
    total_opens: string;
    total_bounces: string;
    avg_open_rate: string;
    avg_delivery_rate: string;
    avg_click_rate: string;
}

interface ZohoStats {
    total_campaigns: number;
    total_sent: string;
    total_delivered: string;
    total_opens: string;
    total_bounces: string;
    total_unsubs: string;
    avg_open_rate: string;
    avg_click_rate: string;
    avg_delivery_rate: string;
    total_subscribers: number;
    total_lists: number;
}

export default function ZohoNewsletterPage() {
    const [stats, setStats] = useState<ZohoStats | null>(null);
    const [campaigns, setCampaigns] = useState<ZohoCampaign[]>([]);
    const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendItem[]>([]);
    const [clicks, setClicks] = useState<ZohoClick[]>([]);
    const [lists, setLists] = useState<ZohoList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"campaigns" | "monthly" | "clicks" | "lists">("campaigns");

    const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

    const loadData = async (isManualUpdate = false) => {
        setIsLoading(true);
        if (isManualUpdate) {
            setNotification("Checking and refreshing local data from PostgreSQL...");
        }
        try {
            const res = await fetch("/api/zoho/campaigns?newsletter=true");
            const data = await res.json();
            if (res.ok) {
                setStats(data.stats);
                setCampaigns(data.campaigns || []);
                setMonthlyTrend(data.monthlyTrend || []);
                setClicks(data.clicks || []);
                setLists(data.lists || []);
                setLastSyncedAt(data.lastSyncedAt || null);
                if (isManualUpdate) {
                    setNotification("Data refreshed successfully!");
                    setTimeout(() => setNotification(null), 3000);
                }
            }
        } catch (err: any) {
            console.error("Failed to load Zoho data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSync = async () => {
        setIsSyncing(true);
        setNotification("Connecting to Zoho Campaigns API and syncing newsletters & performance...");
        try {
            const res = await fetch("/api/zoho/sync", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setNotification(`Sync complete! ${data.message}`);
                setLastSyncedAt(data.syncedAt || new Date().toISOString());
                await loadData();
            } else {
                setNotification(`Sync error: ${data.error || "Failed"}`);
            }
        } catch (err: any) {
            setNotification(`Sync error: ${err.message}`);
        } finally {
            setIsSyncing(false);
            setTimeout(() => setNotification(null), 5000);
        }
    };

    const filteredCampaigns = campaigns.filter((c) =>
        (c.campaign_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.subject || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredClicks = clicks.filter((cl) =>
        (cl.contact_email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cl.contact_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cl.clicked_url || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cl.campaign_name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredLists = lists.filter((l) =>
        (l.list_name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatLastUpdated = (dateStr: string | null) => {
        if (!dateStr) return "Not synced yet";
        try {
            const d = new Date(dateStr);
            return d.toLocaleString("ru-RU", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-[#1f2d3d] flex items-center gap-2">
                        <span>Newsletter Analytics</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Zoho Campaigns Live
                        </span>
                    </h1>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#6e84a3]">
                        <span>Consolidated &ldquo;Newsletter&rdquo; editions and metrics</span>
                        <span className="text-[#cbd5e1]">•</span>
                        <span className="flex items-center gap-1">
                            <span className="font-semibold text-[#1f2d3d]">Last updated:</span>{" "}
                            <span className="font-mono text-[#354f52] font-bold bg-[#f1f4f8] px-2 py-0.5 rounded">
                                {formatLastUpdated(lastSyncedAt)}
                            </span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => loadData(true)}
                        disabled={isLoading || isSyncing}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#eaedf3] bg-white px-3.5 py-2 text-xs font-bold text-[#354f52] shadow-xs hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
                        title="Reload latest numbers from local PostgreSQL database"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoading && !isSyncing ? "animate-spin" : ""}`} />
                        <span>{isLoading && !isSyncing ? "Updating..." : "Update View"}</span>
                    </button>

                    <button
                        onClick={handleSync}
                        disabled={isSyncing || isLoading}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#354f52] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#2f3e46] transition-colors disabled:opacity-50"
                        title="Pull latest campaigns and recipient activity from Zoho Campaigns cloud"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                        <span>{isSyncing ? "Syncing with Zoho..." : "Sync Zoho Campaigns"}</span>
                    </button>
                </div>
            </div>

            {/* Notification alert */}
            {notification && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{notification}</span>
                    </div>
                </div>
            )}

            {/* KPI Cards Row (Filtered specifically for Newsletters) */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <Card className="p-4">
                    <span className="text-[10px] font-bold text-[#6e84a3] uppercase tracking-wider">Newsletters</span>
                    <p className="mt-1 text-2xl font-black text-[#1f2d3d] font-mono">
                        {stats?.total_campaigns || 0}
                    </p>
                    <span className="text-[10px] text-[#6e84a3] font-medium mt-1 block">Sent editions</span>
                </Card>

                <Card className="p-4">
                    <span className="text-[10px] font-bold text-[#6e84a3] uppercase tracking-wider">Total Sent</span>
                    <p className="mt-1 text-2xl font-black text-[#1f2d3d] font-mono">
                        {parseInt(stats?.total_sent || "0", 10).toLocaleString()}
                    </p>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                        {stats?.avg_delivery_rate || 0}% delivery rate
                    </span>
                </Card>

                <Card className="p-4">
                    <span className="text-[10px] font-bold text-[#6e84a3] uppercase tracking-wider">Delivered</span>
                    <p className="mt-1 text-2xl font-black text-[#52796f] font-mono">
                        {parseInt(stats?.total_delivered || "0", 10).toLocaleString()}
                    </p>
                    <span className="text-[10px] text-[#6e84a3] font-medium mt-1 block">Reached inboxes</span>
                </Card>

                <Card className="p-4">
                    <span className="text-[10px] font-bold text-[#6e84a3] uppercase tracking-wider">Total Opens</span>
                    <p className="mt-1 text-2xl font-black text-[#354f52] font-mono">
                        {parseInt(stats?.total_opens || "0", 10).toLocaleString()}
                    </p>
                    <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                        Avg {stats?.avg_open_rate || 0}% open rate
                    </span>
                </Card>

                <Card className="p-4">
                    <span className="text-[10px] font-bold text-[#6e84a3] uppercase tracking-wider">Avg Click Rate</span>
                    <p className="mt-1 text-2xl font-black text-[#2f3e46] font-mono">
                        {stats?.avg_click_rate || 0}%
                    </p>
                    <span className="text-[10px] text-[#6e84a3] font-medium mt-1 block">Click engagement</span>
                </Card>

                <Card className="p-4">
                    <span className="text-[10px] font-bold text-[#6e84a3] uppercase tracking-wider">Subscribers</span>
                    <p className="mt-1 text-2xl font-black text-[#1f2d3d] font-mono">
                        {(stats?.total_subscribers || 0).toLocaleString()}
                    </p>
                    <span className="text-[10px] text-[#6e84a3] font-medium mt-1 block">
                        In {stats?.total_lists || 0} active lists
                    </span>
                </Card>
            </div>

            {/* Monthly Trend Visual Charts */}
            <NewsletterPerformanceCharts monthlyData={monthlyTrend} />

            {/* Navigation Tabs & Search Controls */}
            <Card className="p-0 overflow-hidden border border-[#eaedf3]">
                <div className="flex flex-col sm:flex-row items-center justify-between border-b border-[#eaedf3] bg-[#fafbfc] px-5 py-3 gap-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                            onClick={() => setActiveTab("campaigns")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                activeTab === "campaigns"
                                    ? "bg-[#354f52] text-white shadow-xs"
                                    : "text-[#6e84a3] hover:text-[#1f2d3d] hover:bg-[#f1f4f8]"
                            }`}
                        >
                            <Mail className="h-3.5 w-3.5" />
                            <span>Newsletter Editions ({campaigns.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveTab("monthly")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                activeTab === "monthly"
                                    ? "bg-[#354f52] text-white shadow-xs"
                                    : "text-[#6e84a3] hover:text-[#1f2d3d] hover:bg-[#f1f4f8]"
                            }`}
                        >
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Monthly Consolidated ({monthlyTrend.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveTab("clicks")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                activeTab === "clicks"
                                    ? "bg-[#354f52] text-white shadow-xs"
                                    : "text-[#6e84a3] hover:text-[#1f2d3d] hover:bg-[#f1f4f8]"
                            }`}
                        >
                            <MousePointerClick className="h-3.5 w-3.5" />
                            <span>Link Clicks & Recipients ({clicks.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveTab("lists")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                activeTab === "lists"
                                    ? "bg-[#354f52] text-white shadow-xs"
                                    : "text-[#6e84a3] hover:text-[#1f2d3d] hover:bg-[#f1f4f8]"
                            }`}
                        >
                            <Users className="h-3.5 w-3.5" />
                            <span>Subscriber Lists ({lists.length})</span>
                        </button>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#95aac9]" />
                        <input
                            type="text"
                            placeholder="Search campaigns, emails, links..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-[#eaedf3] bg-white pl-8 pr-3 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52]"
                        />
                    </div>
                </div>

                {/* Tab 1: Campaigns Table */}
                {activeTab === "campaigns" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-[#eaedf3] bg-[#f8fafc] text-[#6e84a3] font-bold uppercase text-[10px]">
                                    <th className="py-3 px-4 font-semibold">Newsletter Name & Subject</th>
                                    <th className="py-3 px-4 font-semibold">Sent Date</th>
                                    <th className="py-3 px-4 font-semibold text-right">Sent</th>
                                    <th className="py-3 px-4 font-semibold text-right">Delivered</th>
                                    <th className="py-3 px-4 font-semibold text-right">Opens (Rate)</th>
                                    <th className="py-3 px-4 font-semibold text-right">Clicks</th>
                                    <th className="py-3 px-4 font-semibold text-right">Bounces</th>
                                    <th className="py-3 px-4 font-semibold text-center">Preview</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#eaedf3]">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-xs text-[#6e84a3]">
                                            Loading newsletters from database...
                                        </td>
                                    </tr>
                                ) : filteredCampaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-xs text-[#6e84a3]">
                                            No newsletter campaigns found matching &quot;{searchQuery}&quot;
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCampaigns.map((c) => {
                                        const openPct = parseFloat(c.open_percent || "0");
                                        const clickPct = parseFloat(c.unique_clicked_percent || "0");

                                        return (
                                            <tr key={c.campaign_key} className="hover:bg-[#f8fafc] transition-colors">
                                                <td className="py-3.5 px-4 pr-3 max-w-[280px]">
                                                    <div className="font-extrabold text-[#1f2d3d] truncate" title={c.campaign_name}>
                                                        {c.campaign_name}
                                                    </div>
                                                    <div className="text-[11px] text-[#6e84a3] truncate mt-0.5" title={c.subject}>
                                                        {c.subject || "No subject"}
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4 font-mono text-[11px] text-[#6e84a3]">
                                                    {c.sent_time ? new Date(c.sent_time).toLocaleDateString() : "—"}
                                                </td>

                                                <td className="py-3.5 px-4 text-right font-mono font-bold text-[#1f2d3d]">
                                                    {c.emails_sent_count.toLocaleString()}
                                                </td>

                                                <td className="py-3.5 px-4 text-right font-mono text-[#354f52]">
                                                    {c.delivered_count.toLocaleString()}{" "}
                                                    <span className="text-[10px] text-[#6e84a3]">({c.delivered_percent}%)</span>
                                                </td>

                                                <td className="py-3.5 px-4 text-right font-mono">
                                                    <span className="font-bold text-[#1f2d3d]">{c.opens_count.toLocaleString()}</span>{" "}
                                                    <span
                                                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                            openPct >= 20
                                                                ? "bg-emerald-50 text-emerald-700"
                                                                : openPct >= 10
                                                                ? "bg-amber-50 text-amber-700"
                                                                : "bg-slate-100 text-slate-600"
                                                        }`}
                                                    >
                                                        {openPct}%
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#354f52]">
                                                    {clickPct}%
                                                </td>

                                                <td className="py-3.5 px-4 text-right font-mono text-[#e63946]">
                                                    {c.bounces_count.toLocaleString()}{" "}
                                                    <span className="text-[10px] text-[#6e84a3]">({c.bounce_percent}%)</span>
                                                </td>

                                                <td className="py-3.5 px-4 text-center">
                                                    {c.campaign_preview ? (
                                                        <a
                                                            href={`https://${c.campaign_preview}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 rounded bg-[#354f52]/10 px-2 py-1 text-[11px] font-bold text-[#354f52] hover:bg-[#354f52]/20 transition-colors"
                                                        >
                                                            <span>View HTML</span>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-[#95aac9]">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tab 2: Monthly Consolidated Summary Table */}
                {activeTab === "monthly" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-[#eaedf3] bg-[#f8fafc] text-[#6e84a3] font-bold uppercase text-[10px]">
                                    <th className="py-3 px-4 font-semibold">Month</th>
                                    <th className="py-3 px-4 font-semibold text-center">Editions</th>
                                    <th className="py-3 px-4 font-semibold text-right">Total Sent</th>
                                    <th className="py-3 px-4 font-semibold text-right">Total Delivered</th>
                                    <th className="py-3 px-4 font-semibold text-right">Delivery %</th>
                                    <th className="py-3 px-4 font-semibold text-right">Total Opens</th>
                                    <th className="py-3 px-4 font-semibold text-right">Avg Open %</th>
                                    <th className="py-3 px-4 font-semibold text-right">Avg Click %</th>
                                    <th className="py-3 px-4 font-semibold text-right">Bounces</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#eaedf3]">
                                {monthlyTrend.map((m) => (
                                    <tr key={m.month} className="hover:bg-[#f8fafc] transition-colors">
                                        <td className="py-3.5 px-4 font-bold text-[#1f2d3d]">
                                            {m.month}
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-mono">
                                            <span className="inline-flex items-center justify-center rounded-full bg-[#354f52]/10 px-2 py-0.5 text-xs font-bold text-[#354f52]">
                                                {m.campaign_count}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#1f2d3d]">
                                            {parseInt(m.total_sent, 10).toLocaleString()}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-mono text-[#52796f]">
                                            {parseInt(m.total_delivered, 10).toLocaleString()}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-700">
                                            {m.avg_delivery_rate}%
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#354f52]">
                                            {parseInt(m.total_opens, 10).toLocaleString()}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-800">
                                            {m.avg_open_rate}%
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-mono text-[#2f3e46]">
                                            {m.avg_click_rate}%
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-mono text-[#e63946]">
                                            {parseInt(m.total_bounces, 10).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tab 3: Clicks & Recipient Details */}
                {activeTab === "clicks" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-[#eaedf3] bg-[#f8fafc] text-[#6e84a3] font-bold uppercase text-[10px]">
                                    <th className="py-3 px-4 font-semibold">Recipient (Email & Name)</th>
                                    <th className="py-3 px-4 font-semibold">Newsletter Campaign</th>
                                    <th className="py-3 px-4 font-semibold">Clicked URL Destination</th>
                                    <th className="py-3 px-4 font-semibold text-center">Click Count</th>
                                    <th className="py-3 px-4 font-semibold">Recorded Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#eaedf3]">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-xs text-[#6e84a3]">
                                            Loading click reports...
                                        </td>
                                    </tr>
                                ) : filteredClicks.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-xs text-[#6e84a3]">
                                            {clicks.length === 0
                                                ? "No individual URL clicks recorded yet. Clicks are tracked as contacts interact with newsletter links."
                                                : `No clicks matching "${searchQuery}"`}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClicks.map((cl) => (
                                        <tr key={cl.id} className="hover:bg-[#f8fafc] transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="font-extrabold text-[#1f2d3d] font-mono">
                                                    {cl.contact_email}
                                                </div>
                                                {cl.contact_name && (
                                                    <div className="text-[11px] text-[#6e84a3]">
                                                        {cl.contact_name}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 font-semibold text-[#354f52]">
                                                {cl.campaign_name}
                                            </td>

                                            <td className="py-3.5 px-4 max-w-[320px]">
                                                <a
                                                    href={cl.clicked_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-[#354f52] font-mono text-[11px] hover:underline truncate max-w-full"
                                                    title={cl.clicked_url}
                                                >
                                                    <Link2 className="h-3 w-3 shrink-0 text-[#95aac9]" />
                                                    <span className="truncate">{cl.clicked_url}</span>
                                                </a>
                                            </td>

                                            <td className="py-3.5 px-4 text-center font-mono font-bold text-[#1f2d3d]">
                                                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px]">
                                                    {cl.click_count}x
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 font-mono text-[#6e84a3]">
                                                {cl.clicked_at ? new Date(cl.clicked_at).toLocaleDateString() : "—"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tab 4: Subscriber Mailing Lists */}
                {activeTab === "lists" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-[#eaedf3] bg-[#f8fafc] text-[#6e84a3] font-bold uppercase text-[10px]">
                                    <th className="py-3 px-4 font-semibold">Mailing List Name</th>
                                    <th className="py-3 px-4 font-semibold text-right">Subscribers</th>
                                    <th className="py-3 px-4 font-semibold text-right">Unsubscribes</th>
                                    <th className="py-3 px-4 font-semibold text-right">Bounced Emails</th>
                                    <th className="py-3 px-4 font-semibold">Created Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#eaedf3]">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-xs text-[#6e84a3]">
                                            Loading lists from database...
                                        </td>
                                    </tr>
                                ) : filteredLists.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-xs text-[#6e84a3]">
                                            No mailing lists found matching &quot;{searchQuery}&quot;
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLists.map((l) => (
                                        <tr key={l.list_key} className="hover:bg-[#f8fafc] transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-[#1f2d3d]">
                                                {l.list_name}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-mono font-extrabold text-[#354f52]">
                                                {l.contacts_count.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-mono text-[#6e84a3]">
                                                {l.unsub_count.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-mono text-[#e63946]">
                                                {l.bounce_count.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-[#6e84a3]">
                                                {l.created_time ? new Date(l.created_time).toLocaleDateString() : "—"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
