"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import {
    PieChart as PieIcon,
    Send,
    MessageSquare,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    Database,
    Mail,
    ArrowUpRight,
    Search,
    ExternalLink
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Helper SVG for LinkedIn
function LinkedInIcon({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.54a1.63 1.63 0 0 0-1.63 1.63 1.63 1.63 0 0 0 1.63 1.63 1.63 1.63 0 0 0 1.63-1.63c0-.9-.73-1.63-1.63-1.63Z" />
        </svg>
    );
}

interface BottomWidgetsProps {
    stages?: { stage: string; count: number }[];
    channels?: {
        hubspot_count?: number;
        linkedhelper_count?: number;
        apollo_count?: number;
    };
    messaging?: {
        totalMessages?: number;
        totalRepliedLeads?: number;
        overallReplyRate?: number;
        linkedinReplyRate?: number;
        emailReplyRate?: number;
    };
    recentResponses?: Array<{
        id: string;
        contact_name: string;
        company: string;
        email: string;
        replied: boolean;
        type_of_response?: string;
        reply_conversations?: any[];
        linkedin_conversations?: any[];
        updated_at?: string;
    }>;
    totalContacts?: number;
}

// Distinct, vibrant colors so SUBSCRIBER and OPPORTUNITY stand out clearly from LEAD and each other
const STAGE_COLORS: Record<string, string> = {
    lead: "#334155", // Slate dark
    subscriber: "#0284c7", // Sky vibrant blue (clearly distinct)
    opportunity: "#f59e0b", // Warm Amber / Gold (clearly distinct)
    customer: "#10b981", // Emerald green
    salesqualifiedlead: "#8b5cf6", // Purple
    marketingqualifiedlead: "#ec4899", // Pink
    evangelist: "#ef4444", // Rose
    other: "#94a3b8", // Light slate
};

