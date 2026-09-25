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

export function ZohoNewsletterView() {
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
                if (data.campaigns && data.campaigns.length > 0) {
                    setLastSyncedAt(data.campaigns[0].synced_at);
                }
            } else {
                setNotification(`Error: ${data.error || "Failed to load newsletter data"}`);
            }
        } catch (e: any) {
            setNotification(`Network error: ${e.message}`);
        } finally {
            setIsLoading(false);
            if (isManualUpdate) {
                setTimeout(() => setNotification(null), 3000);
            }
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        setNotification("Fetching latest newsletter campaigns & reports directly from Zoho Campaigns API...");
        try {
            const res = await fetch("/api/zoho/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ force: true })
            });
            const data = await res.json();
            if (res.ok) {
                setNotification(`Sync completed: ${data.campaignsSynced || 0} campaigns updated.`);
                await loadData();
            } else {
                setNotification(`Sync failed: ${data.error || "Unknown error"}`);
            }
        } catch (e: any) {
            setNotification(`Sync error: ${e.message}`);
        } finally {
            setIsSyncing(false);
            setTimeout(() => setNotification(null), 5000);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const formatPercent = (val: any) => {
        if (val === null || val === undefined || val === "" || val === "—") return "—";
        const cleanVal = String(val).replace(/%/g, "").trim();
        if (cleanVal === "" || cleanVal === "—") return "—";
        return `${cleanVal}\u00A0%`;
    };

    const filteredCampaigns = campaigns.filter(c =>
        c.campaign_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-[#eaedf3]">
                <div>
                    <h2 className="text-lg font-bold text-[#1f2d3d] flex items-center gap-2">
                        <Mail className="h-5 w-5 text-[#354f52]" />
                        Zoho Campaigns Newsletter Hub
                    </h2>
                    <p className="text-xs text-[#6e84a3] mt-0.5">
                        Performance analytics, deliverability metrics, and click tracking from Zoho Campaigns
                        {lastSyncedAt && ` · Synced ${new Date(lastSyncedAt).toLocaleString()}`}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => loadData(true)}
                        disabled={isLoading || isSyncing}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs font-semibold text-[#1f2d3d] hover:bg-[#f8fafc] disabled:opacity-50 transition-colors"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                    <button
                        onClick={handleSync}
                        disabled={isSyncing || isLoading}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#354f52] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#2f3e46] disabled:opacity-50 transition-colors shadow-xs"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                        {isSyncing ? "Syncing..." : "Sync from Zoho"}
                    </button>
                </div>
            </div>

            {notification && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-800 flex items-center justify-between animate-fade-in">
                    <span>{notification}</span>
                    <button onClick={() => setNotification(null)} className="text-blue-500 hover:text-blue-700 font-bold ml-2">×</button>
                </div>
            )}

            {/* Newsletter Dark Hero KPI Banner (Matching MelodyHeroKPI format & colors) */}
            <div className="hero-kpi-banner overflow-hidden p-6 text-white rounded-2xl shadow-lg">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
                    {/* 1. Sent */}
                    <div className="px-3 py-2 sm:py-0 first:pl-0">
                        <div className="flex items-center gap-1.5 text-xs text-[#e2e8f0] font-semibold">
                            <Mail className="h-4 w-4 text-[#84a98c]" />
                            <span>Total Sent</span>
                        </div>
                        <div className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow-sm">
                            {parseInt(stats?.total_sent || "0").toLocaleString()}
                        </div>
                        <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/25 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200">
                            {stats?.total_campaigns || 0} Campaigns
                        </div>
                    </div>

                    {/* 2. Delivered */}
                    <div className="px-3 py-2 sm:py-0">
                        <div className="flex items-center gap-1.5 text-xs text-[#e2e8f0] font-semibold">
                            <CheckCircle2 className="h-4 w-4 text-[#84a98c]" />
                            <span>Delivered Rate</span>
                        </div>
                        <div className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow-sm">
                            {formatPercent(stats?.avg_delivery_rate || "0.0")}
                        </div>
                        <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/25 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200">
                            {parseInt(stats?.total_delivered || "0").toLocaleString()} delivered
                        </div>
                    </div>

                    {/* 3. Open Rate */}
                    <div className="px-3 py-2 sm:py-0">
                        <div className="flex items-center gap-1.5 text-xs text-[#e2e8f0] font-semibold">
                            <BarChart3 className="h-4 w-4 text-[#84a98c]" />
                            <span>Avg Open Rate</span>
                        </div>
                        <div className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow-sm">
                            {formatPercent(stats?.avg_open_rate || "0.0")}
                        </div>
                        <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/25 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200">
                            {parseInt(stats?.total_opens || "0").toLocaleString()} opens
                        </div>
                    </div>

                    {/* 4. Click Rate */}
                    <div className="px-3 py-2 sm:py-0">
                        <div className="flex items-center gap-1.5 text-xs text-[#e2e8f0] font-semibold">
                            <MousePointerClick className="h-4 w-4 text-[#84a98c]" />
                            <span>Avg Click Rate</span>
                        </div>
                        <div className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow-sm">
                            {formatPercent(stats?.avg_click_rate || "0.0")}
                        </div>
                        <div className="mt-2 inline-flex items-center rounded-full bg-indigo-500/25 border border-indigo-400/50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-200">
                            {clicks.length} links clicked
                        </div>
                    </div>

                    {/* 5. Subscribers */}
                    <div className="px-3 py-2 sm:py-0">
                        <div className="flex items-center gap-1.5 text-xs text-[#e2e8f0] font-semibold">
                            <Users className="h-4 w-4 text-[#84a98c]" />
                            <span>Subscribers</span>
                        </div>
                        <div className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow-sm">
                            {(stats?.total_subscribers || 0).toLocaleString()}
                        </div>
                        <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/25 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200">
                            {stats?.total_lists || 0} Mailing Lists
                        </div>
                    </div>

                    {/* 6. Bounces & Unsubs */}
                    <div className="px-3 py-2 sm:py-0">
                        <div className="flex items-center gap-1.5 text-xs text-[#e2e8f0] font-semibold">
                            <RefreshCw className="h-4 w-4 text-[#84a98c]" />
                            <span>Bounces & Unsubs</span>
                        </div>
                        <div className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow-sm">
                            {parseInt(stats?.total_bounces || "0").toLocaleString()}
                        </div>
                        <div className="mt-2 inline-flex items-center rounded-full bg-rose-500/25 border border-rose-400/50 px-2.5 py-0.5 text-[10px] font-bold text-rose-200">
                            {parseInt(stats?.total_unsubs || "0")} unsubs
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Visualizations */}
            <NewsletterPerformanceCharts
                monthlyData={monthlyTrend}
            />

            {/* Tabs for detailed tables */}
            <div className="bg-white rounded-xl border border-[#eaedf3] overflow-hidden">
                <div className="border-b border-[#eaedf3] px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fafbfc]">
                    <div className="flex gap-2 py-2">
                        <button
                            onClick={() => setActiveTab("campaigns")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                activeTab === "campaigns"
                                    ? "bg-[#354f52] text-white"
                                    : "text-[#6e84a3] hover:text-[#1f2d3d]"
                            }`}
                        >
                            Campaigns ({campaigns.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("monthly")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                activeTab === "monthly"
                                    ? "bg-[#354f52] text-white"
                                    : "text-[#6e84a3] hover:text-[#1f2d3d]"
                            }`}
                        >
                            Monthly Aggregates ({monthlyTrend.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("clicks")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                activeTab === "clicks"
                                    ? "bg-[#354f52] text-white"
                                    : "text-[#6e84a3] hover:text-[#1f2d3d]"
                            }`}
                        >
                            Click Tracking ({clicks.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("lists")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                activeTab === "lists"
                                    ? "bg-[#354f52] text-white"
                                    : "text-[#6e84a3] hover:text-[#1f2d3d]"
                            }`}
                        >
                            Mailing Lists ({lists.length})
                        </button>
                    </div>

                    {activeTab === "campaigns" && (
                        <div className="relative py-2">
                            <Search className="h-3.5 w-3.5 text-[#6e84a3] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search campaign name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 py-1 text-xs rounded-lg border border-[#eaedf3] bg-white text-[#1f2d3d] focus:outline-none focus:ring-1 focus:ring-[#354f52] w-56"
                            />
                        </div>
                    )}
                </div>

                {/* Tab 1: Campaigns Table */}
                {activeTab === "campaigns" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[#1f2d3d]">
                            <thead className="bg-[#f8fafc] text-[11px] font-bold text-[#6e84a3] uppercase border-b border-[#eaedf3]">
                                <tr>
                                    <th className="px-4 py-3">Campaign Name & Subject</th>
                                    <th className="px-3 py-3">Sent Date</th>
                                    <th className="px-3 py-3 text-right">Sent</th>
                                    <th className="px-3 py-3 text-right">Delivered</th>
                                    <th className="px-3 py-3 text-right">Open Rate</th>
                                    <th className="px-3 py-3 text-right">Click Rate</th>
                                    <th className="px-3 py-3 text-right">Bounces</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#eaedf3]">
                                {filteredCampaigns.map((camp) => (
                                    <tr key={camp.campaign_key} className="hover:bg-[#fbfcfd] transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-[#1f2d3d]">{camp.campaign_name}</div>
                                            <div className="text-[11px] text-[#6e84a3] truncate max-w-md">{camp.subject}</div>
                                        </td>
                                        <td className="px-3 py-3 text-[#6e84a3] whitespace-nowrap">
                                            {camp.sent_time ? new Date(camp.sent_time).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="px-3 py-3 text-right font-mono font-medium">
                                            {(camp.emails_sent_count || 0).toLocaleString()}
                                        </td>
                                        <td className="px-3 py-3 text-right font-mono font-medium text-emerald-700">
                                            {formatPercent(camp.delivered_percent)}
                                        </td>
                                        <td className="px-3 py-3 text-right font-mono font-bold text-[#354f52]">
                                            {formatPercent(camp.open_percent)}
                                        </td>
                                        <td className="px-3 py-3 text-right font-mono font-bold text-indigo-700">
                                            {formatPercent(camp.unique_clicked_percent)}
                                        </td>
                                        <td className="px-3 py-3 text-right font-mono text-rose-600">
                                            {(camp.bounces_count || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tab 2: Monthly Aggregates */}
                {activeTab === "monthly" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[#1f2d3d]">
                            <thead className="bg-[#f8fafc] text-[11px] font-bold text-[#6e84a3] uppercase border-b border-[#eaedf3]">
                                <tr>
                                    <th className="px-4 py-3">Month</th>
                                    <th className="px-3 py-3 text-right">Campaigns</th>
                                    <th className="px-3 py-3 text-right">Total Sent</th>
                                    <th className="px-3 py-3 text-right">Total Delivered</th>
                                    <th className="px-3 py-3 text-right">Avg Open Rate</th>
                                    <th className="px-3 py-3 text-right">Avg Delivery Rate</th>
                                    <th className="px-3 py-3 text-right">Avg Click Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#eaedf3]">
                                {monthlyTrend.map((m) => (
                                    <tr key={m.month} className="hover:bg-[#fbfcfd] transition-colors">
                                        <td className="px-4 py-3 font-bold font-mono text-[#1f2d3d]">{m.month}</td>
                                        <td className="px-3 py-3 text-right font-mono font-medium">{m.campaign_count}</td>
                                        <td className="px-3 py-3 text-right font-mono">{parseInt(m.total_sent || "0").toLocaleString()}</td>
                                        <td className="px-3 py-3 text-right font-mono text-emerald-700">{parseInt(m.total_delivered || "0").toLocaleString()}</td>
                                        <td className="px-3 py-3 text-right font-mono font-bold text-[#354f52]">{formatPercent(m.avg_open_rate)}</td>
                                        <td className="px-3 py-3 text-right font-mono text-emerald-700">{formatPercent(m.avg_delivery_rate)}</td>
                                        <td className="px-3 py-3 text-right font-mono font-bold text-indigo-700">{formatPercent(m.avg_click_rate)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tab 3: Clicks */}
                {activeTab === "clicks" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[#1f2d3d]">
                            <thead className="bg-[#f8fafc] text-[11px] font-bold text-[#6e84a3] uppercase border-b border-[#eaedf3]">
                                <tr>
                                    <th className="px-4 py-3">Contact</th>
                                    <th className="px-3 py-3">Campaign</th>
                                    <th className="px-3 py-3">URL Clicked</th>
                                    <th className="px-3 py-3 text-right">Clicks</th>
                                    <th className="px-3 py-3">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#eaedf3]">
                                {clicks.map((c) => (
                                    <tr key={c.id} className="hover:bg-[#fbfcfd] transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-[#1f2d3d]">{c.contact_name || c.contact_email}</div>
                                            {c.contact_name && <div className="text-[11px] text-[#6e84a3]">{c.contact_email}</div>}
                                        </td>
                                        <td className="px-3 py-3 text-[#1f2d3d] font-medium">{c.campaign_name}</td>
                                        <td className="px-3 py-3">
                                            <a href={c.clicked_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline max-w-xs truncate block">
                                                {c.clicked_url}
                                            </a>
                                        </td>
                                        <td className="px-3 py-3 text-right font-mono font-bold text-indigo-700">{c.click_count}</td>
                                        <td className="px-3 py-3 text-[#6e84a3] whitespace-nowrap">{new Date(c.clicked_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tab 4: Lists */}
                {activeTab === "lists" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[#1f2d3d]">
                            <thead className="bg-[#f8fafc] text-[11px] font-bold text-[#6e84a3] uppercase border-b border-[#eaedf3]">
                                <tr>
                                    <th className="px-4 py-3">List Name</th>
                                    <th className="px-3 py-3 text-right">Contacts</th>
                                    <th className="px-3 py-3 text-right">Unsubscribes</th>
                                    <th className="px-3 py-3 text-right">Bounces</th>
                                    <th className="px-3 py-3">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#eaedf3]">
                                {lists.map((l) => (
                                    <tr key={l.list_key} className="hover:bg-[#fbfcfd] transition-colors">
                                        <td className="px-4 py-3 font-bold text-[#1f2d3d]">{l.list_name}</td>
                                        <td className="px-3 py-3 text-right font-mono font-bold text-[#354f52]">{(l.contacts_count || 0).toLocaleString()}</td>
                                        <td className="px-3 py-3 text-right font-mono text-amber-600">{(l.unsub_count || 0).toLocaleString()}</td>
                                        <td className="px-3 py-3 text-right font-mono text-rose-600">{(l.bounce_count || 0).toLocaleString()}</td>
                                        <td className="px-3 py-3 text-[#6e84a3]">{l.created_time ? new Date(l.created_time).toLocaleDateString() : "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
