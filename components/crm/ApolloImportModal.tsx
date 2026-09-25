"use client";

import { useState } from "react";
import Image from "next/image";
import {
    Sparkles,
    Search,
    X,
    CheckCircle2,
    Building2,
    Users,
    MapPin,
    Briefcase,
    Mail,
    SlidersHorizontal,
    AlertCircle,
    Loader2,
} from "lucide-react";

interface ApolloImportModalProps {
    onClose: () => void;
    onImportSuccess: (count?: number, message?: string) => void;
}

// Preset employee range options in Apollo format
const EMPLOYEE_RANGES = [
    { label: "1-10", value: "1,10" },
    { label: "11-50", value: "11,50" },
    { label: "51-200", value: "51,200" },
    { label: "201-500", value: "201,500" },
    { label: "501-1,000", value: "501,1000" },
    { label: "1,000+", value: "1001,10000" },
];

export function ApolloImportModal({ onClose, onImportSuccess }: ApolloImportModalProps) {
    // Form fields
    const [titles, setTitles] = useState("Chief Technology Officer, VP of Engineering, Head of AI");
    const [locations, setLocations] = useState("United States, United Kingdom, Germany, France");
    const [selectedRanges, setSelectedRanges] = useState<string[]>(["51,200", "201,500"]);
    const [industries, setIndustries] = useState("FinTech, Artificial Intelligence, SaaS");
    const [keywords, setKeywords] = useState("");
    const [emailStatus, setEmailStatus] = useState<"verified" | "any">("verified");
    const [limit, setLimit] = useState(25);
    const [campaign, setCampaign] = useState("Apollo Inbound Sourcing");

    // Live preview & execution states
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [previewCount, setPreviewCount] = useState<number | null>(null);
    const [previewSamples, setPreviewSamples] = useState<any[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const toggleRange = (val: string) => {
        setSelectedRanges((prev) =>
            prev.includes(val) ? prev.filter((r) => r !== val) : [...prev, val]
        );
    };

    // Test query and get exact total count without spending credits
    const handlePreviewSearch = async () => {
        setIsPreviewing(true);
        setErrorMessage(null);
        try {
            const res = await fetch("/api/apollo/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobTitles: titles,
                    locations: locations,
                    employeeRanges: selectedRanges,
                    industries: industries,
                    keywords: keywords,
                    emailStatus: emailStatus,
                    perPage: 5,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setPreviewCount(data.totalEntries);
                setPreviewSamples(data.previewPeople || []);
            } else {
                setErrorMessage(data.error || data.details || "Search failed");
            }
        } catch (err: any) {
            setErrorMessage(err.message || "Network error while searching Apollo");
        } finally {
            setIsPreviewing(false);
        }
    };

    // Execute actual import with credit-consuming bulk match and save to PostgreSQL
    const handleImport = async () => {
        setIsImporting(true);
        setErrorMessage(null);
        try {
            const res = await fetch("/api/apollo/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobTitles: titles,
                    locations: locations,
                    employeeRanges: selectedRanges,
                    industries: industries,
                    keywords: keywords,
                    emailStatus: emailStatus,
                    limit: Number(limit) || 25,
                    campaign: campaign.trim() || "Apollo Inbound Sourcing",
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                onImportSuccess(data.importedCount, data.message);
            } else {
                setErrorMessage(data.error || data.details || "Import failed");
            }
        } catch (err: any) {
            setErrorMessage(err.message || "Failed to complete import");
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-[#eaedf3] space-y-4 my-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#eaedf3] pb-3.5">
                    <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-1 shadow-xs">
                            <Image
                                src="/apollo.jpg"
                                alt="Apollo.io"
                                fill
                                sizes="40px"
                                className="object-contain p-0.5"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-extrabold text-[#1f2d3d]">Import Leads from Apollo.io</h3>
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                    Live API Active
                                </span>
                            </div>
                            <p className="text-xs text-[#6e84a3]">
                                Search Apollo database, preview matching count, and unlock verified emails directly into CRM
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isImporting}
                        className="rounded-lg p-1.5 text-[#95aac9] hover:bg-[#f1f4f8] hover:text-[#1f2d3d] disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {errorMessage && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 animate-in fade-in">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                        <div>
                            <span className="font-bold">Apollo Error: </span>
                            {errorMessage}
                        </div>
                    </div>
                )}

                {/* Filters Grid */}
                <div className="space-y-3.5 pt-1 text-xs">
                    {/* Job Titles */}
                    <div className="space-y-1">
                        <label className="flex items-center gap-1.5 font-bold uppercase text-[#6e84a3] text-[10px]">
                            <Briefcase className="h-3 w-3 text-[#354f52]" />
                            Target Job Titles / Positions (comma-separated)
                        </label>
                        <input
                            value={titles}
                            onChange={(e) => setTitles(e.target.value)}
                            placeholder="e.g. Chief Technology Officer, VP of Engineering, Head of AI"
                            className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3.5 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white transition-all"
                        />
                    </div>

                    {/* Geographies & Industries */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="flex items-center gap-1.5 font-bold uppercase text-[#6e84a3] text-[10px]">
                                <MapPin className="h-3 w-3 text-[#354f52]" />
                                Target Locations / Countries
                            </label>
                            <input
                                value={locations}
                                onChange={(e) => setLocations(e.target.value)}
                                placeholder="e.g. United States, Germany, UK"
                                className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3.5 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="flex items-center gap-1.5 font-bold uppercase text-[#6e84a3] text-[10px]">
                                <Building2 className="h-3 w-3 text-[#354f52]" />
                                Industry & Tags
                            </label>
                            <input
                                value={industries}
                                onChange={(e) => setIndustries(e.target.value)}
                                placeholder="e.g. FinTech, Artificial Intelligence, SaaS"
                                className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3.5 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* Headcount checkboxes */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 font-bold uppercase text-[#6e84a3] text-[10px]">
                            <Users className="h-3 w-3 text-[#354f52]" />
                            Company Headcount / Size (Select ranges)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {EMPLOYEE_RANGES.map((rg) => {
                                const isSelected = selectedRanges.includes(rg.value);
                                return (
                                    <button
                                        type="button"
                                        key={rg.value}
                                        onClick={() => toggleRange(rg.value)}
                                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all ${
                                            isSelected
                                                ? "bg-[#354f52] text-white border-[#354f52] shadow-xs"
                                                : "bg-[#f8fafc] text-[#6e84a3] border-[#eaedf3] hover:bg-white hover:text-[#1f2d3d]"
                                        }`}
                                    >
                                        {rg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Email Verification + Import Limit + Campaign */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className="space-y-1">
                            <label className="flex items-center gap-1.5 font-bold uppercase text-[#6e84a3] text-[10px]">
                                <Mail className="h-3 w-3 text-[#354f52]" />
                                Email Status
                            </label>
                            <select
                                value={emailStatus}
                                onChange={(e) => setEmailStatus(e.target.value as any)}
                                className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                            >
                                <option value="verified">Verified Emails Only (100% deliverable)</option>
                                <option value="any">Any Available Contact</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="flex items-center gap-1.5 font-bold uppercase text-[#6e84a3] text-[10px]">
                                <SlidersHorizontal className="h-3 w-3 text-[#354f52]" />
                                Import Limit (Contacts)
                            </label>
                            <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-2 text-xs text-[#1f2d3d] font-bold text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                            >
                                <option value={10}>10 contacts</option>
                                <option value={25}>25 contacts</option>
                                <option value={50}>50 contacts</option>
                                <option value={100}>100 contacts</option>
                                <option value={150}>150 contacts</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="flex items-center gap-1.5 font-bold uppercase text-[#6e84a3] text-[10px]">
                                Campaign Tag
                            </label>
                            <input
                                value={campaign}
                                onChange={(e) => setCampaign(e.target.value)}
                                placeholder="Apollo Outreach"
                                className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* Preview matching results banner */}
                    <div className="rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-[#1f2d3d]">Apollo Search Preview</span>
                                {previewCount !== null && (
                                    <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5">
                                        {previewCount.toLocaleString()} Total Found
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-[#6e84a3]">
                                {previewCount !== null
                                    ? `Click 'Import ${limit} Leads' below to pull the first ${Math.min(limit, previewCount)} contacts with verified work emails into CRM.`
                                    : "Check how many contacts match before importing."}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handlePreviewSearch}
                            disabled={isPreviewing || isImporting}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs font-bold text-[#354f52] hover:bg-[#f1f4f8] transition-colors shadow-2xs disabled:opacity-50 shrink-0"
                        >
                            {isPreviewing ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>Searching...</span>
                                </>
                            ) : (
                                <>
                                    <Search className="h-3.5 w-3.5 text-[#354f52]" />
                                    <span>Check Count</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Preview Sample List if available */}
                    {previewSamples.length > 0 && (
                        <div className="rounded-xl border border-dashed border-[#eaedf3] p-2.5 bg-white space-y-1.5">
                            <span className="text-[10px] font-bold uppercase text-[#6e84a3]">Sample matches in Apollo database:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {previewSamples.map((s, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-2 rounded-lg bg-[#f8fafc] px-2.5 py-1.5 border border-[#eaedf3] text-[11px]">
                                        <div className="truncate">
                                            <div className="font-bold text-[#1f2d3d] truncate">
                                                {s.firstName} {s.lastNameObfuscated}
                                            </div>
                                            <div className="text-[10px] text-[#6e84a3] truncate">
                                                {s.title} • {s.companyName || "Private"}
                                            </div>
                                        </div>
                                        <span className="rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 shrink-0">
                                            Email Ready
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-[#eaedf3]">
                    <div className="text-[11px] text-[#6e84a3]">
                        Extracts: Name, Job Title, Company, Domain, Email, Phone, Location & LinkedIn
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isImporting}
                            className="rounded-lg px-3.5 py-2 text-xs font-semibold text-[#6e84a3] hover:text-[#1f2d3d] disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleImport}
                            disabled={isImporting}
                            className="flex items-center gap-1.5 rounded-lg bg-[#354f52] px-5 py-2 text-xs font-bold text-white hover:bg-[#2f3e46] transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isImporting ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>Importing {limit} Leads into CRM...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>Import {limit} Leads to CRM</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
