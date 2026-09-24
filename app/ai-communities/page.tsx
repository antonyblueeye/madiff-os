"use client";

import { useState, useMemo } from "react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import trackedCommunitiesData from "@/lib/ai-communities-master.json";
import postingHistoryData from "@/lib/ai-communities-data.json";
import detailsData from "@/lib/ai-communities-details.json";
import {
    Users2,
    ExternalLink,
    Search,
    Check,
    Copy,
    FileText,
    TrendingUp,
    BarChart3,
    Compass,
    Target,
    Filter,
    ArrowUpRight,
    Award,
    ShieldAlert,
    CheckCircle2,
    Calendar,
    Globe,
    Layers,
    MessageSquare
} from "lucide-react";

export default function AICommunitiesPage() {
    const [activeTab, setActiveTab] = useState<"directory" | "history" | "templates" | "team" | "verdict">("directory");
    const [search, setSearch] = useState("");
    const [platformFilter, setPlatformFilter] = useState<string>("All");
    const [ownerFilter, setOwnerFilter] = useState<string>("All");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Filter communities
    const filteredCommunities = useMemo(() => {
        return trackedCommunitiesData.filter((c) => {
            const matchesSearch =
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.shortName.toLowerCase().includes(search.toLowerCase()) ||
                c.rules.toLowerCase().includes(search.toLowerCase()) ||
                c.owner.toLowerCase().includes(search.toLowerCase());

            const matchesPlatform =
                platformFilter === "All" ||
                (platformFilter === "LinkedIn" && c.platform.includes("LinkedIn")) ||
                (platformFilter === "Slack" && c.platform.includes("Slack")) ||
                (platformFilter === "Discord" && c.platform.includes("Discord")) ||
                (platformFilter === "Facebook" && c.platform.includes("Facebook"));

            const matchesOwner =
                ownerFilter === "All" || c.owner.toLowerCase().includes(ownerFilter.toLowerCase());

            return matchesSearch && matchesPlatform && matchesOwner;
        });
    }, [search, platformFilter, ownerFilter]);

    // Platform badges color helper
    const getPlatformBadge = (platform: string) => {
        if (platform.includes("LinkedIn")) return "bg-[#0077b5]/10 text-[#0077b5] border-[#0077b5]/30";
        if (platform.includes("Discord")) return "bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/30";
        if (platform.includes("Slack")) return "bg-[#E01E5A]/10 text-[#E01E5A] border-[#E01E5A]/30";
        if (platform.includes("Facebook")) return "bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/30";
        return "bg-slate-100 text-[#475569] border-[#eaedf3]";
    };

    // Effectiveness badge helper
    const getEffectivenessBadge = (eff: string) => {
        if (eff.includes("Very High") || eff.includes("High")) {
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        }
        if (eff.includes("Medium")) {
            return "bg-amber-50 text-amber-700 border-amber-200";
        }
        if (eff.includes("Brand Visibility")) {
            return "bg-blue-50 text-blue-700 border-blue-200";
        }
        return "bg-slate-100 text-slate-600 border-slate-200";
    };

    return (
        <PagePlaceholder
            title="AI Communities & Ecosystem Sourcing Engine"
            description="Operational hub tracking 16 core AI/ML technical communities, 131 trial posting logs, outreach messaging templates, team ownership, and candidate conversion analytics."
            icon={Users2}
            tag="Active Sourcing Channel"
            action={
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#354f52] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        Owner: Alina Ludkowska • Trial Lead: Anton Synieokyi
                    </span>
                </div>
            }
        >
            {/* Top KPI Metrics Bar */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <Card className="p-4 bg-white border-[#eaedf3] shadow-2xs hover:border-[#354f52]/40 transition-colors">
                    <span className="text-[10px] font-bold text-[#6e84a3] uppercase tracking-wider">Posts Executed</span>
                    <p className="mt-1 text-2xl font-black text-[#1f2d3d] font-mono">131</p>
                    <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> Structured Trial
                    </span>
                </Card>
                <Card className="p-4 bg-white border-[#eaedf3] shadow-2xs hover:border-[#354f52]/40 transition-colors">
                    <span className="text-[10px] font-bold text-[#6e84a3] uppercase tracking-wider">Community Engagement</span>
                    <p className="mt-1 text-2xl font-black text-[#0077b5] font-mono">681</p>
                    <span className="text-[11px] text-[#6e84a3] mt-0.5">Reactions & Likes</span>
                </Card>
                <Card className="p-4 bg-white border-[#eaedf3] shadow-2xs hover:border-[#354f52]/40 transition-colors">
                    <span className="text-[10px] font-bold text-[#6e84a3] uppercase tracking-wider">Discussions & Replies</span>
                    <p className="mt-1 text-2xl font-black text-amber-600 font-mono">336</p>
                    <span className="text-[11px] text-[#6e84a3] mt-0.5">235 comments + 101 replies</span>
                </Card>
                <Card className="p-4 bg-white border-[#eaedf3] shadow-2xs hover:border-[#354f52]/40 transition-colors">
                    <span className="text-[10px] font-bold text-[#6e84a3] uppercase tracking-wider">CVs Generated</span>
                    <p className="mt-1 text-2xl font-black text-emerald-600 font-mono">7 CVs</p>
                    <span className="text-[11px] text-emerald-600 font-semibold mt-0.5">6 LinkedIn + 1 Slack</span>
                </Card>
                <Card className="p-4 bg-white border-[#eaedf3] shadow-2xs hover:border-[#354f52]/40 transition-colors">
                    <span className="text-[10px] font-bold text-[#6e84a3] uppercase tracking-wider">Top Channel ROI</span>
                    <p className="mt-1 text-2xl font-black text-[#354f52] font-mono">LinkedIn</p>
                    <span className="text-[11px] text-emerald-600 font-semibold mt-0.5">85.7% candidate conversion</span>
                </Card>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#eaedf3] gap-2 overflow-x-auto bg-white px-2 rounded-t-xl">
                <button
                    onClick={() => setActiveTab("directory")}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "directory"
                            ? "border-[#354f52] text-[#354f52]"
                            : "border-transparent text-[#6e84a3] hover:text-[#1f2d3d]"
                    }`}
                >
                    <Compass className="h-4 w-4" />
                    Community Directory ({trackedCommunitiesData.length})
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "history"
                            ? "border-[#354f52] text-[#354f52]"
                            : "border-transparent text-[#6e84a3] hover:text-[#1f2d3d]"
                    }`}
                >
                    <BarChart3 className="h-4 w-4" />
                    Posting Log (131 Entries)
                </button>
                <button
                    onClick={() => setActiveTab("templates")}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "templates"
                            ? "border-[#354f52] text-[#354f52]"
                            : "border-transparent text-[#6e84a3] hover:text-[#1f2d3d]"
                    }`}
                >
                    <FileText className="h-4 w-4" />
                    Outreach Copy Templates (6)
                </button>
                <button
                    onClick={() => setActiveTab("team")}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "team"
                            ? "border-[#354f52] text-[#354f52]"
                            : "border-transparent text-[#6e84a3] hover:text-[#1f2d3d]"
                    }`}
                >
                    <Users2 className="h-4 w-4" />
                    Team Cadence & Ownership
                </button>
                <button
                    onClick={() => setActiveTab("verdict")}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "verdict"
                            ? "border-[#354f52] text-[#354f52]"
                            : "border-transparent text-[#6e84a3] hover:text-[#1f2d3d]"
                    }`}
                >
                    <Target className="h-4 w-4" />
                    Management Verdict & Strategy
                </button>
            </div>

            {/* TAB 1: COMMUNITY DIRECTORY */}
            {activeTab === "directory" && (
                <div className="space-y-4">
                    {/* Search & Filters */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#eaedf3] shadow-2xs">
                        <div className="flex items-center gap-2 bg-[#f8fafc] px-3 py-2 rounded-lg border border-[#eaedf3] text-xs w-72">
                            <Search className="h-3.5 w-3.5 text-[#95aac9]" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search community, owner, rules..."
                                className="bg-transparent text-xs text-[#1f2d3d] outline-none w-full placeholder:text-[#95aac9]"
                            />
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] text-[#6e84a3] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Filter className="h-3 w-3" /> Platform:
                            </span>
                            {["All", "LinkedIn", "Discord", "Slack", "Facebook"].map((plat) => (
                                <button
                                    key={plat}
                                    onClick={() => setPlatformFilter(plat)}
                                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                                        platformFilter === plat
                                            ? "bg-[#354f52] text-white"
                                            : "bg-[#f1f4f8] text-[#475569] hover:bg-[#e2e8f0] hover:text-[#1f2d3d]"
                                    }`}
                                >
                                    {plat}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[#6e84a3] font-bold uppercase tracking-wider">Owner:</span>
                            <select
                                value={ownerFilter}
                                onChange={(e) => setOwnerFilter(e.target.value)}
                                className="bg-white border border-[#eaedf3] text-[#1f2d3d] text-xs rounded-lg px-2.5 py-1.5 outline-none font-medium"
                            >
                                <option value="All">All Owners</option>
                                <option value="Anton">Anton Synieokyi</option>
                                <option value="Ilona">Ilona Maziarska</option>
                                <option value="Marta">Marta Stankiewicz</option>
                                <option value="Benita">Benita Kabocik</option>
                                <option value="Gabriella">Gabriella Szczepanik</option>
                            </select>
                        </div>
                    </div>

                    {/* Communities Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredCommunities.map((comm) => (
                            <Card key={comm.id} className="p-4 bg-white border-[#eaedf3] hover:border-[#354f52]/40 transition-all shadow-2xs flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPlatformBadge(comm.platform)}`}>
                                                    {comm.platform}
                                                </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getEffectivenessBadge(comm.effectiveness)}`}>
                                                    {comm.effectiveness}
                                                </span>
                                                <span className="text-[11px] font-semibold text-[#6e84a3] font-mono">
                                                    {comm.members}
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-bold text-[#1f2d3d] hover:text-[#354f52] transition-colors">
                                                {comm.name}
                                            </h3>
                                        </div>

                                        <a
                                            href={comm.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-1.5 rounded-lg bg-[#f8fafc] border border-[#eaedf3] text-[#6e84a3] hover:text-[#354f52] hover:bg-[#eef2f6] transition-colors shrink-0"
                                            title="Open Community Group"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>

                                    {/* Sourcing Rules & Context */}
                                    <div className="mt-3 p-3 rounded-xl bg-[#f8fafc] border border-[#eaedf3] space-y-1.5 text-xs">
                                        <div>
                                            <span className="font-bold text-[#1f2d3d]">Rules & Strategy: </span>
                                            <span className="text-[#475569]">{comm.rules}</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-1.5 border-t border-[#eaedf3] text-[11px]">
                                            <span className="text-[#6e84a3]">Owner / Lead:</span>
                                            <span className="font-semibold text-[#354f52]">{comm.owner}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Trial Performance Bar */}
                                <div className="mt-3 pt-3 border-t border-[#eaedf3] flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-3 text-[11px] font-mono">
                                        <span className="text-[#6e84a3]">
                                            Posts: <strong className="text-[#1f2d3d]">{comm.totalPosts}</strong>
                                        </span>
                                        <span className="text-[#6e84a3]">
                                            Reacts: <strong className="text-[#0077b5]">{comm.reactions}</strong>
                                        </span>
                                        <span className="text-[#6e84a3]">
                                            Comments: <strong className="text-amber-600">{comm.comments}</strong>
                                        </span>
                                        <span className="text-[#6e84a3]">
                                            CVs: <strong className={comm.cvs > 0 ? "text-emerald-600 font-bold" : "text-[#95aac9]"}>{comm.cvs}</strong>
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setActiveTab("templates");
                                        }}
                                        className="text-[11px] font-bold text-[#354f52] hover:underline flex items-center gap-1"
                                    >
                                        Use Template <ArrowUpRight className="h-3 w-3" />
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 2: POSTING LOG & ANALYTICS */}
            {activeTab === "history" && (
                <div className="space-y-4">
                    {/* Channel Performance Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4 bg-white border-[#eaedf3] shadow-2xs border-l-4 border-l-[#0077b5]">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-extrabold text-[#0077b5] uppercase tracking-wider flex items-center gap-1.5">
                                    LinkedIn Groups (55 Posts)
                                </h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Top Performer
                                </span>
                            </div>
                            <div className="mt-3 space-y-1.5 text-xs">
                                <div className="flex justify-between text-[#6e84a3]">
                                    <span>Total Reactions</span>
                                    <span className="font-mono text-[#1f2d3d] font-bold">290</span>
                                </div>
                                <div className="flex justify-between text-[#6e84a3]">
                                    <span>Comments & Replies</span>
                                    <span className="font-mono text-[#1f2d3d] font-bold">118</span>
                                </div>
                                <div className="flex justify-between text-[#6e84a3]">
                                    <span>CVs Received</span>
                                    <span className="font-mono text-emerald-600 font-bold">6 CVs</span>
                                </div>
                                <div className="flex justify-between text-[#6e84a3]">
                                    <span>Conversion Efficiency</span>
                                    <span className="font-mono text-[#354f52] font-bold">1 CV per ~9 posts</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4 bg-white border-[#eaedf3] shadow-2xs border-l-4 border-l-[#5865F2]">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-extrabold text-[#5865F2] uppercase tracking-wider flex items-center gap-1.5">
                                    Discord Communities (44 Posts)
                                </h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                    High Chat Noise
                                </span>
                            </div>
                            <div className="mt-3 space-y-1.5 text-xs">
                                <div className="flex justify-between text-[#6e84a3]">
                                    <span>Total Reactions</span>
                                    <span className="font-mono text-[#1f2d3d] font-bold">286</span>
                                </div>
                                <div className="flex justify-between text-[#6e84a3]">
                                    <span>Comments & Replies</span>
                                    <span className="font-mono text-[#1f2d3d] font-bold">166</span>
                                </div>
                                <div className="flex justify-between text-[#6e84a3]">
                                    <span>CVs Received</span>
                                    <span className="font-mono text-rose-600 font-bold">0 CVs</span>
                                </div>
                                <div className="flex justify-between text-[#6e84a3]">
                                    <span>Trial Outcome</span>
                                    <span className="font-mono text-[#6e84a3] font-bold">Brand only / Stop direct hiring</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4 bg-white border-[#eaedf3] shadow-2xs border-l-4 border-l-[#E01E5A]">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-extrabold text-[#E01E5A] uppercase tracking-wider flex items-center gap-1.5">
                                    Slack Communities (32 Posts)
                                </h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                    Selective Value
                                </span>
                            </div>
                            <div className="mt-3 space-y-1.5 text-xs">
                                <div className="flex justify-between text-[#6e84a3]">
                                    <span>Total Reactions</span>
                                    <span className="font-mono text-[#1f2d3d] font-bold">105</span>
                                </div>
                                <div className="flex justify-between text-[#6e84a3]">
                                    <span>Comments & Replies</span>
                                    <span className="font-mono text-[#1f2d3d] font-bold">52</span>
                                </div>
                                <div className="flex justify-between text-[#6e84a3]">
                                    <span>CVs Received</span>
                                    <span className="font-mono text-emerald-600 font-bold">1 CV (MLOps)</span>
                                </div>
                                <div className="flex justify-between text-[#6e84a3]">
                                    <span>Recommendation</span>
                                    <span className="font-mono text-[#6e84a3] font-bold">Targeted #jobs channels only</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Full Posting Log Table */}
                    <Card className="p-4 bg-white border-[#eaedf3] shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-[#1f2d3d]">Full 131 Posting Activity Log</h3>
                                <p className="text-xs text-[#6e84a3]">Factual timeline conducted from May 21 to June 4 by Anton Synieokyi</p>
                            </div>
                            <span className="text-xs font-mono text-[#6e84a3]">
                                Showing all 131 logged actions
                            </span>
                        </div>

                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto rounded-xl border border-[#eaedf3]">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#f8fafc] text-[#6e84a3] uppercase font-bold text-[10px] sticky top-0 z-10 border-b border-[#eaedf3]">
                                    <tr>
                                        <th className="py-2.5 px-3">Date</th>
                                        <th className="py-2.5 px-3">Platform</th>
                                        <th className="py-2.5 px-3">Community</th>
                                        <th className="py-2.5 px-3">Activity Type</th>
                                        <th className="py-2.5 px-3 text-center">Reacts</th>
                                        <th className="py-2.5 px-3 text-center">Comments</th>
                                        <th className="py-2.5 px-3 text-center">Replies</th>
                                        <th className="py-2.5 px-3 text-center">CVs</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#eaedf3] font-mono">
                                    {postingHistoryData.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-[#f8fafc] transition-colors">
                                            <td className="py-2 px-3 text-[#1f2d3d] font-semibold">{item.date}</td>
                                            <td className="py-2 px-3">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPlatformBadge(item.platform)}`}>
                                                    {item.platform}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-[#1f2d3d] font-sans font-medium">{item.community}</td>
                                            <td className="py-2 px-3 text-[#475569] font-sans">{item.activity}</td>
                                            <td className="py-2 px-3 text-center text-[#0077b5]">{item.reactions}</td>
                                            <td className="py-2 px-3 text-center text-amber-600">{item.comments}</td>
                                            <td className="py-2 px-3 text-center text-[#475569]">{item.replies}</td>
                                            <td className="py-2 px-3 text-center">
                                                {item.cvs > 0 ? (
                                                    <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                                                        +{item.cvs} CV
                                                    </span>
                                                ) : (
                                                    <span className="text-[#95aac9]">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* TAB 3: OUTREACH COPY TEMPLATES */}
            {activeTab === "templates" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detailsData.postTemplates.map((tpl) => (
                        <Card key={tpl.id} className="p-4 bg-white border-[#eaedf3] shadow-2xs flex flex-col justify-between space-y-3">
                            <div>
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {tpl.category}
                                        </span>
                                        <h3 className="text-sm font-bold text-[#1f2d3d] mt-1">{tpl.title}</h3>
                                        <p className="text-[11px] text-[#6e84a3]">Used during: {tpl.usedDates}</p>
                                    </div>

                                    <button
                                        onClick={() => handleCopy(tpl.id, tpl.text)}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#f1f4f8] text-[#1f2d3d] hover:bg-[#354f52] hover:text-white transition-colors text-xs font-semibold"
                                        title="Copy full copy to clipboard"
                                    >
                                        {copiedId === tpl.id ? (
                                            <>
                                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                <span className="text-emerald-600">Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3.5 w-3.5" />
                                                <span>Copy Text</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="mt-3 p-3 rounded-xl bg-[#f8fafc] border border-[#eaedf3] text-xs text-[#334155] whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto font-sans">
                                    {tpl.text}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-[#eaedf3] flex items-center justify-between text-[11px] text-[#6e84a3]">
                                <span>Recommended for: <strong className="text-[#1f2d3d]">{tpl.bestFor}</strong></span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* TAB 4: TEAM CADENCE & OWNERSHIP */}
            {activeTab === "team" && (
                <div className="space-y-4">
                    <Card className="p-5 bg-white border-[#eaedf3] shadow-2xs space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-[#1f2d3d]">Mandatory Daily Community Cadence</h3>
                                <p className="text-xs text-[#6e84a3] mt-0.5">Rules set by Robert Jaskolowski & monitored centrally by Alina Ludkowska</p>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                Core Sourcing Routine
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#eaedf3] space-y-1">
                                <span className="font-bold text-[#354f52]">1. Daily 20-30 Min Block</span>
                                <p className="text-[#475569]">Each recruiter spends 20-30 min reviewing groups, commenting, reacting, and posting.</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#eaedf3] space-y-1">
                                <span className="font-bold text-[#354f52]">2. Share 1 Link / Day</span>
                                <p className="text-[#475569]">Share at least 1 concrete group link, channel, or community insight per day with the team.</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#eaedf3] space-y-1">
                                <span className="font-bold text-[#354f52]">3. Immediate Inbound Flag</span>
                                <p className="text-[#475569]">Flag any candidate interaction, reply or inbound CV immediately in the central tracker.</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#eaedf3] space-y-1">
                                <span className="font-bold text-[#354f52]">4. 2 New Groups / Wk</span>
                                <p className="text-[#475569]">Identify 2 new relevant groups per week and evaluate actual conversion response.</p>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {detailsData.teamMembers.map((member) => (
                            <Card key={member.email} className="p-4 bg-white border-[#eaedf3] shadow-2xs flex flex-col justify-between space-y-3">
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-[#1f2d3d]">{member.name}</h4>
                                            <p className="text-xs text-[#354f52] font-semibold">{member.role}</p>
                                            <p className="text-[11px] text-[#6e84a3] font-mono mt-0.5">{member.email}</p>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f1f4f8] text-[#475569] border border-[#eaedf3]">
                                            {member.status}
                                        </span>
                                    </div>

                                    <p className="mt-3 text-xs text-[#475569] leading-relaxed bg-[#f8fafc] p-3 rounded-xl border border-[#eaedf3]">
                                        {member.summary}
                                    </p>
                                </div>

                                <div className="space-y-1.5 pt-2 border-t border-[#eaedf3] text-xs">
                                    <div className="flex justify-between text-[#6e84a3]">
                                        <span>Focus Channel:</span>
                                        <span className="font-semibold text-[#1f2d3d]">{member.focus}</span>
                                    </div>
                                    <div className="flex justify-between text-[#6e84a3]">
                                        <span>Daily Cadence:</span>
                                        <span className="font-semibold text-[#475569]">{member.dailyCadence}</span>
                                    </div>
                                    <div className="flex justify-between text-[#6e84a3]">
                                        <span>Assigned Communities:</span>
                                        <span className="font-mono text-[#354f52] font-bold">{member.communitiesAssigned} Groups</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 5: MANAGEMENT VERDICT & STRATEGY */}
            {activeTab === "verdict" && (
                <div className="space-y-4">
                    <Card className="p-5 bg-white border-[#eaedf3] shadow-2xs space-y-4">
                        <div className="flex items-center gap-2 text-[#354f52] font-bold text-base border-b border-[#eaedf3] pb-3">
                            <Award className="h-5 w-5 text-[#354f52]" /> Executive Summary & Decisions (Robert Jaskolowski & Anton Synieokyi)
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                                <h4 className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> What Works Best (To Scale)
                                </h4>
                                <ul className="space-y-1.5 text-emerald-950 list-disc list-inside">
                                    <li><strong>LinkedIn AI, GenAI & Data Groups:</strong> Generated 6 of the 7 trial CVs (~1 CV per 9 posts). Highest quality and recruiter conversion.</li>
                                    <li><strong>Targeted, Role-Specific Content:</strong> Posts targeting specific profiles (AI Engineer, Python GenAI, AI Architect, MLOps) converted far better than broad announcements.</li>
                                    <li><strong>Direct Follow-ups with Engaged Members:</strong> Reaching out in DMs to professionals who liked or commented produced 6 qualified discussions in the focused 1-week test.</li>
                                    <li><strong>Polish Local FB Groups (Ilona/Benita):</strong> Useful for early-career local talent, provided candidates are filtered for seniority and EU compliance.</li>
                                </ul>
                            </div>

                            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2">
                                <h4 className="font-bold text-sm text-rose-900 flex items-center gap-1.5">
                                    <ShieldAlert className="h-4 w-4 text-rose-600" /> What Did Not Work (To Stop or Adjust)
                                </h4>
                                <ul className="space-y-1.5 text-rose-950 list-disc list-inside">
                                    <li><strong>Discord Broad Outreach (LangChain, Towards AI):</strong> 286 reactions, 166 comments, but <strong>0 CVs</strong>. Too much chatting noise; stop treating as a direct hiring channel.</li>
                                    <li><strong>Unmoderated Non-EU Inquiries:</strong> Marta identified heavy response from India/Pakistan who couldn't be hired due to EU project visa constraints.</li>
                                    <li><strong>Generic Job Advertisements:</strong> Broad "we are hiring" messages get ignored or flagged by community admins as spam. Must share technical insights and production challenges.</li>
                                    <li><strong>Ad-hoc Sourcing Without Central Logging:</strong> Prior to Alina's tracker, team activities were scattered with zero accountability.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#eaedf3] space-y-2 text-xs">
                            <h4 className="font-bold text-[#1f2d3d] text-sm">Strategic Focus Going Forward</h4>
                            <p className="text-[#475569] leading-relaxed">
                                Treat LinkedIn Groups and direct post-engagement follow-ups as a tier-1 sourcing pipeline. Discord and Slack communities remain strictly for brand visibility and engineering intelligence, rather than recruiter KPI tracking. Alina Ludkowska maintains central weekly reporting to ensure every team member adheres to the daily 20–30 minute engagement block.
                            </p>
                        </div>
                    </Card>
                </div>
            )}
        </PagePlaceholder>
    );
}
