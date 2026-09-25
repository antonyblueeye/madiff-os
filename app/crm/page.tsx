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
    Edit3,
    Filter,
    Calendar,
    Check,
    FileSpreadsheet,
    Upload,
    Download,
    ChevronDown,
} from "lucide-react";
import { BulkEditModal } from "@/components/crm/BulkEditModal";
import { CsvImportModal } from "@/components/crm/CsvImportModal";

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
    const [filterTitle, setFilterTitle] = useState("");
    const [filterLocation, setFilterLocation] = useState("");
    const [filterOwner, setFilterOwner] = useState("All");
    const [filterLifecycleStage, setFilterLifecycleStage] = useState("All");
    const [filterLeadStatus, setFilterLeadStatus] = useState("All");
    const [filterCampaign, setFilterCampaign] = useState("All");
    const [filterChannel, setFilterChannel] = useState("All");
    const [filterConnectionStatus, setFilterConnectionStatus] = useState("All");
    const [filterReplied, setFilterReplied] = useState("All");
    const [filterDateFrom, setFilterDateFrom] = useState("");
    const [filterDateTo, setFilterDateTo] = useState("");

    // Toggle for filter drawer / collapsible panel
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

    // Dynamic dropdown filter options from DB
    const [availableOwners, setAvailableOwners] = useState<string[]>([]);
    const [availableStages, setAvailableStages] = useState<string[]>([]);
    const [availableLeadStatuses, setAvailableLeadStatuses] = useState<string[]>([]);
    const [availableConnectionStatuses, setAvailableConnectionStatuses] = useState<string[]>([]);
    const [availableCampaigns, setAvailableCampaigns] = useState<string[]>([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    // Selection & Modals
    const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
    const [drawerLead, setDrawerLead] = useState<LeadItem | null>(null);
    const [channelModalInfo, setChannelModalInfo] = useState<{
        channelKey: "hubspot" | "reply" | "linkedhelper" | "zoho";
        leads: LeadItem[];
    } | null>(null);
    const [isApolloImportOpen, setIsApolloImportOpen] = useState(false);
    const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
    const [isSyncMenuOpen, setIsSyncMenuOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [pendingPushCount, setPendingPushCount] = useState(0);
    const [isPushingPending, setIsPushingPending] = useState(false);

    // Export currently filtered leads to CSV
    const handleExportCsv = async () => {
        setIsExporting(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.set("search", searchQuery);
            if (filterName) params.set("name", filterName);
            if (filterEmail) params.set("email", filterEmail);
            if (filterCompany) params.set("company", filterCompany);
            if (filterTitle) params.set("title", filterTitle);
            if (filterLocation) params.set("location", filterLocation);
            if (filterOwner && filterOwner !== "All") params.set("owner", filterOwner);
            if (filterLifecycleStage && filterLifecycleStage !== "All") params.set("lifecycleStage", filterLifecycleStage);
            if (filterLeadStatus && filterLeadStatus !== "All") params.set("leadStatus", filterLeadStatus);
            if (filterCampaign && filterCampaign !== "All") params.set("campaign", filterCampaign);
            if (filterChannel && filterChannel !== "All") params.set("channel", filterChannel);
            if (filterConnectionStatus && filterConnectionStatus !== "All") params.set("connectionStatus", filterConnectionStatus);
            if (filterReplied && filterReplied !== "All") params.set("replied", filterReplied);
            if (filterDateFrom) params.set("dateFrom", filterDateFrom);
            if (filterDateTo) params.set("dateTo", filterDateTo);

            const exportUrl = `/api/leads/export-csv?${params.toString()}`;
            const link = document.createElement("a");
            link.href = exportUrl;
            link.setAttribute("download", `crm_leads_export_${new Date().toISOString().split("T")[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setNotification(`Export started! Downloading filtered contacts to CSV...`);
            setTimeout(() => setNotification(null), 4000);
        } catch (err: any) {
            setNotification(`Export failed: ${err.message}`);
        } finally {
            setIsExporting(false);
        }
    };

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
            if (filterTitle) params.set("title", filterTitle);
            if (filterLocation) params.set("location", filterLocation);
            if (filterOwner && filterOwner !== "All") params.set("owner", filterOwner);
            if (filterLifecycleStage && filterLifecycleStage !== "All") params.set("lifecycleStage", filterLifecycleStage);
            if (filterLeadStatus && filterLeadStatus !== "All") params.set("leadStatus", filterLeadStatus);
            if (filterCampaign && filterCampaign !== "All") params.set("campaign", filterCampaign);
            if (filterChannel && filterChannel !== "All") params.set("channel", filterChannel);
            if (filterConnectionStatus && filterConnectionStatus !== "All") params.set("connectionStatus", filterConnectionStatus);
            if (filterReplied && filterReplied !== "All") params.set("replied", filterReplied);
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
                if (data.availableLeadStatuses) setAvailableLeadStatuses(data.availableLeadStatuses);
                if (data.availableConnectionStatuses) setAvailableConnectionStatuses(data.availableConnectionStatuses);
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
        filterTitle,
        filterLocation,
        filterOwner,
        filterLifecycleStage,
        filterLeadStatus,
        filterCampaign,
        filterChannel,
        filterConnectionStatus,
        filterReplied,
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

    const activeFilterCount = [
        searchQuery,
        filterName,
        filterEmail,
        filterCompany,
        filterTitle,
        filterLocation,
        filterOwner !== "All" ? filterOwner : null,
        filterLifecycleStage !== "All" ? filterLifecycleStage : null,
        filterLeadStatus !== "All" ? filterLeadStatus : null,
        filterCampaign !== "All" ? filterCampaign : null,
        filterChannel !== "All" ? filterChannel : null,
        filterConnectionStatus !== "All" ? filterConnectionStatus : null,
        filterReplied !== "All" ? filterReplied : null,
        filterDateFrom,
        filterDateTo,
    ].filter(Boolean).length;

    const hasActiveFilters = activeFilterCount > 0;

    const resetFilters = () => {
        setSearchQuery("");
        setFilterName("");
        setFilterEmail("");
        setFilterCompany("");
        setFilterTitle("");
        setFilterLocation("");
        setFilterOwner("All");
        setFilterLifecycleStage("All");
        setFilterLeadStatus("All");
        setFilterCampaign("All");
        setFilterChannel("All");
        setFilterConnectionStatus("All");
        setFilterReplied("All");
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
        if (channelKey === "linkedhelper") return; // Inbound only via webhook
        setChannelModalInfo({
            channelKey: channelKey as "hubspot" | "reply",
            leads: [lead],
        });
    };

    const handleBulkPush = (channelKey: "hubspot" | "reply") => {
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

    const handleApolloImportSuccess = (count?: number, message?: string) => {
        setIsApolloImportOpen(false);
        loadLeadsFromDb();
        setNotification(message || `Imported ${count || "new"} contacts from Apollo.io into CRM!`);
        setTimeout(() => setNotification(null), 5000);
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

                    {/* Sync Integrations Dropdown Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setIsSyncMenuOpen((prev) => !prev)}
                            className="flex items-center gap-1.5 rounded-lg border border-[#eaedf3] bg-white px-3 py-2 text-xs font-bold text-[#354f52] shadow-xs hover:bg-[#f8fafc] transition-colors"
                            title="Synchronize data from connected channels"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 text-[#354f52] ${isSyncing || isSyncingReply ? "animate-spin" : ""}`} />
                            <span>
                                {isSyncing
                                    ? "Syncing HubSpot..."
                                    : isSyncingReply
                                    ? "Syncing Reply..."
                                    : "Sync Gateways"}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 text-[#6e84a3]" />
                        </button>

                        {isSyncMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setIsSyncMenuOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-1.5 z-30 w-72 rounded-xl border border-[#eaedf3] bg-white p-2 shadow-xl space-y-1 animate-in fade-in">
                                    <div className="px-2 py-1 text-[10px] font-bold uppercase text-[#6e84a3]">
                                        HubSpot CRM (Bi-directional)
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsSyncMenuOpen(false);
                                            syncHubSpotToDb(false);
                                        }}
                                        disabled={isSyncing}
                                        className="w-full flex items-start gap-2.5 rounded-lg p-2 text-left hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw className="h-4 w-4 text-[#354f52] mt-0.5 shrink-0" />
                                        <div>
                                            <div className="text-xs font-bold text-[#1f2d3d]">Quick Incremental Sync</div>
                                            <div className="text-[11px] text-[#6e84a3]">Updates contacts modified in HubSpot since last check</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsSyncMenuOpen(false);
                                            syncHubSpotToDb(true);
                                        }}
                                        disabled={isSyncing}
                                        className="w-full flex items-start gap-2.5 rounded-lg p-2 text-left hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
                                    >
                                        <Database className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                        <div>
                                            <div className="text-xs font-bold text-[#1f2d3d]">Full HubSpot Resync</div>
                                            <div className="text-[11px] text-[#6e84a3]">Downloads all 40,000+ contacts from scratch</div>
                                        </div>
                                    </button>

                                    <div className="h-px bg-[#eaedf3] my-1" />

                                    <div className="px-2 py-1 text-[10px] font-bold uppercase text-[#6e84a3]">
                                        Reply.io Outreach
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsSyncMenuOpen(false);
                                            syncReplyToDb();
                                        }}
                                        disabled={isSyncingReply}
                                        className="w-full flex items-start gap-2.5 rounded-lg p-2 text-left hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                                        <div>
                                            <div className="text-xs font-bold text-[#1f2d3d]">Sync Reply.io Inboxes</div>
                                            <div className="text-[11px] text-[#6e84a3]">Pulls campaigns, email threads & reply events</div>
                                        </div>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* CSV Actions Group (Import + Export) */}
                    <div className="flex items-center rounded-lg border border-[#eaedf3] bg-white shadow-xs overflow-hidden">
                        <button
                            onClick={() => setIsCsvImportOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#354f52] hover:bg-[#f8fafc] transition-colors"
                            title="Upload a CSV file and map columns to CRM fields"
                        >
                            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Import CSV</span>
                        </button>
                        <span className="h-4 w-px bg-[#eaedf3]" />
                        <button
                            onClick={handleExportCsv}
                            disabled={isExporting || totalCount === 0}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#354f52] hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
                            title={`Export currently filtered contacts (${totalCount.toLocaleString()} leads) to CSV`}
                        >
                            <Download className={`h-3.5 w-3.5 text-[#354f52] ${isExporting ? "animate-bounce" : ""}`} />
                            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
                        </button>
                    </div>

                    {/* Apollo Sourcing */}
                    <button
                        onClick={() => setIsApolloImportOpen(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-[#354f52] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#2f3e46] transition-colors"
                        title="Search and import verified B2B decision makers via Apollo API"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Import from Apollo</span>
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

                    {/* Bulk Action Buttons (Bulk Edit + Bulk Push) */}
                    {selectedLeadIds.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 bg-[#f8fafc] border border-[#eaedf3] px-3.5 py-1.5 rounded-xl shadow-xs animate-in fade-in">
                            <span className="text-xs font-bold text-[#1f2d3d]">
                                {selectedLeadIds.length} Selected
                            </span>
                            <span className="text-[#eaedf3]">|</span>

                            {/* Bulk Edit Button */}
                            <button
                                onClick={() => setIsBulkEditOpen(true)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#354f52] px-3 py-1 text-xs font-bold text-white hover:bg-[#2f3e46] transition-colors shadow-xs"
                            >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>Bulk Edit Properties</span>
                            </button>

                            <span className="text-[#eaedf3]">|</span>

                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-[#6e84a3]">Push bulk:</span>
                                <button
                                    onClick={() => handleBulkPush("reply")}
                                    className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-[#354f52] border border-[#eaedf3] hover:bg-[#354f52] hover:text-white transition-colors"
                                >
                                    Reply.io
                                </button>
                                <button
                                    onClick={() => handleBulkPush("hubspot")}
                                    className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-[#354f52] border border-[#eaedf3] hover:bg-[#354f52] hover:text-white transition-colors"
                                >
                                    HubSpot
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filter Trigger & Reset Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#f1f4f8]">
                    <div className="flex items-center gap-2">
                        {/* Toggle Advanced Filters Button */}
                        <button
                            onClick={() => setIsFilterPanelOpen((prev) => !prev)}
                            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                                isFilterPanelOpen || hasActiveFilters
                                    ? "bg-[#354f52] text-white shadow-xs"
                                    : "border border-[#eaedf3] bg-white text-[#1f2d3d] hover:bg-[#f8fafc]"
                            }`}
                        >
                            <Filter className="h-3.5 w-3.5" />
                            <span>Filters</span>
                            {activeFilterCount > 0 && (
                                <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                                    isFilterPanelOpen || hasActiveFilters ? "bg-white text-[#354f52]" : "bg-[#354f52] text-white"
                                }`}>
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {/* Reset Filters Button */}
                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                className="flex items-center gap-1 text-[11px] font-bold text-[#e63946] hover:text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl transition-colors"
                            >
                                <X className="h-3 w-3" /> Clear All Filters
                            </button>
                        )}
                    </div>

                    <span className="text-xs text-[#95aac9] font-medium">
                        Showing <strong>{totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong>–
                        <strong>{Math.min(currentPage * pageSize, totalCount)}</strong> of <strong>{totalCount.toLocaleString()}</strong> results
                    </span>
                </div>

                {/* Expandable Comprehensive Filter Panel */}
                {isFilterPanelOpen && (
                    <div className="rounded-xl border border-[#eaedf3] bg-[#fafbfc] p-4.5 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between border-b border-[#eaedf3] pb-2">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[#1f2d3d] flex items-center gap-2">
                                <Filter className="h-3.5 w-3.5 text-[#354f52]" />
                                <span>Filter Contacts by Field</span>
                            </span>
                            <button
                                onClick={() => setIsFilterPanelOpen(false)}
                                className="text-xs font-semibold text-[#6e84a3] hover:text-[#1f2d3d]"
                            >
                                Close Panel ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                            {/* 1. Name */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Full Name</label>
                                <input
                                    value={filterName}
                                    onChange={(e) => {
                                        setFilterName(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Filter by name..."
                                    className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52]"
                                />
                            </div>

                            {/* 2. Email */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Email Address</label>
                                <input
                                    value={filterEmail}
                                    onChange={(e) => {
                                        setFilterEmail(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Filter by email..."
                                    className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52]"
                                />
                            </div>

                            {/* 3. Company */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Company</label>
                                <input
                                    value={filterCompany}
                                    onChange={(e) => {
                                        setFilterCompany(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Filter by company..."
                                    className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52]"
                                />
                            </div>

                            {/* 4. Title */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Job Title</label>
                                <input
                                    value={filterTitle}
                                    onChange={(e) => {
                                        setFilterTitle(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="e.g. CTO, Founder, VP..."
                                    className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52]"
                                />
                            </div>

                            {/* 5. Location */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Location / City</label>
                                <input
                                    value={filterLocation}
                                    onChange={(e) => {
                                        setFilterLocation(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="e.g. London, Austin, Warsaw..."
                                    className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52]"
                                />
                            </div>

                            {/* 6. Contact Owner */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Contact Owner</label>
                                <select
                                    value={filterOwner}
                                    onChange={(e) => {
                                        setFilterOwner(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none cursor-pointer focus:border-[#354f52]"
                                >
                                    <option value="All">All Owners</option>
                                    {availableOwners.map((owner) => (
                                        <option key={owner} value={owner}>
                                            {owner}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 7. Campaign */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Campaign / Sequence</label>
                                <select
                                    value={filterCampaign}
                                    onChange={(e) => {
                                        setFilterCampaign(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none cursor-pointer focus:border-[#354f52]"
                                >
                                    <option value="All">All Campaigns</option>
                                    {availableCampaigns.map((camp) => (
                                        <option key={camp} value={camp}>
                                            {camp}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 8. Lifecycle Stage */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Lifecycle Stage</label>
                                <select
                                    value={filterLifecycleStage}
                                    onChange={(e) => {
                                        setFilterLifecycleStage(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none cursor-pointer focus:border-[#354f52] capitalize"
                                >
                                    <option value="All">All Stages</option>
                                    {availableStages.map((stage) => (
                                        <option key={stage} value={stage}>
                                            {stage}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 9. Lead Status */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Lead Status</label>
                                <select
                                    value={filterLeadStatus}
                                    onChange={(e) => {
                                        setFilterLeadStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none cursor-pointer focus:border-[#354f52]"
                                >
                                    <option value="All">All Lead Statuses</option>
                                    {availableLeadStatuses.map((st) => (
                                        <option key={st} value={st}>
                                            {st}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 10. LinkedIn Connection */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-[#6e84a3]">LinkedIn Connection</label>
                                <select
                                    value={filterConnectionStatus}
                                    onChange={(e) => {
                                        setFilterConnectionStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none cursor-pointer focus:border-[#354f52]"
                                >
                                    <option value="All">All Connection Statuses</option>
                                    <option value="CONNECTED">CONNECTED (1st Degree)</option>
                                    <option value="PENDING">PENDING</option>
                                    <option value="Not Connected">Not Connected</option>
                                </select>
                            </div>

                            {/* 11. Replied Status */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Replied to Outreach</label>
                                <select
                                    value={filterReplied}
                                    onChange={(e) => {
                                        setFilterReplied(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none cursor-pointer focus:border-[#354f52]"
                                >
                                    <option value="All">All (Replied & Not)</option>
                                    <option value="yes">Replied (Yes)</option>
                                    <option value="no">Not Replied (No)</option>
                                </select>
                            </div>

                            {/* 12. Channel filter */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Active Channel</label>
                                <select
                                    value={filterChannel}
                                    onChange={(e) => {
                                        setFilterChannel(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none cursor-pointer focus:border-[#354f52]"
                                >
                                    <option value="All">All Channels</option>
                                    <option value="apollo">Apollo.io (Imported Sourced)</option>
                                    <option value="hubspot">HubSpot CRM Active</option>
                                    <option value="reply">Reply.io Enrolled</option>
                                    <option value="linkedhelper">LinkedHelper Active</option>
                                    <option value="zoho">Zoho Campaigns Subscribed</option>
                                </select>
                            </div>
                        </div>

                        {/* Date Range Section: Created Date From - To */}
                        <div className="border-t border-[#eaedf3] pt-3.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3] block mb-2 flex items-center gap-1.5">
                                <Calendar className="h-3 w-3 text-[#354f52]" />
                                <span>Created Date Range (From – To)</span>
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-semibold text-[#6e84a3]">From Date</label>
                                    <input
                                        type="date"
                                        value={filterDateFrom}
                                        onChange={(e) => {
                                            setFilterDateFrom(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-semibold text-[#6e84a3]">To Date</label>
                                    <input
                                        type="date"
                                        value={filterDateTo}
                                        onChange={(e) => {
                                            setFilterDateTo(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52]"
                                    />
                                </div>
                                <div className="flex items-end">
                                    {(filterDateFrom || filterDateTo) && (
                                        <button
                                            onClick={() => {
                                                setFilterDateFrom("");
                                                setFilterDateTo("");
                                                setCurrentPage(1);
                                            }}
                                            className="text-[11px] font-bold text-rose-600 hover:underline py-2"
                                        >
                                            Reset Date Range
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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

            {/* Modal for importing leads from CSV */}
            {isCsvImportOpen && (
                <CsvImportModal
                    availableCampaigns={availableCampaigns}
                    availableOwners={availableOwners}
                    onClose={() => setIsCsvImportOpen(false)}
                    onImportSuccess={(count, msg) => {
                        setIsCsvImportOpen(false);
                        setNotification(msg);
                        loadLeadsFromDb();
                        setTimeout(() => setNotification(null), 5000);
                    }}
                />
            )}

            {/* Modal for bulk editing leads */}
            {isBulkEditOpen && (
                <BulkEditModal
                    selectedLeadIds={selectedLeadIds}
                    selectedLeads={leads.filter((l) => selectedLeadIds.includes(l.id))}
                    availableOwners={availableOwners}
                    availableCampaigns={availableCampaigns}
                    availableStages={availableStages}
                    availableLeadStatuses={availableLeadStatuses}
                    onClose={() => setIsBulkEditOpen(false)}
                    onSuccess={(count, msg) => {
                        setNotification(msg);
                        setSelectedLeadIds([]);
                        loadLeadsFromDb();
                        setTimeout(() => setNotification(null), 5000);
                    }}
                />
            )}
        </PagePlaceholder>
    );
}
