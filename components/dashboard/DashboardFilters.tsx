"use client";

import { useState } from "react";
import { Filter, Calendar, Layers, ChevronDown, Check } from "lucide-react";

interface FilterProps {
    onFilterChange: (filters: { dateRange: string; channel: string; campaign: string }) => void;
}

export function DashboardFilters({ onFilterChange }: FilterProps) {
    const [dateRange, setDateRange] = useState("Last 7 days");
    const [channel, setChannel] = useState("All Channels");
    const [campaign, setCampaign] = useState("All Campaigns");

    const updateFilter = (newDate: string, newChannel: string, newCamp: string) => {
        setDateRange(newDate);
        setChannel(newChannel);
        setCampaign(newCamp);
        onFilterChange({ dateRange: newDate, channel: newChannel, campaign: newCamp });
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#eaedf3] shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1f2d3d]">
                <Filter className="h-4 w-4 text-[#354f52]" />
                <span>Filters & View:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
                {/* Date Picker select */}
                <div className="flex items-center gap-1.5 rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold text-[#475569]">
                    <Calendar className="h-3.5 w-3.5 text-[#6e84a3]" />
                    <select
                        value={dateRange}
                        onChange={(e) => updateFilter(e.target.value, channel, campaign)}
                        className="bg-transparent outline-none cursor-pointer"
                    >
                        <option value="Today">Today</option>
                        <option value="Last 7 days">Last 7 days</option>
                        <option value="This Month">This Month</option>
                        <option value="Last 30 days">Last 30 days</option>
                        <option value="Q3 2026">Q3 2026</option>
                    </select>
                </div>

                {/* Channel select */}
                <div className="flex items-center gap-1.5 rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold text-[#475569]">
                    <Layers className="h-3.5 w-3.5 text-[#6e84a3]" />
                    <select
                        value={channel}
                        onChange={(e) => updateFilter(dateRange, e.target.value, campaign)}
                        className="bg-transparent outline-none cursor-pointer"
                    >
                        <option value="All Channels">All Channels (6)</option>
                        <option value="Apollo.io">Apollo.io (Sourcing)</option>
                        <option value="Reply.io">Reply.io (Cold Email)</option>
                        <option value="LinkedHelper">LinkedHelper (LinkedIn)</option>
                        <option value="HubSpot">HubSpot CRM</option>
                        <option value="Zoho Campaigns">Zoho Campaigns (Newsletter)</option>
                        <option value="Madiff LinkedIn">Madiff LinkedIn Page</option>
                    </select>
                </div>

                {/* Campaign select */}
                <div className="flex items-center gap-1.5 rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold text-[#475569]">
                    <select
                        value={campaign}
                        onChange={(e) => updateFilter(dateRange, channel, e.target.value)}
                        className="bg-transparent outline-none cursor-pointer"
                    >
                        <option value="All Campaigns">All Active Campaigns</option>
                        <option value="EU FinTech CTOs">EU FinTech CTOs</option>
                        <option value="US AI Founders">US AI Founders</option>
                        <option value="Tech Talent Digest">Tech Talent Digest</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
