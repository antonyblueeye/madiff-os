"use client";

import React, { useState, useEffect } from "react";
import {
    Briefcase,
    Search,
    RefreshCw,
    Trash2,
    ExternalLink,
    MapPin,
    DollarSign,
    CheckCircle2,
    Building2,
    Calendar,
    Layers,
    SlidersHorizontal,
    Globe,
    Cpu,
    ArrowUpRight,
    TrendingUp,
    BookmarkCheck,
    Check,
} from "lucide-react";
import { VacancyItem, VacancySearchRecord, SUPPORTED_JOB_SOURCES } from "@/lib/vacancy-scraper";

export default function VacanciesPage() {
    const [searchQuery, setSearchQuery] = useState("AI engineer");
    const [location, setLocation] = useState("Poland");
    const [searches, setSearches] = useState<VacancySearchRecord[]>([]);
    const [vacancies, setVacancies] = useState<VacancyItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"active" | "all">("active");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedSearch, setSelectedSearch] = useState<string | null>(null);

    // Load initial searches & vacancies
    useEffect(() => {
        loadData();
    }, [activeTab]);

    async function loadData(queryFilter?: string) {
        try {
            setInitialLoading(true);
            const params = new URLSearchParams();
            if (activeTab === "active") params.append("status", "active");
            if (queryFilter) params.append("query", queryFilter);

            const res = await fetch(`/api/vacancies?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setSearches(data.searches || []);
                setVacancies(data.vacancies || []);
            }
        } catch (err) {
            console.error("Failed to load vacancies:", err);
        } finally {
            setInitialLoading(false);
        }
    }

    // Trigger scrape & save search
    async function handleSearch(e?: React.FormEvent, customQuery?: string) {
        if (e) e.preventDefault();
        const targetQuery = (customQuery || searchQuery).trim();
        if (!targetQuery) return;

        setLoading(true);
        try {
            const res = await fetch("/api/vacancies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: targetQuery, location }),
            });
            const data = await res.json();
            if (data.success) {
                setSelectedSearch(targetQuery);
                await loadData(targetQuery);
            } else {
                alert(`Error: ${data.error || "Failed to fetch vacancies"}`);
            }
        } catch (err: any) {
            alert(`Network error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }

    // Delete a saved search
    async function handleDeleteSearch(id: number, queryName: string, e: React.MouseEvent) {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete search "${queryName}"? Old vacancies will be archived.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/vacancies?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                if (selectedSearch === queryName) {
                    setSelectedSearch(null);
                }
                await loadData();
            }
        } catch (err) {
            console.error("Failed to delete search:", err);
        }
    }

    // Filtered vacancies list
    const filteredVacancies = vacancies.filter((v) => {
        if (selectedSearch && v.searchQuery.toLowerCase() !== selectedSearch.toLowerCase()) {
            return false;
        }
        return true;
    });

    const activeCount = vacancies.filter((v) => v.isActive).length;
    const remoteCount = vacancies.filter((v) => v.isRemote).length;

    return (
        <div className="flex-1 space-y-6 p-8 bg-[#f8fafc] min-h-screen text-[#1f2d3d]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#eaedf3] pb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#354f52]/10 rounded-lg text-[#354f52]">
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-[#1f2d3d]">
                            Vacancies Radar <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-[#84a98c]/20 text-[#354f52]">PL & International</span>
                        </h1>
                    </div>
                    <p className="mt-1 text-xs text-[#6e84a3]">
                        Real-time multi-portal scraper & job intelligence aggregator. Deduplicates identical listings across Polish and international portals.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-[#eaedf3] bg-white p-1 text-xs font-medium">
                        <button
                            onClick={() => setActiveTab("active")}
                            className={`px-3 py-1.5 rounded-md transition-colors ${
                                activeTab === "active" ? "bg-[#354f52] text-white font-semibold" : "text-[#6e84a3] hover:text-[#1f2d3d]"
                            }`}
                        >
                            Active Only ({activeCount})
                        </button>
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`px-3 py-1.5 rounded-md transition-colors ${
                                activeTab === "all" ? "bg-[#354f52] text-white font-semibold" : "text-[#6e84a3] hover:text-[#1f2d3d]"
                            }`}
                        >
                            All ({vacancies.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Scraper Sources Banner */}
            <div className="bg-white rounded-xl border border-[#eaedf3] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-[#354f52]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1f2d3d]">
                            Connected Scraping Gateways ({SUPPORTED_JOB_SOURCES.length} Portals)
                        </span>
                    </div>
                    <span className="text-[11px] text-[#84a98c] font-semibold flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                        Auto-Deduplication Enabled
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {SUPPORTED_JOB_SOURCES.map((source) => (
                        <a
                            key={source.id}
                            href={source.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group p-3 rounded-lg border border-[#f1f4f8] bg-[#fafbfc] hover:bg-white hover:border-[#84a98c] hover:shadow-sm transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-[#1f2d3d] group-hover:text-[#354f52] transition-colors">
                                    {source.name}
                                </span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#354f52]/10 text-[#354f52]">
                                    {source.badge}
                                </span>
                            </div>
                            <p className="text-[10px] text-[#6e84a3] line-clamp-2 mt-1 leading-snug">
                                {source.description}
                            </p>
                            <div className="mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t border-[#eaedf3]/60">
                                <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                                    <Check className="h-2.5 w-2.5" /> Live Scrape
                                </span>
                                <ExternalLink className="h-2.5 w-2.5 text-[#95aac9] group-hover:text-[#354f52]" />
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-[#eaedf3] shadow-sm">
                    <div className="flex items-center justify-between text-[#6e84a3] mb-1">
                        <span className="text-xs font-semibold uppercase">Total Tracked</span>
                        <TrendingUp className="h-4 w-4 text-[#84a98c]" />
                    </div>
                    <div className="text-2xl font-bold text-[#1f2d3d]">{vacancies.length}</div>
                    <div className="text-[11px] text-[#95aac9] mt-0.5">Vacancies in local database</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#eaedf3] shadow-sm">
                    <div className="flex items-center justify-between text-[#6e84a3] mb-1">
                        <span className="text-xs font-semibold uppercase">Active Opportunities</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
                    <div className="text-[11px] text-[#95aac9] mt-0.5">Live openings currently online</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#eaedf3] shadow-sm">
                    <div className="flex items-center justify-between text-[#6e84a3] mb-1">
                        <span className="text-xs font-semibold uppercase">Remote / Hybrid</span>
                        <Globe className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{remoteCount}</div>
                    <div className="text-[11px] text-[#95aac9] mt-0.5">Offers with remote option</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#eaedf3] shadow-sm">
                    <div className="flex items-center justify-between text-[#6e84a3] mb-1">
                        <span className="text-xs font-semibold uppercase">Saved Searches</span>
                        <BookmarkCheck className="h-4 w-4 text-[#354f52]" />
                    </div>
                    <div className="text-2xl font-bold text-[#354f52]">{searches.length}</div>
                    <div className="text-[11px] text-[#95aac9] mt-0.5">Profiles with one-click refresh</div>
                </div>
            </div>

            {/* Search Input Bar */}
            <div className="bg-white p-5 rounded-xl border border-[#eaedf3] shadow-sm">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#95aac9]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="e.g. AI engineer, Fullstack, Python developer..."
                            className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#eaedf3] rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#354f52]/20 focus:border-[#354f52] transition-all"
                        />
                    </div>

                    <div className="relative w-full sm:w-44">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#95aac9]" />
                        <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-[#f8fafc] border border-[#eaedf3] rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#354f52]/20 focus:border-[#354f52]"
                        >
                            <option value="Poland">Poland (All)</option>
                            <option value="Warsaw">Warsaw</option>
                            <option value="Krakow">Krakow</option>
                            <option value="Wroclaw">Wroclaw</option>
                            <option value="Remote">Fully Remote</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#354f52] hover:bg-[#283d3f] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Scraping Portals...</span>
                            </>
                        ) : (
                            <>
                                <Search className="h-3.5 w-3.5" />
                                <span>Search & Scrape</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Saved Searches Chips */}
                {searches.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#f1f4f8] flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase text-[#95aac9] flex items-center gap-1">
                            <SlidersHorizontal className="h-3 w-3" /> Saved Searches:
                        </span>

                        <button
                            onClick={() => {
                                setSelectedSearch(null);
                                loadData();
                            }}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                                selectedSearch === null
                                    ? "bg-[#354f52] text-white border-[#354f52]"
                                    : "bg-white text-[#6e84a3] border-[#eaedf3] hover:bg-[#f1f4f8]"
                            }`}
                        >
                            Show All
                        </button>

                        {searches.map((s) => {
                            const isSelected = selectedSearch?.toLowerCase() === s.query.toLowerCase();
                            return (
                                <div
                                    key={s.id}
                                    onClick={() => {
                                        setSelectedSearch(s.query);
                                        setSearchQuery(s.query);
                                    }}
                                    className={`group cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border transition-all ${
                                        isSelected
                                            ? "bg-[#84a98c]/20 border-[#84a98c] text-[#354f52] font-semibold"
                                            : "bg-white border-[#eaedf3] text-[#475569] hover:border-[#95aac9]"
                                    }`}
                                >
                                    <span>{s.query}</span>
                                    <span className="text-[10px] px-1.5 py-0.2 bg-[#f1f4f8] text-[#6e84a3] rounded-full">
                                        {s.total_found}
                                    </span>

                                    {/* Refresh button */}
                                    <button
                                        type="button"
                                        title="Re-scrape fresh vacancies for this search"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSearch(undefined, s.query);
                                        }}
                                        className="ml-1 p-0.5 text-[#95aac9] hover:text-[#354f52] hover:bg-black/5 rounded transition-colors"
                                    >
                                        <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                                    </button>

                                    {/* Delete search button */}
                                    <button
                                        type="button"
                                        title="Delete search and archive vacancies"
                                        onClick={(e) => handleDeleteSearch(s.id, s.query, e)}
                                        className="p-0.5 text-[#95aac9] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Vacancies Results List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#6e84a3] px-1">
                    <span>
                        Showing <b>{filteredVacancies.length}</b> {activeTab === "active" ? "active" : "total"} vacancies
                        {selectedSearch ? ` for "${selectedSearch}"` : ""}
                    </span>
                    <span>Sorted by latest posted</span>
                </div>

                {initialLoading ? (
                    <div className="bg-white rounded-xl border border-[#eaedf3] p-12 text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-[#84a98c] mb-3" />
                        <p className="text-xs text-[#6e84a3] font-medium">Loading vacancies from local database...</p>
                    </div>
                ) : filteredVacancies.length === 0 ? (
                    <div className="bg-white rounded-xl border border-dashed border-[#eaedf3] p-12 text-center">
                        <Briefcase className="h-10 w-10 mx-auto text-[#cad2c5] mb-3" />
                        <h3 className="text-sm font-bold text-[#1f2d3d]">No vacancies found</h3>
                        <p className="text-xs text-[#6e84a3] mt-1 max-w-sm mx-auto">
                            Type a query like <b>"AI engineer"</b> above and hit <b>"Search & Scrape"</b> to pull real live job postings.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {filteredVacancies.map((v) => {
                            const hasMultipleSources = v.sources && v.sources.length > 1;

                            return (
                                <div
                                    key={v.canonicalKey || v.id}
                                    className={`bg-white rounded-xl border p-5 transition-all hover:shadow-sm ${
                                        v.isActive
                                            ? "border-[#eaedf3] hover:border-[#84a98c]"
                                            : "border-slate-200 bg-slate-50/50 opacity-70"
                                    }`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            {/* Header tags: Active status & Multiple sources */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                        v.isActive
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : "bg-slate-100 text-slate-600 border border-slate-200"
                                                    }`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${v.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                                                    {v.isActive ? "Active Opening" : "Inactive / Archived"}
                                                </span>

                                                {/* Deduplication & Sources Badge */}
                                                <div className="flex items-center gap-1">
                                                    {v.sources?.map((s, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={s.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f1f4f8] hover:bg-[#e2e8f0] text-[#354f52] font-semibold text-[10px] rounded-md transition-colors"
                                                            title={`View original offer on ${s.name}`}
                                                        >
                                                            <span>{s.name}</span>
                                                            <ArrowUpRight className="h-2.5 w-2.5 opacity-60" />
                                                        </a>
                                                    ))}
                                                    {hasMultipleSources && (
                                                        <span className="text-[10px] font-bold text-[#84a98c] bg-[#84a98c]/15 px-1.5 py-0.5 rounded-full">
                                                            ★ Found on 2+ Portals (Deduplicated)
                                                        </span>
                                                    )}
                                                </div>

                                                <span className="text-[11px] text-[#95aac9] flex items-center gap-1 ml-auto">
                                                    <Calendar className="h-3 w-3" />
                                                    {v.postedAt ? new Date(v.postedAt).toLocaleDateString() : "Recently"}
                                                </span>
                                            </div>

                                            {/* Title & Company */}
                                            <div>
                                                <h3 className="text-base font-bold text-[#1f2d3d] hover:text-[#354f52] transition-colors">
                                                    <a href={v.primaryUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                                                        {v.title}
                                                        <ExternalLink className="h-3.5 w-3.5 opacity-40 hover:opacity-100" />
                                                    </a>
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-[#6e84a3] mt-1 font-medium">
                                                    <span className="flex items-center gap-1 text-[#1f2d3d] font-semibold">
                                                        <Building2 className="h-3.5 w-3.5 text-[#84a98c]" />
                                                        {v.companyName}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3.5 w-3.5 text-[#95aac9]" />
                                                        {v.location}
                                                    </span>
                                                    {v.isRemote && (
                                                        <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                                            <Globe className="h-3 w-3" /> Remote
                                                        </span>
                                                    )}
                                                    {v.searchQuery && (
                                                        <span className="text-[10px] text-[#95aac9]">
                                                            Query: <i>#{v.searchQuery}</i>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Description preview */}
                                            {v.description && (
                                                <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed bg-[#f8fafc] p-2.5 rounded-lg border border-[#f1f4f8]">
                                                    {v.description}
                                                </p>
                                            )}

                                            {/* Requirements / Tech tags */}
                                            {v.requirements && v.requirements.length > 0 && (
                                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                                    <Cpu className="h-3 w-3 text-[#95aac9] mr-0.5" />
                                                    {v.requirements.map((req, rIdx) => (
                                                        <span
                                                            key={rIdx}
                                                            className="px-2 py-0.5 bg-[#f1f4f8] text-[#475569] text-[10px] font-medium rounded-md"
                                                        >
                                                            {req}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right side: Salary & Direct Apply */}
                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-[#eaedf3] min-w-[180px]">
                                            <div className="text-left md:text-right">
                                                {v.salaryFrom || v.salaryTo ? (
                                                    <div>
                                                        <div className="text-sm font-extrabold text-[#354f52] flex items-center md:justify-end gap-1">
                                                            <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                                                            {v.salaryFrom?.toLocaleString()} {v.salaryTo ? `- ${v.salaryTo?.toLocaleString()}` : ""}{" "}
                                                            <span className="text-[10px] font-bold text-[#6e84a3]">{v.salaryCurrency}</span>
                                                        </div>
                                                        <div className="text-[10px] text-[#95aac9] font-medium uppercase">
                                                            {v.salaryType || "Monthly"}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-[#95aac9] italic">Salary Undisclosed</span>
                                                )}
                                            </div>

                                            <a
                                                href={v.primaryUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-[#354f52] hover:bg-[#283d3f] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                                            >
                                                <span>View Offer</span>
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
