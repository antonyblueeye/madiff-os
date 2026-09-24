"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { LeadItem } from "@/lib/mock-data";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ChannelBadges } from "@/components/crm/ChannelBadges";
import { ChannelPushModal } from "@/components/crm/ChannelPushModal";
import { LeadDrawer } from "@/components/crm/LeadDrawer";
import { ApolloImportModal } from "@/components/crm/ApolloImportModal";
import {
    Users,
    Search,
    Plus,
    CheckCircle2,
    Building2,
    ArrowRight,
    RefreshCw,
    UserCheck,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    X,
    ExternalLink,
    Database,
    Globe,
} from "lucide-react";

const ITEMS_PER_PAGE_OPTIONS = [15, 25, 50, 100];

export default function CRMPage() {
    const [leads, setLeads] = useState<LeadItem[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState("");
    const [filterName, setFilterName] = useState("");
    const [filterEmail, setFilterEmail] = useState("");
    const [filterCompany, setFilterCompany] = useState("");
    const [filterOwner, setFilterOwner] = useState("All");
    const [filterLifecycleStage, setFilterLifecycleStage] = useState("All");
    const [filterCampaign, setFilterCampaign] = useState("All");
    const [filterChannel, setFilterChannel] = useState("All");
    const [filterDateFrom, setFilterDateFrom] = useState("");
    const [filterDateTo, setFilterDateTo] = useState("");

    // Dynamic dropdown filter options from DB
    const [availableOwners, setAvailableOwners] = useState<string[]>([]);
    const [availableStages, setAvailableStages] = useState<string[]>([]);
    const [availableCampaigns, setAvailableCampaigns] = useState<string[]>([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    // Selection & Modals
    const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
    const [drawerLead, setDrawerLead] = useState<LeadItem | null>(null);
    const [channelModalInfo, setChannelModalInfo] = useState<{
        channelKey: "hubspot" | "reply" | "linkedhelper" | "zoho";
        leads: LeadItem[];
    } | null>(null);
    const [isApolloImportOpen, setIsApolloImportOpen] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [pendingPushCount, setPendingPushCount] = useState(0);
    const [isPushingPending, setIsPushingPending] = useState(false);

    // Fetch leads from our PostgreSQL database
    const loadLeadsFromDb = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(currentPage),
                limit: String(pageSize),
            });

            if (searchQuery) params.set("search", searchQuery);
            if (filterName) params.set("name", filterName);
            if (filterEmail) params.set("email", filterEmail);
            if (filterCompany) params.set("company", filterCompany);
            if (filterOwner && filterOwner !== "All") params.set("owner", filterOwner);
            if (filterLifecycleStage && filterLifecycleStage !== "All") params.set("lifecycleStage", filterLifecycleStage);
            if (filterCampaign && filterCampaign !== "All") params.set("campaign", filterCampaign);
            if (filterChannel && filterChannel !== "All") params.set("channel", filterChannel);
            if (filterDateFrom) params.set("dateFrom", filterDateFrom);
            if (filterDateTo) params.set("dateTo", filterDateTo);

            const res = await fetch(`/api/leads?${params.toString()}`);
            const data = await res.json();

            if (res.ok) {
                setLeads(data.leads || []);
                setTotalCount(data.totalCount || 0);
                setTotalPages(data.totalPages || 1);
                setPendingPushCount(data.pendingPushCount || 0);
                if (data.availableOwners) setAvailableOwners(data.availableOwners);
                if (data.availableStages) setAvailableStages(data.availableStages);
                if (data.availableCampaigns) setAvailableCampaigns(data.availableCampaigns);
            } else {
                setNotification(data.error || "Failed to load leads from database");
            }
        } catch (err: any) {
            setNotification(`Database error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [
        currentPage,
        pageSize,
        searchQuery,
        filterName,
        filterEmail,
        filterCompany,
        filterOwner,
        filterLifecycleStage,
        filterCampaign,
        filterChannel,
        filterDateFrom,
        filterDateTo,
    ]);

    // Push all pending changes to HubSpot CRM
    const pushAllPendingToHubSpot = async () => {
        setIsPushingPending(true);
        try {
            setNotification("Pushing modified contacts to HubSpot CRM...");
            const res = await fetch("/api/leads/push-hubspot", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setNotification(`Pushed ${data.pushedCount} modified contacts to HubSpot successfully!`);
                await loadLeadsFromDb();
            } else {
                setNotification(data.error || "Push to HubSpot failed");
            }
        } catch (err: any) {
            setNotification(`Push failed: ${err.message}`);
        } finally {
            setIsPushingPending(false);
            setTimeout(() => setNotification(null), 5000);
        }
    };

    // Initial load and filter reaction
    useEffect(() => {
        loadLeadsFromDb();
    }, [loadLeadsFromDb]);

    // Synchronize HubSpot into PostgreSQL with live progress polling (instant incremental by default)
    const syncHubSpotToDb = async (full = false) => {
        setIsSyncing(true);
        try {
            setNotification(full ? "Starting full sync from HubSpot (~40k contacts)..." : "Checking HubSpot for recently updated contacts...");
            const res = await fetch(`/api/leads/sync${full ? "?full=true" : ""}`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) {
                setNotification(data.error || "Sync failed to start");
                setIsSyncing(false);
                return;
            }

            // Poll progress
            const interval = setInterval(async () => {
                try {
                    const statusRes = await fetch("/api/leads/sync");
                    const statusData = await statusRes.json();

                    if (statusData.isRunning) {
                        setNotification(statusData.statusMessage || "Sync in progress...");
                        loadLeadsFromDb();
                    } else {
                        clearInterval(interval);
                        setIsSyncing(false);
                        setNotification(
                            statusData.statusMessage || `Sync completed! Updated ${statusData.syncedCount} contacts.`
                        );
                        loadLeadsFromDb();
                        setTimeout(() => setNotification(null), 6000);
                    }
                } catch {
                    clearInterval(interval);
                    setIsSyncing(false);
                }
            }, 1500);
        } catch (err: any) {
            setNotification(`Sync failed: ${err.message}`);
            setIsSyncing(false);
        }
    };

    // Synchronize Reply.io into PostgreSQL (campaigns, conversations, replies)
    const [isSyncingReply, setIsSyncingReply] = useState(false);
    const syncReplyToDb = async () => {
        setIsSyncingReply(true);
        try {
            setNotification("Syncing Reply.io campaigns, messages & reply statuses...");
            const res = await fetch("/api/reply/sync", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setNotification(data.message || `Reply.io sync completed! (${data.contactsUpdatedCount} contacts updated)`);
                await loadLeadsFromDb();
            } else {
                setNotification(`Reply.io sync error: ${data.error || "Failed"}`);
            }
        } catch (err: any) {
            setNotification(`Reply.io sync failed: ${err.message}`);
        } finally {
            setIsSyncingReply(false);
            setTimeout(() => setNotification(null), 6000);
        }
    };

    const hasActiveFilters = Boolean(
        searchQuery ||
        filterName ||
        filterEmail ||
        filterCompany ||
        filterOwner !== "All" ||
        filterLifecycleStage !== "All" ||
        filterCampaign !== "All" ||
        filterChannel !== "All" ||
        filterDateFrom ||
        filterDateTo
    );

    const resetFilters = () => {
        setSearchQuery("");
        setFilterName("");
        setFilterEmail("");
        setFilterCompany("");
        setFilterOwner("All");
        setFilterLifecycleStage("All");
        setFilterCampaign("All");
        setFilterChannel("All");
        setFilterDateFrom("");
        setFilterDateTo("");
        setCurrentPage(1);
    };

    // Selection handlers
    const toggleSelectRow = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedLeadIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const pageIds = leads.map((l) => l.id);
        const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedLeadIds.includes(id));
        if (allPageSelected) {
            setSelectedLeadIds((prev) => prev.filter((id) => !pageIds.includes(id)));
        } else {
            setSelectedLeadIds((prev) => Array.from(new Set([...prev, ...pageIds])));
        }
    };

    // Push channel modal handler
    const handleChannelBadgeClick = (
        channelKey: "hubspot" | "reply" | "linkedhelper",
        lead: LeadItem
    ) => {
        setChannelModalInfo({
            channelKey,
            leads: [lead],
        });
    };

    const handleBulkPush = (channelKey: "hubspot" | "reply" | "linkedhelper") => {
        const selectedList = leads.filter((l) => selectedLeadIds.includes(l.id));
        if (selectedList.length === 0) return;
        setChannelModalInfo({
            channelKey,
            leads: selectedList,
        });
    };

    const handleChannelSuccess = async (channelKey: string, leadIds: string[], details: string) => {
        setChannelModalInfo(null);
        setSelectedLeadIds([]);

        if (channelKey === "hubspot") {
            try {
                setNotification(`Pushing ${leadIds.length} contact(s) directly to HubSpot CRM...`);
                const res = await fetch("/api/leads/push-hubspot", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ leadIds }),
                });
                const data = await res.json();
                if (res.ok) {
                    setNotification(
                        `Successfully synced ${data.pushedCount} contact(s) to HubSpot CRM! (${details})`
                    );
                    await loadLeadsFromDb();
                } else {
                    setNotification(`HubSpot sync error: ${data.error || "Failed"}`);
                }
            } catch (err: any) {
                setNotification(`HubSpot sync error: ${err.message}`);
            }
        } else {
            setNotification(
                `Successfully dispatched ${leadIds.length} contact(s) to ${channelKey.toUpperCase()} (${details})`
            );
            await loadLeadsFromDb();
        }
        setTimeout(() => setNotification(null), 5000);
    };

    const handleApolloImportSuccess = () => {
        setIsApolloImportOpen(false);
        loadLeadsFromDb();
        setNotification(`Imported contacts from Apollo.io into CRM!`);
        setTimeout(() => setNotification(null), 4000);
    };

    const startIndex = (currentPage - 1) * pageSize;

    return (
        <PagePlaceholder
            title="Lead CRM & Omnichannel Control"
            description="Universal contact repository powered by local PostgreSQL database with bidirectional HubSpot synchronization."
            icon={Users}
            tag={`PostgreSQL: ${totalCount.toLocaleString()} Leads`}
            action={
                <div className="flex items-center gap-2">
                    {pendingPushCount > 0 && (
                        <button
                            onClick={pushAllPendingToHubSpot}
                            disabled={isPushingPending}
                            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition-colors disabled:opacity-50 animate-in fade-in"
                            title="Push modified contacts to HubSpot CRM"
                        >
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-black text-amber-700">
                                {pendingPushCount}
                            </span>
                            <span>{isPushingPending ? "Pushing..." : "Push to HubSpot"}</span>
                        </button>
                    )}

                    <div className="flex items-center rounded-lg border border-[#eaedf3] bg-white shadow-sm overflow-hidden">
                        <button
                            onClick={() => syncHubSpotToDb(false)}
                            disabled={isSyncing}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#354f52] hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
                            title="Quick Incremental Sync: Updates only contacts modified since last sync"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 text-[#354f52] ${isSyncing ? "animate-spin" : ""}`} />
                            {isSyncing ? "Syncing..." : "Quick Sync"}
                        </button>
                        <span className="h-4 w-px bg-[#eaedf3]" />
                        <button
                            onClick={() => syncHubSpotToDb(true)}
                            disabled={isSyncing}
                            className="px-2.5 py-2 text-[10px] font-bold text-[#6e84a3] hover:text-[#1f2d3d] hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
                            title="Full Sync: Download all 40,000+ contacts from scratch"
                        >
                            Full Sync
                        </button>
                    </div>

                    {/* Reply.io Sync Button */}
                    <button
                        onClick={syncReplyToDb}
                        disabled={isSyncingReply}
                        className="flex items-center gap-1.5 rounded-lg border border-[#eaedf3] bg-white px-3 py-2 text-xs font-bold text-[#354f52] shadow-xs hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
                        title="Sync Reply.io campaigns, activities, messages and replies into PostgreSQL"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 ${isSyncingReply ? "animate-spin" : ""}`} />
                        {isSyncingReply ? "Syncing Reply..." : "Sync Reply.io"}
                    </button>

                    <button
                        onClick={() => setIsApolloImportOpen(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-[#354f52] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#2f3e46] transition-colors"
                    >
                        <Plus className="h-4 w-4" /> Import from Apollo
                    </button>
                </div>
            }
        >
            {notification && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    {notification}
                </div>
            )}

            {/* Comprehensive Filter Panel */}
            <div className="rounded-xl border border-[#eaedf3] bg-white p-4 shadow-xs space-y-3.5">
                {/* Top Search & Actions Row */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2.5 flex-1">
                        {/* Universal Quick Search */}
                        <div className="flex items-center gap-2 rounded-lg bg-[#f8fafc] border border-[#eaedf3] px-3.5 py-2 w-full sm:w-72 text-xs text-[#1f2d3d] focus-within:border-[#354f52] focus-within:bg-white transition-all shadow-xs">
                            <Search className="h-4 w-4 text-[#95aac9] shrink-0" />
                            <input
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Search by name, email, company, title..."
                                className="bg-transparent text-xs text-[#1f2d3d] outline-none w-full placeholder:text-[#95aac9]"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="text-[#95aac9] hover:text-[#1f2d3d]">
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>

                        {/* Reset Filters Button */}
                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                className="flex items-center gap-1 text-[11px] font-bold text-[#e63946] hover:text-red-700 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                                <X className="h-3 w-3" /> Reset Filters
                            </button>
                        )}
                    </div>

                    {/* Bulk Dispatch Trigger */}
                    {selectedLeadIds.length > 0 && (
                        <div className="flex items-center gap-2 bg-[#f8fafc] border border-[#eaedf3] px-3 py-1.5 rounded-lg shadow-xs animate-in fade-in">
                            <span className="text-xs font-bold text-[#1f2d3d]">
                                {selectedLeadIds.length} Selected
                            </span>
                            <span className="text-[#eaedf3]">|</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-[#6e84a3]">Push bulk:</span>
                                <button
                                    onClick={() => handleBulkPush("reply")}
                                    className="rounded bg-white px-2 py-0.5 text-[11px] font-bold text-[#354f52] border border-[#eaedf3] hover:bg-[#354f52] hover:text-white"
                                >
                                    Reply.io
                                </button>
                                <button
                                    onClick={() => handleBulkPush("hubspot")}
                                    className="rounded bg-white px-2 py-0.5 text-[11px] font-bold text-[#354f52] border border-[#eaedf3] hover:bg-[#354f52] hover:text-white"
                                >
                                    HubSpot
                                </button>
                                <button
                                    onClick={() => handleBulkPush("linkedhelper")}
                                    className="rounded bg-white px-2 py-0.5 text-[11px] font-bold text-[#354f52] border border-[#eaedf3] hover:bg-[#354f52] hover:text-white"
                                >
                                    LinkedHelper
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Specific Granular Filter Fields Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-[#f1f4f8] text-xs">
                    {/* Name Filter */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Name</label>
                        <input
                            value={filterName}
                            onChange={(e) => {
                                setFilterName(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Filter name..."
                            className="w-full rounded-md border border-[#eaedf3] bg-[#f8fafc] px-2.5 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                        />
                    </div>

                    {/* Email Filter */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Email</label>
                        <input
                            value={filterEmail}
                            onChange={(e) => {
                                setFilterEmail(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Filter email..."
                            className="w-full rounded-md border border-[#eaedf3] bg-[#f8fafc] px-2.5 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                        />
                    </div>

                    {/* Company Filter */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Company</label>
                        <input
                            value={filterCompany}
                            onChange={(e) => {
                                setFilterCompany(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Filter company..."
                            className="w-full rounded-md border border-[#eaedf3] bg-[#f8fafc] px-2.5 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                        />
                    </div>

                    {/* Contact Owner Filter */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Contact Owner</label>
                        <select
                            value={filterOwner}
                            onChange={(e) => {
                                setFilterOwner(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-md border border-[#eaedf3] bg-[#f8fafc] px-2 py-1.5 text-xs text-[#1f2d3d] outline-none cursor-pointer focus:border-[#354f52] focus:bg-white"
                        >
                            <option value="All">All Owners</option>
                            {availableOwners.map((owner) => (
                                <option key={owner} value={owner}>
                                    {owner}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Lifecycle Stage Filter */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Lifecycle Stage</label>
                        <select
                            value={filterLifecycleStage}
                            onChange={(e) => {
                                setFilterLifecycleStage(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-md border border-[#eaedf3] bg-[#f8fafc] px-2 py-1.5 text-xs text-[#1f2d3d] outline-none cursor-pointer focus:border-[#354f52] focus:bg-white capitalize"
                        >
                            <option value="All">All Stages</option>
                            {availableStages.map((stage) => (
                                <option key={stage} value={stage}>
                                    {stage}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Campaign Filter */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Campaign</label>
                        <select
                            value={filterCampaign}
                            onChange={(e) => {
                                setFilterCampaign(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-md border border-[#eaedf3] bg-[#f8fafc] px-2 py-1.5 text-xs text-[#1f2d3d] outline-none cursor-pointer focus:border-[#354f52] focus:bg-white"
                        >
                            <option value="All">All Campaigns</option>
                            {availableCampaigns.map((camp) => (
                                <option key={camp} value={camp}>
                                    {camp}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Created Date Filter (From) */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Created Date (From)</label>
                        <input
                            type="date"
                            value={filterDateFrom}
                            onChange={(e) => {
                                setFilterDateFrom(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-md border border-[#eaedf3] bg-[#f8fafc] px-2 py-1 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                        />
                    </div>
                </div>
            </div>

            {/* Leads Table: Contact | Title | Company | LinkedIn | Lifecycle Stage | Contact Owner */}
            <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#eaedf3] bg-[#fafbfc] text-[#6e84a3] font-bold uppercase text-[10px]">
                                <th className="py-3.5 px-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={
                                            leads.length > 0 &&
                                            leads.every((l) => selectedLeadIds.includes(l.id))
                                        }
                                        onChange={toggleSelectAll}
                                        className="rounded border-[#eaedf3] text-[#354f52]"
                                    />
                                </th>
                                <th className="py-3.5 px-4">Contact</th>
                                <th className="py-3.5 px-4">Title</th>
                                <th className="py-3.5 px-4">Company</th>
                                <th className="py-3.5 px-4 text-center">LinkedIn</th>
                                <th className="py-3.5 px-4">Lifecycle Stage</th>
                                <th className="py-3.5 px-4">Contact Owner</th>
                                <th className="py-3.5 px-4 text-center">Channels (HS / Reply / LH / Zoho)</th>
                                <th className="py-3.5 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eaedf3]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-xs text-[#6e84a3]">
                                        <div className="inline-flex items-center gap-2">
                                            <RefreshCw className="h-4 w-4 animate-spin text-[#354f52]" />
                                            <span>Loading leads from PostgreSQL database...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-xs text-[#95aac9]">
                                        No contacts found matching your criteria. Try resetting filters or clicking &quot;Sync HubSpot to DB&quot;.
                                    </td>
                                </tr>
                            ) : (
                                leads.map((lead) => {
                                    const isSelected = selectedLeadIds.includes(lead.id);

                                    return (
                                        <tr
                                            key={lead.id}
                                            onClick={() => setDrawerLead(lead)}
                                            className={`cursor-pointer transition-colors ${
                                                isSelected ? "bg-[#f1f5f9]" : "hover:bg-[#f8fafc]"
                                            }`}
                                        >
                                            <td
                                                className="py-3.5 px-4"
                                                onClick={(e) => toggleSelectRow(lead.id, e)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {}}
                                                    className="rounded border-[#eaedf3] text-[#354f52]"
                                                />
                                            </td>

                                            {/* 1. Contact (Name & Email) */}
                                            <td className="py-3.5 px-4 pr-3">
                                                <div className="font-extrabold text-[#1f2d3d] flex items-center gap-1.5">
                                                    <span>{lead.name}</span>
                                                    {lead.syncStatus === "pending_push" && (
                                                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300" title="Modified locally - waiting to be pushed to HubSpot">
                                                            Pending
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-[#354f52] font-mono mt-0.5">
                                                    {lead.email}
                                                </div>
                                            </td>

                                            {/* 2. Title */}
                                            <td className="py-3.5 px-4">
                                                <span className="text-xs font-semibold text-[#52796f]">
                                                    {lead.title || "—"}
                                                </span>
                                            </td>

                                            {/* 3. Company & Domain */}
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-[#1f2d3d] flex items-center gap-1.5">
                                                    <Building2 className="h-3.5 w-3.5 text-[#6e84a3] shrink-0" />
                                                    <span className="truncate max-w-[160px]">{lead.company || "Not Specified"}</span>
                                                </div>
                                                {lead.companyDomainName && (
                                                    <div className="text-[10px] font-mono text-[#6e84a3] flex items-center gap-1 mt-0.5">
                                                        <Globe className="h-2.5 w-2.5 text-[#95aac9]" />
                                                        <span>{lead.companyDomainName}</span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* 4. LinkedIn (Profile link + status badge) */}
                                            <td className="py-3.5 px-4 text-center">
                                                {lead.linkedinUrl ? (
                                                    <a
                                                        href={lead.linkedinUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="inline-flex items-center gap-1 rounded bg-[#0077b5]/10 px-2 py-0.5 text-[11px] font-bold text-[#0077b5] hover:bg-[#0077b5]/20 transition-colors"
                                                    >
                                                        <span>View</span>
                                                        <ExternalLink className="h-2.5 w-2.5" />
                                                    </a>
                                                ) : (
                                                    <span className="text-[11px] text-[#95aac9] font-medium">—</span>
                                                )}
                                            </td>

                                            {/* 5. Lifecycle Stage */}
                                            <td className="py-3.5 px-4">
                                                <Badge
                                                    variant={
                                                        lead.stage === "Proposal Sent"
                                                            ? "accent"
                                                            : lead.stage === "Meeting Booked"
                                                            ? "success"
                                                            : lead.stage === "In Conversation"
                                                            ? "brand"
                                                            : lead.stage === "Contacted"
                                                            ? "sage"
                                                            : "default"
                                                    }
                                                >
                                                    {lead.lifecycleStage || lead.stage}
                                                </Badge>
                                            </td>

                                            {/* 6. Contact Owner */}
                                            <td className="py-3.5 px-4">
                                                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1f2d3d] bg-[#f8fafc] border border-[#eaedf3] px-2 py-0.5 rounded-md">
                                                    <UserCheck className="h-3 w-3 text-[#354f52]" />
                                                    <span>{lead.contactOwner || "Unassigned"}</span>
                                                </div>
                                            </td>

                                            {/* Channels (HubSpot, Reply, LinkedHelper, Zoho) */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex justify-center">
                                                    <ChannelBadges
                                                        lead={lead}
                                                        onChannelClick={handleChannelBadgeClick}
                                                    />
                                                </div>
                                            </td>

                                            {/* Action Button */}
                                            <td className="py-3.5 px-4 text-right">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDrawerLead(lead);
                                                    }}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-[#eaedf3] bg-white px-2.5 py-1 text-[11px] font-bold text-[#354f52] hover:bg-[#f1f4f8] transition-colors shadow-xs"
                                                >
                                                    Open <ArrowRight className="h-3 w-3" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#eaedf3] bg-[#fafbfc] px-4 py-3 gap-3">
                    <div className="flex items-center gap-3 text-xs text-[#6e84a3]">
                        <span>
                            Showing <strong className="text-[#1f2d3d]">{totalCount > 0 ? startIndex + 1 : 0}</strong> to{" "}
                            <strong className="text-[#1f2d3d]">{Math.min(startIndex + pageSize, totalCount)}</strong> of{" "}
                            <strong className="text-[#1f2d3d]">{totalCount.toLocaleString()}</strong> contacts
                        </span>

                        <div className="flex items-center gap-1.5 border-l border-[#eaedf3] pl-3">
                            <span className="text-[11px] font-medium">Rows per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="rounded border border-[#eaedf3] bg-white px-2 py-0.5 text-xs font-semibold text-[#1f2d3d] outline-none cursor-pointer"
                            >
                                {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="rounded-lg border border-[#eaedf3] bg-white p-1.5 text-[#354f52] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#f1f4f8] transition-colors"
                            title="First Page"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="rounded-lg border border-[#eaedf3] bg-white p-1.5 text-[#354f52] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#f1f4f8] transition-colors"
                            title="Previous Page"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <div className="flex items-center px-2 font-bold text-xs text-[#1f2d3d]">
                            Page {currentPage} of {totalPages}
                        </div>

                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="rounded-lg border border-[#eaedf3] bg-white p-1.5 text-[#354f52] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#f1f4f8] transition-colors"
                            title="Next Page"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="rounded-lg border border-[#eaedf3] bg-white p-1.5 text-[#354f52] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#f1f4f8] transition-colors"
                            title="Last Page"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </Card>

            {/* Slide-over Drawer for lead details */}
            {drawerLead && (
                <LeadDrawer
                    lead={drawerLead}
                    onClose={() => setDrawerLead(null)}
                    onLeadUpdated={(updatedLead) => {
                        setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
                        setDrawerLead(updatedLead);
                        loadLeadsFromDb();
                    }}
                    onPushToChannel={(channelKey, lead) => {
                        setDrawerLead(null);
                        setChannelModalInfo({ channelKey, leads: [lead] });
                    }}
                />
            )}

            {/* Modal for pushing to specific channel */}
            {channelModalInfo && (
                <ChannelPushModal
                    channelKey={channelModalInfo.channelKey}
                    leads={channelModalInfo.leads}
                    onClose={() => setChannelModalInfo(null)}
                    onSuccess={handleChannelSuccess}
                />
            )}

            {/* Modal for importing leads from Apollo */}
            {isApolloImportOpen && (
                <ApolloImportModal
                    onClose={() => setIsApolloImportOpen(false)}
                    onImportSuccess={handleApolloImportSuccess}
                />
            )}
        </PagePlaceholder>
    );
}
