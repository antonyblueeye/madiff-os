"use client";

import { useState, useEffect } from "react";
import { MelodyHeroKPI } from "@/components/dashboard/MelodyHeroKPI";
import { MelodyMonthlyCreationChart } from "@/components/dashboard/MelodyMonthlyCreationChart";
import { MelodyOwnerHistogram } from "@/components/dashboard/MelodyOwnerHistogram";
import { MelodyCampaignDistributionChart } from "@/components/dashboard/MelodyCampaignDistributionChart";
import { MelodyBottomWidgets } from "@/components/dashboard/MelodyBottomWidgets";
import { ZohoNewsletterView } from "@/components/newsletter/ZohoNewsletterView";
import { RefreshCw, LayoutDashboard, Mail, ChevronDown } from "lucide-react";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"crm" | "newsletter">("crm");

    const loadStats = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/dashboard/stats");
            const data = await res.json();
            if (res.ok) {
                setStats(data);
            }
        } catch (e) {
            console.error("Failed to load dashboard stats:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
        // Check if tab is specified in query parameters
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("tab") === "newsletter") {
                setActiveTab("newsletter");
            }
        }
    }, []);

    const kpi = stats?.kpi || {};

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header with Dashboard View Switcher (Tabs / Dropdown) */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#eaedf3] pb-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-extrabold tracking-tight text-[#1f2d3d] flex items-center gap-2">
                            <span>{activeTab === "crm" ? "Outbound & CRM Dashboard" : "Newsletter Analytics"}</span>
                        </h1>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            PostgreSQL Live
                        </span>
                    </div>
                    <p className="text-xs text-[#6e84a3] mt-1">
                        {activeTab === "crm"
                            ? "Real-time funnel metrics, sourcing coverage, and outbound conversation analytics"
                            : "Zoho Campaigns email performance, subscriber growth, and deliverability tracking"}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* View Switcher: Interactive Tabs */}
                    <div className="inline-flex items-center p-1 rounded-xl bg-[#f1f4f8] border border-[#eaedf3]">
                        <button
                            onClick={() => setActiveTab("crm")}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                activeTab === "crm"
                                    ? "bg-white text-[#1f2d3d] shadow-xs"
                                    : "text-[#6e84a3] hover:text-[#1f2d3d]"
                            }`}
                        >
                            <LayoutDashboard className="h-3.5 w-3.5" />
                            CRM & Outbound
                        </button>
                        <button
                            onClick={() => setActiveTab("newsletter")}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                activeTab === "newsletter"
                                    ? "bg-white text-[#1f2d3d] shadow-xs"
                                    : "text-[#6e84a3] hover:text-[#1f2d3d]"
                            }`}
                        >
                            <Mail className="h-3.5 w-3.5 text-[#354f52]" />
                            Newsletter Analytics
                            <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2 font-semibold">
                                Zoho
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* TAB 1: CRM & Outbound Dashboard */}
            {activeTab === "crm" && (
                <div className="space-y-6">
                    {/* Header info bar matching Newsletter Analytics */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-[#eaedf3]">
                        <div>
                            <h2 className="text-lg font-bold text-[#1f2d3d] flex items-center gap-2">
                                <LayoutDashboard className="h-5 w-5 text-[#354f52]" />
                                CRM Pipeline & Sourcing Hub
                            </h2>
                            <p className="text-xs text-[#6e84a3] mt-0.5">
                                Aggregated contact intelligence, channel sourcing, and live prospect interactions
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={loadStats}
                                disabled={isLoading}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#eaedf3] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1f2d3d] hover:bg-[#f8fafc] disabled:opacity-50 transition-colors shadow-2xs"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                                {isLoading ? "Refreshing..." : "Refresh"}
                            </button>
                        </div>
                    </div>

                    {/* Melody Dark Hero KPI Banner (Real Database Metrics) */}
                    <MelodyHeroKPI
                        totalContacts={kpi.totalContacts}
                        uniqueCompanies={kpi.uniqueCompanies}
                        withEmail={kpi.withEmail}
                        withLinkedin={kpi.withLinkedin}
                        withDomain={kpi.withDomain}
                        withReplied={kpi.withReplied}
                    />

                    {/* Middle Row 1: Monthly Creation Trend & Contacts by Owner Histogram */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <MelodyMonthlyCreationChart data={stats?.monthlyTrend || []} />
                        <MelodyOwnerHistogram data={stats?.contactsByOwner || []} />
                    </div>

                    {/* Middle Row 2: Campaign Distribution Chart */}
                    <MelodyCampaignDistributionChart data={stats?.contactsByCampaign || []} />

                    {/* Bottom Row: Lifecycle Stages (corrected donut), Live Channels (Apollo, HubSpot, LinkedHelper), Outbound Messaging & Responses preview */}
                    <MelodyBottomWidgets
                        stages={stats?.stages || []}
                        channels={stats?.channels || {}}
                        messaging={stats?.messaging || {}}
                        recentResponses={stats?.recentResponses || []}
                        totalContacts={kpi.totalContacts}
                    />
                </div>
            )}

            {/* TAB 2: Newsletter Analytics (Zoho Campaigns) */}
            {activeTab === "newsletter" && (
                <div className="space-y-6">
                    <ZohoNewsletterView />
                </div>
            )}
        </div>
    );
}