"use client";

import { useState } from "react";
import { MelodyHeroKPI } from "@/components/dashboard/MelodyHeroKPI";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { MelodyOrdersBarChart } from "@/components/dashboard/MelodyOrdersBarChart";
import { MelodySalesWaveChart } from "@/components/dashboard/MelodySalesWaveChart";
import { MelodyBottomWidgets } from "@/components/dashboard/MelodyBottomWidgets";

export default function DashboardPage() {
  const [filterState, setFilterState] = useState({
    dateRange: "Last 7 days",
    channel: "All Channels",
    campaign: "All Campaigns",
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1f2d3d]">
            Dashboard
          </h1>
          <p className="text-xs text-[#6e84a3] mt-0.5">
            Operational overview of Madiff outbound funnels, lead generation, and conversions
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6e84a3]">
          <span>Madiff System</span>
          <span>/</span>
          <span className="font-semibold text-[#1f2d3d]">Executive Overview</span>
        </div>
      </div>

      {/* Interactive Filters Bar */}
      <DashboardFilters
        onFilterChange={(newFilters) => setFilterState(newFilters)}
      />

      {/* Melody Dark Hero KPI Banner (6 Metrics with % changes) */}
      <MelodyHeroKPI />

      {/* Middle Row: Orders (Bar Chart) & Sales (Smooth Wave Line Chart) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MelodyOrdersBarChart />
        <MelodySalesWaveChart />
      </div>

      {/* Bottom Row: 3 Melody Cards (Status Pie, Activity Feed, Daily Ring) */}
      <MelodyBottomWidgets />
    </div>
  );
}