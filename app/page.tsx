"use client";

import { useState, useEffect } from "react";
import { MelodyHeroKPI } from "@/components/dashboard/MelodyHeroKPI";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { MelodyMonthlyCreationChart } from "@/components/dashboard/MelodyMonthlyCreationChart";
import { MelodyOwnerHistogram } from "@/components/dashboard/MelodyOwnerHistogram";
import { MelodyCampaignDistributionChart } from "@/components/dashboard/MelodyCampaignDistributionChart";
import { MelodyBottomWidgets } from "@/components/dashboard/MelodyBottomWidgets";
import { RefreshCw, Database } from "lucide-react";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

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
    }, []);

    const kpi = stats?.kpi || {};

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Page Title & Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-[#1f2d3d] flex items-center gap-2">
                        <span>Dashboard</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            PostgreSQL Live
                        </span>
                    </h1>
                    <p className="text-xs text-[#6e84a3] mt-0.5">
                        Real-time analytics and funnel metrics powered by your synchronized PostgreSQL database
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadStats}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs font-bold text-[#354f52] shadow-xs hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        {isLoading ? "Refreshing..." : "Refresh Stats"}
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

            {/* Bottom Row: Lifecycle Stages Breakdown & Live System Health */}
            <MelodyBottomWidgets
                stages={stats?.stages || []}
                channels={stats?.channels || {}}
                totalContacts={kpi.totalContacts}
            />
        </div>
    );
}