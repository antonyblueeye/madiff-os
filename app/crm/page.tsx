"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { crmLeadsData, LeadItem } from "@/lib/mock-data";
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
    Filter,
    Plus,
    CheckCircle2,
    Building2,
    MapPin,
    ArrowRight,
    RefreshCw,
    Calendar,
    UserCheck,
    Megaphone,
    Activity,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    X,
} from "lucide-react";

const ITEMS_PER_PAGE_OPTIONS = [15, 25, 50, 100];

export default function CRMPage() {
    const [leads, setLeads] = useState<LeadItem[]>(crmLeadsData);
    const [isLoadingHubspot, setIsLoadingHubspot] = useState(false);
    const [isHubspotLive, setIsHubspotLive] = useState(false);
    
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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    // Selection & Modals
    const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
    const [drawerLead, setDrawerLead] = useState<LeadItem | null>(null);
    const [channelModalInfo, setChannelModalInfo] = useState<{
        channelKey: "apollo" | "hubspot" | "reply" | "linkedhelper" | "zoho";
        leads: LeadItem[];
    } | null>(null);
    const [isApolloImportOpen, setIsApolloImportOpen] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    // Fetch live contacts from HubSpot on mount or when requested
    const fetchHubSpotLeads = async () => {
        setIsLoadingHubspot(true);
        try {
            const res = await fetch("/api/hubspot/contacts?all=true");
            const data = await res.json();
            if (res.ok && data.leads && data.leads.length > 0) {
                setLeads(data.leads);
                setIsHubspotLive(true);
                setNotification(`Loaded all ${data.leads.length} live contacts directly from your connected HubSpot account!`);
                setTimeout(() => setNotification(null), 4000);
            } else {
                setNotification(data.error || "Could not fetch HubSpot leads");
            }
        } catch (err: any) {
            setNotification(`HubSpot sync error: ${err.message}`);
        } finally {
            setIsLoadingHubspot(false);
        }
    };

    useEffect(() => {
        fetchHubSpotLeads();
    }, []);

    // Unique owners list for dropdown
    const availableOwners = useMemo(() => {
        const owners = new Set<string>();
        leads.forEach((l) => {
            if (l.contactOwner && l.contactOwner !== "Unassigned") {
                owners.add(l.contactOwner);
            }
        });
        return Array.from(owners).sort();
    }, [leads]);

    // Unique campaigns list for dropdown
    const availableCampaigns = useMemo(() => {
        const campaigns = new Set<string>();
        leads.forEach((l) => {
            if (l.campaign && l.campaign !== "Direct / Inbound") {
                campaigns.add(l.campaign);
            }
        });
        return Array.from(campaigns).sort();
    }, [leads]);

    // Unique lifecycle stages list for dropdown
    const availableLifecycleStages = useMemo(() => {
        const stages = new Set<string>();
        leads.forEach((l) => {
            if (l.lifecycleStage) {
                stages.add(l.lifecycleStage);
            } else if (l.stage) {
                stages.add(l.stage);
            }
        });
        return Array.from(stages).sort();
    }, [leads]);

    // Check if any filters are active
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

    // Filter leads according to user criteria
    const filteredLeads = useMemo(() => {
        return leads.filter((lead) => {
            // General quick search
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchGeneral =
                    lead.name.toLowerCase().includes(q) ||
                    lead.email.toLowerCase().includes(q) ||
                    lead.company.toLowerCase().includes(q) ||
                    (lead.title && lead.title.toLowerCase().includes(q)) ||
                    (lead.contactOwner && lead.contactOwner.toLowerCase().includes(q)) ||
                    (lead.campaign && lead.campaign.toLowerCase().includes(q));
                if (!matchGeneral) return false;
            }

            // Name filter
            if (filterName && !lead.name.toLowerCase().includes(filterName.toLowerCase())) {
                return false;
            }

            // Email filter
            if (filterEmail && !lead.email.toLowerCase().includes(filterEmail.toLowerCase())) {
                return false;
            }

            // Company filter
            if (filterCompany && !lead.company.toLowerCase().includes(filterCompany.toLowerCase())) {
                return false;
            }

            // Contact Owner filter
            if (filterOwner !== "All") {
                if (lead.contactOwner !== filterOwner) return false;
            }

            // Lifecycle Stage filter
            if (filterLifecycleStage !== "All") {
                const currentStage = (lead.lifecycleStage || lead.stage || "").toLowerCase();
                if (currentStage !== filterLifecycleStage.toLowerCase()) return false;
            }

            // Campaign filter
            if (filterCampaign !== "All") {
                if (lead.campaign !== filterCampaign) return false;
            }

            // Channel filter
            if (filterChannel !== "All") {
                if (filterChannel === "hubspot" && !lead.channels.hubspot?.active) return false;
                if (filterChannel === "apollo" && !lead.channels.apollo?.active) return false;
                if (filterChannel === "reply" && !lead.channels.reply?.active) return false;
                if (filterChannel === "linkedhelper" && !lead.channels.linkedhelper?.active) return false;
                if (filterChannel === "zoho" && !lead.channels.zoho?.active) return false;
            }

            // Date Created filter (From / To)
            if (filterDateFrom && lead.createdDate) {
                if (lead.createdDate < filterDateFrom) return false;
            }
            if (filterDateTo && lead.createdDate) {
                if (lead.createdDate > filterDateTo) return false;
            }

            return true;
        });
    }, [
        leads,
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

    // Reset to page 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filteredLeads.length]);

    // Pagination calculations
    const totalItems = filteredLeads.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedLeads = useMemo(() => {
        return filteredLeads.slice(startIndex, startIndex + pageSize);
    }, [filteredLeads, startIndex, pageSize]);

    // Row selection logic
    const toggleSelectRow = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedLeadIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const pageIds = paginatedLeads.map((l) => l.id);
        const allPageSelected = pageIds.every((id) => selectedLeadIds.includes(id));
        if (allPageSelected) {
            setSelectedLeadIds((prev) => prev.filter((id) => !pageIds.includes(id)));
        } else {
            setSelectedLeadIds((prev) => Array.from(new Set([...prev, ...pageIds])));
        }
    };

    // Handle single channel badge click
    const handleChannelBadgeClick = (
        channelKey: "apollo" | "hubspot" | "reply" | "linkedhelper" | "zoho",
        lead: LeadItem
    ) => {
        setChannelModalInfo({
            channelKey,
            leads: [lead],
        });
    };

    // Handle bulk push click
    const handleBulkPush = (channelKey: "apollo" | "hubspot" | "reply" | "linkedhelper" | "zoho") => {
        const selectedList = leads.filter((l) => selectedLeadIds.includes(l.id));
        if (selectedList.length === 0) return;
        setChannelModalInfo({
            channelKey,
            leads: selectedList,
        });
    };

    // Callback on modal success
    const handleChannelSuccess = (channelKey: string, leadIds: string[], details: string) => {
        setLeads((prev) =>
            prev.map((l) => {
                if (leadIds.includes(l.id)) {
                    return {
                        ...l,
                        channels: {
                            ...l.channels,
                            [channelKey]: {
                                active: true,
                                statusText: "Active / Queued",
                                details,
                                dateAdded: "Today",
                            },
                        },
                        timeline: [
                            {
                                date: "Today",
                                channel: channelKey.toUpperCase(),
                                event: `Dispatched: ${details}`,
                            },
                            ...l.timeline,
                        ],
                    };
                }
                return l;
            })
        );
        setChannelModalInfo(null);
        setSelectedLeadIds([]);
        setNotification(
            `Successfully dispatched ${leadIds.length} contact(s) to ${channelKey.toUpperCase()} (${details})`
        );
        setTimeout(() => setNotification(null), 4000);
    };

    // Callback when leads imported from Apollo
    const handleApolloImportSuccess = (imported: LeadItem[]) => {
        setLeads((prev) => [...imported, ...prev]);
        setIsApolloImportOpen(false);
        setNotification(`Imported ${imported.length} verified decision-makers from Apollo.io into CRM!`);
        setTimeout(() => setNotification(null), 4000);
    };

    return (
        <PagePlaceholder
            title="Lead CRM & Omnichannel Control"
            description="Universal contact repository with real-time sync across Apollo, HubSpot, Reply.io, LinkedHelper, and Zoho."
            icon={Users}
            tag={isHubspotLive ? "HubSpot Live Connected" : `${leads.length} Leads in DB`}
            action={
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchHubSpotLeads}
                        disabled={isLoadingHubspot}
                        className="flex items-center gap-1.5 rounded-lg border border-[#eaedf3] bg-white px-3.5 py-2 text-xs font-bold text-[#354f52] shadow-sm hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 text-[#354f52] ${isLoadingHubspot ? "animate-spin" : ""}`} />
                        {isLoadingHubspot ? "Syncing..." : "Sync HubSpot"}
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
                                onChange={(e) => setSearchQuery(e.target.value)}
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
                            onChange={(e) => setFilterName(e.target.value)}
                            placeholder="Filter name..."
                            className="w-full rounded-md border border-[#eaedf3] bg-[#f8fafc] px-2.5 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                        />
                    </div>

                    {/* Email Filter */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Email</label>
                        <input
                            value={filterEmail}
                            onChange={(e) => setFilterEmail(e.target.value)}
                            placeholder="Filter email..."
                            className="w-full rounded-md border border-[#eaedf3] bg-[#f8fafc] px-2.5 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                        />
                    </div>

                    {/* Company Filter */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Company</label>
                        <input
                            value={filterCompany}
                            onChange={(e) => setFilterCompany(e.target.value)}
                            placeholder="Filter company..."
                            className="w-full rounded-md border border-[#eaedf3] bg-[#f8fafc] px-2.5 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                        />
                    </div>

                    {/* Contact Owner Filter */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Contact Owner</label>
                        <select
                            value={filterOwner}
                            onChange={(e) => setFilterOwner(e.target.value)}
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
                            onChange={(e) => setFilterLifecycleStage(e.target.value)}
                            className="w-full rounded-md border border-[#eaedf3] bg-[#f8fafc] px-2 py-1.5 text-xs text-[#1f2d3d] outline-none cursor-pointer focus:border-[#354f52] focus:bg-white capitalize"
                        >
                            <option value="All">All Stages</option>
                            {availableLifecycleStages.map((stage) => (
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
                            onChange={(e) => setFilterCampaign(e.target.value)}
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

                    {/* Date Created Filter (From - To) */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-[#6e84a3]">Created Date (From)</label>
                        <input
                            type="date"
                            value={filterDateFrom}
                            onChange={(e) => setFilterDateFrom(e.target.value)}
                            className="w-full rounded-md border border-[#eaedf3] bg-[#f8fafc] px-2 py-1 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                        />
                    </div>
                </div>
            </div>

            {/* Leads Table with Clean Columns (Deal/Value completely removed) */}
            <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#eaedf3] bg-[#fafbfc] text-[#6e84a3] font-bold uppercase text-[10px]">
                                <th className="py-3.5 px-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={
                                            paginatedLeads.length > 0 &&
                                            paginatedLeads.every((l) => selectedLeadIds.includes(l.id))
                                        }
                                        onChange={toggleSelectAll}
                                        className="rounded border-[#eaedf3] text-[#354f52]"
                                    />
                                </th>
                                <th className="py-3.5 px-4">Contact & Email</th>
                                <th className="py-3.5 px-4">Company & Location</th>
                                <th className="py-3.5 px-4">Contact Owner</th>
                                <th className="py-3.5 px-4">Lifecycle Stage</th>
                                <th className="py-3.5 px-4">Campaign</th>
                                <th className="py-3.5 px-4">Created Date</th>
                                <th className="py-3.5 px-4 text-center">Channels</th>
                                <th className="py-3.5 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eaedf3]">
                            {paginatedLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-xs text-[#95aac9]">
                                        No contacts match your active filters. Try resetting the criteria.
                                    </td>
                                </tr>
                            ) : (
                                paginatedLeads.map((lead) => {
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

                                            {/* Contact & Email */}
                                            <td className="py-3.5 px-4 pr-3">
                                                <div className="font-extrabold text-[#1f2d3d] flex items-center gap-1.5">
                                                    {lead.name}
                                                </div>
                                                <div className="text-[11px] text-[#52796f] font-semibold">
                                                    {lead.title}
                                                </div>
                                                <div className="text-[11px] text-[#354f52] font-mono mt-0.5">
                                                    {lead.email}
                                                </div>
                                            </td>

                                            {/* Company & Location */}
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-[#1f2d3d] flex items-center gap-1">
                                                    <Building2 className="h-3 w-3 text-[#6e84a3]" />
                                                    <span>{lead.company || "Not Specified"}</span>
                                                </div>
                                                <div className="text-[11px] text-[#6e84a3] flex items-center gap-1 mt-0.5">
                                                    <MapPin className="h-3 w-3 text-[#95aac9]" />
                                                    <span>{lead.location}</span>
                                                </div>
                                            </td>

                                            {/* Contact Owner */}
                                            <td className="py-3.5 px-4">
                                                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1f2d3d] bg-[#f8fafc] border border-[#eaedf3] px-2 py-0.5 rounded-md">
                                                    <UserCheck className="h-3 w-3 text-[#354f52]" />
                                                    <span>{lead.contactOwner || "Unassigned"}</span>
                                                </div>
                                            </td>

                                            {/* Lifecycle Stage */}
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

                                            {/* Campaign */}
                                            <td className="py-3.5 px-4">
                                                <div className="text-[11px] font-semibold text-[#475569] truncate max-w-[140px]" title={lead.campaign}>
                                                    {lead.campaign || "Direct / Inbound"}
                                                </div>
                                            </td>

                                            {/* Created Date */}
                                            <td className="py-3.5 px-4 font-mono text-[11px] text-[#6e84a3]">
                                                {lead.createdDate || "—"}
                                            </td>

                                            {/* Channels */}
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
                            Showing <strong className="text-[#1f2d3d]">{totalItems > 0 ? startIndex + 1 : 0}</strong> to{" "}
                            <strong className="text-[#1f2d3d]">{Math.min(startIndex + pageSize, totalItems)}</strong> of{" "}
                            <strong className="text-[#1f2d3d]">{totalItems}</strong> contacts
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
