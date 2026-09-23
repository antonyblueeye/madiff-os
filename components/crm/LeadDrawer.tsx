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
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface LeadDrawerProps {
    lead: LeadItem;
    onClose: () => void;
    onPushToChannel: (channelKey: "apollo" | "hubspot" | "reply" | "linkedhelper" | "zoho", lead: LeadItem) => void;
}

const channelList = [
    { key: "apollo", name: "Apollo.io", logo: "/apollo.jpg" },
    { key: "hubspot", name: "HubSpot CRM", logo: "/hubspot.png" },
    { key: "reply", name: "Reply.io", logo: "/reply.png" },
    { key: "linkedhelper", name: "LinkedHelper", logo: "/linkedhelper.png" },
    { key: "zoho", name: "Zoho Campaigns", logo: "/zoho_campaigns.webp" },
] as const;

export function LeadDrawer({ lead, onClose, onPushToChannel }: LeadDrawerProps) {
    const [newNote, setNewNote] = useState("");
    const [notes, setNotes] = useState<string[]>(lead.notes || []);

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        setNotes([newNote.trim(), ...notes]);
        setNewNote("");
    };

    return (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl border-l border-[#eaedf3] animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#eaedf3] px-6 py-4 bg-[#f8fafc]">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#354f52] text-sm font-bold text-white shadow-sm">
                        {lead.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-extrabold text-[#1f2d3d]">{lead.name}</h2>
                            <Badge variant="brand">{lead.stage}</Badge>
                        </div>
                        <p className="text-xs font-semibold text-[#52796f]">{lead.title}</p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-[#95aac9] hover:bg-[#e2e8f0] hover:text-[#1f2d3d]"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* 1. Core Profile & Contact Details (Name, Email, Company, Location) */}
                <div className="rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-[#1f2d3d]">
                            <Building2 className="h-4 w-4 text-[#354f52]" />
                            <span>{lead.company || "Not Specified"}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-[#6e84a3] bg-white border border-[#eaedf3] px-2.5 py-0.5 rounded-full">
                            {lead.headcount || "Verified"}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs text-[#6e84a3] pt-1">
                        <div className="flex items-center gap-1.5 truncate">
                            <Mail className="h-3.5 w-3.5 text-[#354f52] shrink-0" />
                            <span className="font-mono text-[#1f2d3d] truncate select-all">{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-[#95aac9] shrink-0" />
                            <span className="text-[#1f2d3d] truncate">{lead.location}</span>
                        </div>
                        {lead.phone && (
                            <div className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-[#95aac9] shrink-0" />
                                <span className="font-mono text-[#1f2d3d]">{lead.phone}</span>
                            </div>
                        )}
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
                            <div className="mt-1 text-xs font-extrabold text-[#1f2d3d] truncate">
                                {lead.contactOwner || "Unassigned"}
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
                            <div className="mt-1 text-xs font-extrabold text-[#52796f] capitalize">
                                {lead.lifecycleStage || lead.stage || "lead"}
                            </div>
                        </div>

                        {/* Campaign */}
                        <div className="rounded-xl border border-[#eaedf3] bg-white p-3 shadow-xs">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#6e84a3]">
                                <Megaphone className="h-3.5 w-3.5 text-[#354f52]" />
                                <span>Campaign</span>
                            </div>
                            <div className="mt-1 text-xs font-extrabold text-[#1f2d3d] truncate" title={lead.campaign}>
                                {lead.campaign || "Direct / Inbound"}
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
