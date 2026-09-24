"use client";

import { useState } from "react";
import Image from "next/image";
import { LeadItem } from "@/lib/mock-data";
import {
    X,
    Building2,
    MapPin,
    Mail,
    Phone,
    Calendar,
    UserCheck,
    Megaphone,
    FileText,
    CheckCircle2,
    Plus,
    Activity,
    Send,
    Edit3,
    Save,
    RotateCcw,
    Globe,
    ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface LeadDrawerProps {
    lead: LeadItem;
    onClose: () => void;
    onLeadUpdated?: (updatedLead: LeadItem) => void;
    onPushToChannel: (channelKey: "apollo" | "hubspot" | "reply" | "linkedhelper" | "zoho", lead: LeadItem) => void;
}

const channelList = [
    { key: "apollo", name: "Apollo.io", logo: "/apollo.jpg" },
    { key: "hubspot", name: "HubSpot CRM", logo: "/hubspot.png" },
    { key: "reply", name: "Reply.io", logo: "/reply.png" },
    { key: "linkedhelper", name: "LinkedHelper", logo: "/linkedhelper.png" },
    { key: "zoho", name: "Zoho Campaigns", logo: "/zoho_campaigns.webp" },
] as const;

export function LeadDrawer({ lead, onClose, onLeadUpdated, onPushToChannel }: LeadDrawerProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Editable form state
    const [formData, setFormData] = useState({
        name: lead.name || "",
        title: lead.title || "",
        company: lead.company || "",
        companyDomainName: lead.companyDomainName || "",
        email: lead.email || "",
        phone: lead.phone || "",
        location: lead.location || "",
        linkedinUrl: lead.linkedinUrl || "",
        lifecycleStage: lead.lifecycleStage || lead.stage || "lead",
        leadStatus: lead.leadStatus || "NEW",
        contactOwner: lead.contactOwner || "Unassigned",
        campaign: lead.campaign || "",
    });

    const [newNote, setNewNote] = useState("");
    const [notes, setNotes] = useState<string[]>(lead.notes || []);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError(null);
        try {
            const res = await fetch(`/api/leads/${lead.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    title: formData.title,
                    company: formData.company,
                    companyDomainName: formData.companyDomainName,
                    email: formData.email,
                    phone: formData.phone,
                    location: formData.location,
                    linkedinUrl: formData.linkedinUrl,
                    lifecycleStage: formData.lifecycleStage,
                    leadStatus: formData.leadStatus,
                    contactOwner: formData.contactOwner,
                    campaign: formData.campaign,
                    notes: notes,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to update lead");
            }

            const data = await res.json();
            const updated: LeadItem = {
                ...lead,
                name: formData.name,
                title: formData.title,
                company: formData.company,
                companyDomainName: formData.companyDomainName,
                email: formData.email,
                phone: formData.phone,
                location: formData.location,
                linkedinUrl: formData.linkedinUrl,
                lifecycleStage: formData.lifecycleStage,
                leadStatus: formData.leadStatus,
                contactOwner: formData.contactOwner,
                campaign: formData.campaign,
                notes: notes,
                syncStatus: data.lead?.sync_status || "pending_push",
                dirtyFields: data.lead?.dirty_fields || ["contact_name"],
            };

            if (onLeadUpdated) {
                onLeadUpdated(updated);
            }
            setIsEditing(false);
        } catch (err: any) {
            setSaveError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setFormData({
            name: lead.name || "",
            title: lead.title || "",
            company: lead.company || "",
            companyDomainName: lead.companyDomainName || "",
            email: lead.email || "",
            phone: lead.phone || "",
            location: lead.location || "",
            linkedinUrl: lead.linkedinUrl || "",
            lifecycleStage: lead.lifecycleStage || lead.stage || "lead",
            leadStatus: lead.leadStatus || "NEW",
            contactOwner: lead.contactOwner || "Unassigned",
            campaign: lead.campaign || "",
        });
        setIsEditing(false);
        setSaveError(null);
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        const updatedNotes = [newNote.trim(), ...notes];
        setNotes(updatedNotes);
        setNewNote("");

        // Auto persist new note
        try {
            await fetch(`/api/leads/${lead.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes: updatedNotes }),
            });
            if (onLeadUpdated) {
                onLeadUpdated({ ...lead, notes: updatedNotes, syncStatus: "pending_push" });
            }
        } catch (err) {
            console.error("Could not save note:", err);
        }
    };

    return (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl border-l border-[#eaedf3] animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#eaedf3] px-6 py-4 bg-[#f8fafc]">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#354f52] text-sm font-bold text-white shadow-sm">
                        {formData.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="text-base font-extrabold text-[#1f2d3d] border border-[#eaedf3] rounded px-2 py-0.5 outline-none focus:border-[#354f52]"
                                    placeholder="Contact Full Name"
                                />
                            ) : (
                                <h2 className="text-base font-extrabold text-[#1f2d3d]">{formData.name}</h2>
                            )}
                            {lead.syncStatus === "pending_push" && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                    Pending Push
                                </span>
                            )}
                        </div>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="mt-1 text-xs font-semibold text-[#52796f] border border-[#eaedf3] rounded px-2 py-0.5 outline-none focus:border-[#354f52] w-full"
                                placeholder="Job Title"
                            />
                        ) : (
                            <p className="text-xs font-semibold text-[#52796f]">{formData.title || "No Title"}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#eaedf3] bg-white px-2.5 py-1.5 text-xs font-bold text-[#6e84a3] hover:bg-[#f1f5f9] transition-colors"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Cancel</span>
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#354f52] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#2f3e46] transition-colors shadow-xs"
                            >
                                <Save className="h-3.5 w-3.5" />
                                <span>{isSaving ? "Saving..." : "Save"}</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs font-bold text-[#354f52] hover:bg-[#354f52] hover:text-white transition-colors shadow-xs"
                        >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Edit Lead</span>
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-[#95aac9] hover:bg-[#e2e8f0] hover:text-[#1f2d3d]"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {saveError && (
                <div className="bg-red-50 border-b border-red-200 px-6 py-2 text-xs font-semibold text-red-700">
                    Error saving lead: {saveError}
                </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* 1. Core Profile & Contact Details (Name, Email, Company, Location) */}
                <div className="rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-[#1f2d3d] w-full max-w-[320px]">
                            <Building2 className="h-4 w-4 text-[#354f52] shrink-0" />
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="border border-[#eaedf3] rounded px-2 py-0.5 text-xs font-bold text-[#1f2d3d] w-full outline-none focus:border-[#354f52]"
                                    placeholder="Company Name"
                                />
                            ) : (
                                <span>{formData.company || "Not Specified"}</span>
                            )}
                        </div>
                        <span className="text-[11px] font-semibold text-[#6e84a3] bg-white border border-[#eaedf3] px-2.5 py-0.5 rounded-full">
                            {lead.headcount || "Verified"}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs text-[#6e84a3] pt-1">
                        <div className="flex items-center gap-1.5 truncate">
                            <Mail className="h-3.5 w-3.5 text-[#354f52] shrink-0" />
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="border border-[#eaedf3] rounded px-1.5 py-0.5 text-xs font-mono text-[#1f2d3d] w-full outline-none focus:border-[#354f52]"
                                    placeholder="Email"
                                />
                            ) : (
                                <span className="font-mono text-[#1f2d3d] truncate select-all">{formData.email}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-[#95aac9] shrink-0" />
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="border border-[#eaedf3] rounded px-1.5 py-0.5 text-xs text-[#1f2d3d] w-full outline-none focus:border-[#354f52]"
                                    placeholder="Location (e.g. Warsaw, Poland)"
                                />
                            ) : (
                                <span className="text-[#1f2d3d] truncate">{formData.location || "Global / Remote"}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-[#95aac9] shrink-0" />
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="border border-[#eaedf3] rounded px-1.5 py-0.5 text-xs font-mono text-[#1f2d3d] w-full outline-none focus:border-[#354f52]"
                                    placeholder="Phone number"
                                />
                            ) : (
                                <span className="font-mono text-[#1f2d3d]">{formData.phone || "—"}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5">
                            <ExternalLink className="h-3.5 w-3.5 text-[#0077b5] shrink-0" />
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.linkedinUrl}
                                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                    className="border border-[#eaedf3] rounded px-1.5 py-0.5 text-xs font-mono text-[#1f2d3d] w-full outline-none focus:border-[#354f52]"
                                    placeholder="LinkedIn URL"
                                />
                            ) : formData.linkedinUrl ? (
                                <a
                                    href={formData.linkedinUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#0077b5] hover:underline truncate"
                                >
                                    View LinkedIn
                                </a>
                            ) : (
                                <span className="text-[#95aac9]">—</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Structured Operational Parameters Card (Owner, Created Date, Stage, Campaign) */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#6e84a3] mb-2.5">
                        Lead Metadata & Filter Attributes
                    </h3>
                    <div className="grid grid-cols-2 gap-2.5">
                        {/* Contact Owner */}
                        <div className="rounded-xl border border-[#eaedf3] bg-white p-3 shadow-xs">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#6e84a3]">
                                <UserCheck className="h-3.5 w-3.5 text-[#354f52]" />
                                <span>Contact Owner</span>
                            </div>
                            <div className="mt-1 text-xs font-extrabold text-[#1f2d3d]">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.contactOwner}
                                        onChange={(e) => setFormData({ ...formData, contactOwner: e.target.value })}
                                        className="border border-[#eaedf3] rounded px-1.5 py-0.5 text-xs text-[#1f2d3d] w-full outline-none focus:border-[#354f52]"
                                        placeholder="Owner (e.g. Michal Ostrowski)"
                                    />
                                ) : (
                                    <span className="truncate">{formData.contactOwner || "Unassigned"}</span>
                                )}
                            </div>
                        </div>

                        {/* Created Date */}
                        <div className="rounded-xl border border-[#eaedf3] bg-white p-3 shadow-xs">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#6e84a3]">
                                <Calendar className="h-3.5 w-3.5 text-[#354f52]" />
                                <span>Created Date</span>
                            </div>
                            <div className="mt-1 text-xs font-extrabold text-[#1f2d3d] font-mono">
                                {lead.createdDate || "—"}
                            </div>
                        </div>

                        {/* Lifecycle Stage */}
                        <div className="rounded-xl border border-[#eaedf3] bg-white p-3 shadow-xs">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#6e84a3]">
                                <Activity className="h-3.5 w-3.5 text-[#354f52]" />
                                <span>Lifecycle Stage</span>
                            </div>
                            <div className="mt-1 text-xs font-extrabold text-[#52796f]">
                                {isEditing ? (
                                    <select
                                        value={formData.lifecycleStage}
                                        onChange={(e) => setFormData({ ...formData, lifecycleStage: e.target.value })}
                                        className="border border-[#eaedf3] rounded px-1 py-0.5 text-xs text-[#1f2d3d] w-full outline-none focus:border-[#354f52] bg-white"
                                    >
                                        <option value="lead">Lead</option>
                                        <option value="marketingqualifiedlead">Marketing Qualified Lead</option>
                                        <option value="salesqualifiedlead">Sales Qualified Lead</option>
                                        <option value="opportunity">Opportunity</option>
                                        <option value="customer">Customer</option>
                                    </select>
                                ) : (
                                    <span className="capitalize">{formData.lifecycleStage}</span>
                                )}
                            </div>
                        </div>

                        {/* Campaign */}
                        <div className="rounded-xl border border-[#eaedf3] bg-white p-3 shadow-xs">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#6e84a3]">
                                <Megaphone className="h-3.5 w-3.5 text-[#354f52]" />
                                <span>Campaign</span>
                            </div>
                            <div className="mt-1 text-xs font-extrabold text-[#1f2d3d]">
                                {isEditing ? (
                                    <select
                                        value={formData.campaign}
                                        onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                                        className="border border-[#eaedf3] rounded px-1 py-0.5 text-xs text-[#1f2d3d] w-full outline-none focus:border-[#354f52] bg-white"
                                    >
                                        <option value="">No Campaign</option>
                                        <option value="AI Profile Outreach - MO">AI Profile Outreach - MO</option>
                                        <option value="AI profile outreach">AI profile outreach</option>
                                        <option value="US Financial Services">US Financial Services</option>
                                        <option value="Polish Tech Hubs">Polish Tech Hubs</option>
                                        <option value="EU Renewable Energy">EU Renewable Energy</option>
                                        <option value="EU Manufacturing">EU Manufacturing</option>
                                        <option value="AI Pack">AI Pack</option>
                                    </select>
                                ) : (
                                    <span className="truncate" title={formData.campaign}>
                                        {formData.campaign || "Direct / Inbound"}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. HubSpot & Internal Notes Section */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#6e84a3] flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-[#354f52]" />
                            <span>Notes & HubSpot Observations</span>
                        </h3>
                        <span className="text-[10px] font-bold text-[#6e84a3] bg-[#f1f4f8] px-2 py-0.5 rounded">
                            {notes.length} {notes.length === 1 ? "note" : "notes"}
                        </span>
                    </div>

                    <form onSubmit={handleAddNote} className="space-y-2 mb-3">
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            rows={2}
                            placeholder="Add a new lead observation, meeting prep note, or qualification detail..."
                            className="w-full rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-3 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                        />
                        <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-lg bg-[#354f52] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#2f3e46] transition-colors shadow-sm"
                        >
                            <Plus className="h-3.5 w-3.5" /> Save Note
                        </button>
                    </form>

                    <div className="space-y-2 max-h-56 overflow-y-auto">
                        {notes.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-[#eaedf3] p-4 text-center text-xs text-[#95aac9]">
                                No notes recorded for this contact yet.
                            </div>
                        ) : (
                            notes.map((n, i) => (
                                <div
                                    key={i}
                                    className="rounded-lg border border-[#eaedf3] bg-[#f8fafc] p-3 text-xs text-[#475569] leading-relaxed shadow-xs"
                                >
                                    {n}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 3.1. Reply.io Conversation & Activity History */}
                <div className="rounded-xl border border-emerald-100 bg-[#f8fafc] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1f2d3d] flex items-center gap-1.5">
                                <Send className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Reply.io Conversation & Activity</span>
                            </h3>
                        </div>
                        {lead.replyConversations && lead.replyConversations.length > 0 ? (
                            <Badge variant={lead.replied === "Yes" ? "success" : "accent"}>
                                {lead.replied === "Yes" ? "Replied to Outreach" : `${lead.replyConversations.length} Events`}
                            </Badge>
                        ) : (
                            <span className="text-[10px] text-[#95aac9]">No sync recorded</span>
                        )}
                    </div>

                    {lead.replyConversations && lead.replyConversations.length > 0 ? (
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {lead.replyConversations.map((c, idx) => (
                                <div
                                    key={idx}
                                    className={`rounded-lg border p-3 text-xs space-y-1.5 transition-all ${
                                        c.type === "Replied" || c.type === "EmailReplied"
                                            ? "border-emerald-300 bg-emerald-50/80 shadow-xs"
                                            : "border-[#eaedf3] bg-white"
                                    }`}
                                >
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="font-bold flex items-center gap-1">
                                            <span
                                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
                                                    c.type === "Replied" || c.type === "EmailReplied"
                                                        ? "bg-emerald-600 text-white"
                                                        : c.type === "OpenTracked"
                                                        ? "bg-amber-100 text-amber-800"
                                                        : "bg-slate-200 text-slate-700"
                                                }`}
                                            >
                                                {c.type === "CampaignEmailSent" ? "Email Sent" : c.type}
                                            </span>
                                            <span className="text-[#6e84a3] font-normal truncate max-w-[170px]">
                                                {c.campaignName}
                                            </span>
                                        </span>
                                        <span className="text-[#95aac9] text-[10px] font-mono">
                                            {c.date ? new Date(c.date).toLocaleDateString() : ""}
                                        </span>
                                    </div>

                                    {c.subject && (
                                        <div className="font-semibold text-[#1f2d3d] text-[11px]">
                                            Subject: <span className="font-normal">{c.subject}</span>
                                        </div>
                                    )}

                                    {c.body && (
                                        <div className="mt-1 text-[11px] text-[#475569] bg-[#f8fafc] p-2 rounded border border-[#eaedf3] whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">
                                            {c.body}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed border-[#eaedf3] bg-white p-3 text-center text-xs text-[#95aac9]">
                            No emails or replies found for {lead.email} in Reply.io. Enroll this lead via "Push to Reply.io" to begin sequence.
                        </div>
                    )}
                </div>

                {/* 4. Real-time Gateway Presence (5 Channels) */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#6e84a3] mb-3">
                        Outbound Channel Presence & Gateway Status
                    </h3>
                    <div className="space-y-2">
                        {channelList.map((ch) => {
                            const status = lead.channels[ch.key];
                            const isActive = status?.active;

                            return (
                                <div
                                    key={ch.key}
                                    className={`flex items-center justify-between rounded-xl border p-3 transition-colors ${
                                        isActive
                                            ? "border-emerald-200 bg-emerald-50/50"
                                            : "border-[#eaedf3] bg-[#f8fafc]"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-7 w-7 overflow-hidden rounded-lg border border-[#eaedf3] bg-white p-1">
                                            <Image
                                                src={ch.logo}
                                                alt={ch.name}
                                                fill
                                                sizes="28px"
                                                className="object-contain p-0.5"
                                            />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-[#1f2d3d]">{ch.name}</div>
                                            <div className="text-[11px] text-[#6e84a3]">
                                                {status?.details || (isActive ? "Connected" : "Not yet connected")}
                                            </div>
                                        </div>
                                    </div>

                                    {isActive ? (
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            <span>{status.statusText || "Active"}</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => onPushToChannel(ch.key, lead)}
                                            className="rounded-lg border border-[#eaedf3] bg-white px-2.5 py-1 text-xs font-bold text-[#354f52] hover:bg-[#354f52] hover:text-white transition-colors shadow-sm"
                                        >
                                            + Push
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 5. Timeline History */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#6e84a3] mb-3">
                        Cross-Channel Activity Timeline
                    </h3>
                    <div className="space-y-3 border-l-2 border-[#eaedf3] pl-4 ml-2">
                        {lead.timeline?.map((t, idx) => (
                            <div key={idx} className="relative">
                                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[#354f52] ring-4 ring-white" />
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] text-[#95aac9]">{t.date}</span>
                                    <span className="rounded bg-[#f1f4f8] px-1.5 py-0.2 text-[10px] font-bold text-[#354f52]">
                                        {t.channel}
                                    </span>
                                </div>
                                <p className="text-xs font-medium text-[#1f2d3d] mt-0.5">{t.event}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