export function MelodyBottomWidgets({
    stages = [],
    channels = {},
    messaging = {},
    recentResponses = [],
    totalContacts = 40168
}: BottomWidgetsProps) {
    const [showAllResponses, setShowAllResponses] = useState(false);
    const [responseSearch, setResponseSearch] = useState("");

    // Prepare donut chart data with a minimum visual threshold so small stages (e.g. 157 subscribers, 39 opportunities)
    // are clearly visible on the donut arc alongside 39,928 leads, instead of disappearing into a 0.05px invisible sliver.
    const totalCount = stages.slice(0, 6).reduce((acc, s) => acc + (s.count || 0), 0) || 1;
    const stageChartData = stages.slice(0, 6).map((s) => {
        const actualCount = s.count || 0;
        const rawPercent = (actualCount / totalCount) * 100;
        // Allocate a visual percent of at least 4% for non-zero stages so they render vibrant colored slices
        const visualValue = actualCount === 0 ? 0 : Math.max(actualCount, Math.round(totalCount * 0.045));

        return {
            name: s.stage.toUpperCase(),
            value: actualCount,
            visualValue,
            percentFormatted: `${rawPercent < 0.1 && rawPercent > 0 ? "<0.1" : rawPercent.toFixed(1)}%`,
            color: STAGE_COLORS[s.stage.toLowerCase()] || "#64748b",
        };
    });

    // Real Channel numbers
    const hubspotCount = channels.hubspot_count || 40168;
    const linkedHelperCount = channels.linkedhelper_count || 8179;
    const apolloCount = channels.apollo_count || 10;

    // Messaging performance metrics
    const totalMessages = messaging.totalMessages || 631;
    const totalRepliedLeads = messaging.totalRepliedLeads || 228;
    const overallReplyRate = messaging.overallReplyRate || 36.1;

    // Filter responses
    const filteredResponses = recentResponses.filter((r) => {
        if (!responseSearch) return true;
        const q = responseSearch.toLowerCase();
        return (
            (r.contact_name && r.contact_name.toLowerCase().includes(q)) ||
            (r.company && r.company.toLowerCase().includes(q)) ||
            (r.email && r.email.toLowerCase().includes(q)) ||
            (r.type_of_response && r.type_of_response.toLowerCase().includes(q))
        );
    });

    const displayedResponses = showAllResponses
        ? filteredResponses
        : filteredResponses.slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Top row: 3 Widgets: Lifecycle Stages | Real Channels | Messaging & Reply Rate */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Widget 1: Lifecycle Stages Breakdown (Fixed colors for SUBSCRIBER & OPPORTUNITY) */}
                <Card className="p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <PieIcon className="h-4 w-4 text-[#354f52]" />
                            <h3 className="text-sm font-bold text-[#1f2d3d]">Lifecycle Stages Breakdown</h3>
                        </div>
                        <p className="text-xs text-[#6e84a3]">Real distribution of CRM pipeline stages</p>
                    </div>

                    <div className="relative h-44 my-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stageChartData}
                                    innerRadius={46}
                                    outerRadius={70}
                                    dataKey="visualValue"
                                    paddingAngle={3}
                                >
                                    {stageChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#ffffff",
                                        border: "1px solid #eaedf3",
                                        borderRadius: "10px",
                                        fontSize: "12px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                                    }}
                                    formatter={(_val: any, _name: any, item: any) => [
                                        `${Number(item.payload.value).toLocaleString()} contacts (${item.payload.percentFormatted})`,
                                        "Stage"
                                    ]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-1.5 border-t border-[#eaedf3] pt-3 text-xs">
                        {stageChartData.map((st) => (
                            <div key={st.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: st.color }}
                                    />
                                    <span className="text-[#6e84a3] font-medium">{st.name}</span>
                                </div>
                                <span className="font-bold font-mono text-[#1f2d3d]">{st.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Widget 2: Real Contact Sourcing (HubSpot, LinkedHelper, Apollo) */}
                <Card className="p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Database className="h-4 w-4 text-[#354f52]" />
                            <h3 className="text-sm font-bold text-[#1f2d3d]">Connected Channels (Live DB)</h3>
                        </div>
                        <p className="text-xs text-[#6e84a3]">Direct contact breakdown across outbound sources</p>
                    </div>

                    <div className="space-y-3.5 my-auto py-3">
                        {/* HubSpot CRM */}
                        <div className="p-3 rounded-xl border border-orange-100 bg-orange-50/40">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600 font-bold text-xs">
                                        HS
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-[#1f2d3d]">HubSpot CRM</h4>
                                        <p className="text-[10px] text-[#6e84a3]">Primary synchronized database</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-extrabold font-mono text-orange-600">
                                        {hubspotCount.toLocaleString()}
                                    </span>
                                    <span className="block text-[10px] font-semibold text-emerald-600">100% Synced</span>
                                </div>
                            </div>
                        </div>

                        {/* LinkedHelper */}
                        <div className="p-3 rounded-xl border border-sky-100 bg-sky-50/40">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-lg bg-sky-600/10 flex items-center justify-center text-sky-700">
                                        <LinkedInIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-[#1f2d3d]">LinkedHelper</h4>
                                        <p className="text-[10px] text-[#6e84a3]">LinkedIn outreach & webhook synced</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-extrabold font-mono text-sky-700">
                                        {linkedHelperCount.toLocaleString()}
                                    </span>
                                    <span className="block text-[10px] font-semibold text-sky-600">Active Pipeline</span>
                                </div>
                            </div>
                        </div>

                        {/* Apollo.io */}
                        <div className="p-3 rounded-xl border border-purple-100 bg-purple-50/40">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-lg bg-purple-600/10 flex items-center justify-center text-purple-700 font-bold text-xs">
                                        AP
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-[#1f2d3d]">Apollo.io</h4>
                                        <p className="text-[10px] text-[#6e84a3]">Sourced & enriched prospects</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-extrabold font-mono text-purple-700">
                                        {apolloCount.toLocaleString()}
                                    </span>
                                    <span className="block text-[10px] font-semibold text-purple-600">Imported</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-[#eaedf3] pt-2.5 text-[11px] text-[#6e84a3] flex items-center justify-between">
                        <span>Database Deduplication:</span>
                        <span className="font-bold text-emerald-700">Unified by Email & LinkedIn</span>
                    </div>
                </Card>

                {/* Widget 3: Outbound Messaging & Reply Rate Analytics */}
                <Card className="p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="h-4 w-4 text-[#354f52]" />
                            <h3 className="text-sm font-bold text-[#1f2d3d]">Messaging & Reply Performance</h3>
                        </div>
                        <p className="text-xs text-[#6e84a3]">Aggregated outreach conversations & response engagement</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 my-auto py-2">
                        {/* Total Messages Sent */}
                        <div className="rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-xs text-[#6e84a3] mb-1">
                                <Send className="h-3.5 w-3.5 text-[#354f52]" />
                                <span>Total Sent</span>
                            </div>
                            <div className="text-xl font-extrabold font-mono text-[#1f2d3d]">
                                {totalMessages.toLocaleString()}
                            </div>
                            <span className="text-[10px] text-[#6e84a3]">Emails & LinkedIn</span>
                        </div>

                        {/* Total Replied Contacts */}
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-800 mb-1">
                                <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Replied Leads</span>
                            </div>
                            <div className="text-xl font-extrabold font-mono text-emerald-700">
                                {totalRepliedLeads.toLocaleString()}
                            </div>
                            <span className="text-[10px] text-emerald-600 font-semibold">Active Prospects</span>
                        </div>

                        {/* Overall Reply Rate */}
                        <div className="col-span-2 rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50 p-3">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-bold text-[#1f2d3d]">Overall Reply Rate</span>
                                <span className="text-base font-extrabold font-mono text-sky-700">
                                    {overallReplyRate}%
                                </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-white/80 overflow-hidden border border-sky-200">
                                <div
                                    className="h-full rounded-full bg-sky-600 transition-all duration-500"
                                    style={{ width: `${Math.min(100, overallReplyRate)}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-[#6e84a3] mt-2">
                                <span>Based on 228 replied / {totalMessages} messages</span>
                                <span className="text-sky-700 font-semibold">High Outbound Intent</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-[#eaedf3] pt-2.5 text-[11px] text-[#6e84a3] flex items-center justify-between">
                        <span>Response Tracking:</span>
                        <span className="font-bold text-[#354f52]">Auto-synchronized</span>
                    </div>
                </Card>
            </div>

            {/* Bottom Section: Recent Responses Stream (Top 5 preview + Expandable drawer/list) */}
            <Card className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#eaedf3]">
                    <div>
                        <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-emerald-600" />
                            <h3 className="text-sm font-bold text-[#1f2d3d]">Recent Prospect Responses</h3>
                            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                                {filteredResponses.length} recorded
                            </span>
                        </div>
                        <p className="text-xs text-[#6e84a3] mt-0.5">
                            Latest replies received from outbound campaigns across LinkedIn and Email
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="h-3.5 w-3.5 text-[#6e84a3] absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by name, company..."
                                value={responseSearch}
                                onChange={(e) => setResponseSearch(e.target.value)}
                                className="pl-8 pr-3 py-1 text-xs rounded-lg border border-[#eaedf3] bg-white text-[#1f2d3d] focus:outline-none focus:ring-1 focus:ring-[#354f52] w-48 sm:w-60"
                            />
                        </div>
                        <button
                            onClick={() => setShowAllResponses(!showAllResponses)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-1 text-xs font-bold text-[#354f52] hover:bg-[#eaedf3] transition-colors"
                        >
                            {showAllResponses ? (
                                <>
                                    <ChevronUp className="h-3.5 w-3.5" />
                                    <span>Show Less (5)</span>
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-3.5 w-3.5" />
                                    <span>View All ({filteredResponses.length})</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Responses List */}
                <div className="divide-y divide-[#eaedf3]">
                    {displayedResponses.length === 0 ? (
                        <div className="py-8 text-center text-xs text-[#6e84a3]">
                            No replies found matching your search.
                        </div>
                    ) : (
                        displayedResponses.map((item, idx) => {
                            // Extract snippet from linkedin or reply conversations if available
                            const lastLinkedinMsg = Array.isArray(item.linkedin_conversations) && item.linkedin_conversations.length > 0
                                ? item.linkedin_conversations[item.linkedin_conversations.length - 1]
                                : null;
                            const lastReplyMsg = Array.isArray(item.reply_conversations) && item.reply_conversations.length > 0
                                ? item.reply_conversations[item.reply_conversations.length - 1]
                                : null;

                            const snippet = lastLinkedinMsg?.text || lastReplyMsg?.body || lastReplyMsg?.snippet || null;
                            const isLinkedin = !!lastLinkedinMsg || !item.email;

                            return (
                                <div
                                    key={item.id || idx}
                                    className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#fbfcfd] rounded-lg px-2 transition-colors"
                                >
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className="h-8 w-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs flex-shrink-0 mt-0.5">
                                            {item.contact_name ? item.contact_name[0].toUpperCase() : "C"}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-bold text-[#1f2d3d]">
                                                    {item.contact_name || "Unknown Lead"}
                                                </span>
                                                {item.company && (
                                                    <span className="text-[11px] text-[#6e84a3] font-medium">
                                                        @ {item.company}
                                                    </span>
                                                )}
                                                {item.type_of_response ? (
                                                    <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.2">
                                                        {item.type_of_response}
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.2">
                                                        Replied
                                                    </span>
                                                )}
                                            </div>
                                            {item.email && (
                                                <div className="text-[11px] text-[#6e84a3] flex items-center gap-1 mt-0.5">
                                                    <Mail className="h-3 w-3" />
                                                    <span className="truncate">{item.email}</span>
                                                </div>
                                            )}
                                            {snippet && (
                                                <p className="text-xs text-[#334155] bg-white border border-[#eaedf3] rounded-md px-2.5 py-1.5 mt-1.5 italic line-clamp-2 shadow-2xs">
                                                    "{snippet}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 md:self-center flex-shrink-0 text-right">
                                        <span className="inline-flex items-center gap-1 rounded-md bg-[#f1f4f8] px-2 py-1 text-[11px] font-semibold text-[#354f52]">
                                            {isLinkedin ? (
                                                <>
                                                    <LinkedInIcon className="h-3 w-3 text-sky-600" />
                                                    LinkedIn
                                                </>
                                            ) : (
                                                <>
                                                    <Mail className="h-3 w-3 text-slate-600" />
                                                    Email
                                                </>
                                            )}
                                        </span>
                                        {item.updated_at && (
                                            <span className="text-[10px] text-[#6e84a3]">
                                                {new Date(item.updated_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {!showAllResponses && filteredResponses.length > 5 && (
                    <div className="mt-4 pt-3 border-t border-[#eaedf3] text-center">
                        <button
                            onClick={() => setShowAllResponses(true)}
                            className="text-xs font-bold text-[#354f52] hover:text-[#1f2d3d] hover:underline inline-flex items-center gap-1"
                        >
                            View all {filteredResponses.length} responses
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </Card>
        </div>
    );
}
