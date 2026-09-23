"use client";

import Image from "next/image";
import { Plus, Check, ExternalLink } from "lucide-react";
import { LeadItem } from "@/lib/mock-data";

interface ChannelBadgesProps {
    lead: LeadItem;
    onChannelClick: (channelKey: "apollo" | "hubspot" | "reply" | "linkedhelper" | "zoho", lead: LeadItem) => void;
}

const channelConfig = [
    { key: "apollo", name: "Apollo.io", logo: "/apollo.jpg", actionName: "Enrich via Apollo" },
    { key: "hubspot", name: "HubSpot", logo: "/hubspot.png", actionName: "Sync to HubSpot" },
    { key: "reply", name: "Reply.io", logo: "/reply.png", actionName: "Enroll in Reply.io" },
    { key: "linkedhelper", name: "LinkedHelper", logo: "/linkedhelper.png", actionName: "Send via LinkedHelper" },
    { key: "zoho", name: "Zoho Campaigns", logo: "/zoho_campaigns.webp", actionName: "Add to Zoho Newsletter" },
] as const;

export function ChannelBadges({ lead, onChannelClick }: ChannelBadgesProps) {
    return (
        <div className="flex items-center gap-1.5">
            {channelConfig.map((ch) => {
                const status = lead.channels[ch.key];
                const isActive = status?.active;

                return (
                    <button
                        key={ch.key}
                        onClick={(e) => {
                            e.stopPropagation();
                            onChannelClick(ch.key, lead);
                        }}
                        title={`${ch.name}: ${isActive ? status.statusText || "Active" : "Click to push"}`}
                        className={`group relative flex h-7 w-7 items-center justify-center rounded-lg border p-0.5 transition-all duration-150 ${
                            isActive
                                ? "border-emerald-400/80 bg-emerald-50/80 shadow-sm ring-1 ring-emerald-300/40 hover:border-emerald-500 hover:scale-105"
                                : "border-[#e2e8f0] bg-white opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:border-[#354f52] hover:scale-105"
                        }`}
                    >
                        <div className="relative h-5 w-5 overflow-hidden rounded">
                            <Image
                                src={ch.logo}
                                alt={ch.name}
                                fill
                                sizes="20px"
                                className="object-contain"
                            />
                        </div>

                        {/* Status micro dot */}
                        {isActive ? (
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white ring-1 ring-white">
                                <Check className="h-2 w-2" />
                            </span>
                        ) : (
                            <span className="absolute -bottom-0.5 -right-0.5 hidden group-hover:flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#354f52] text-[8px] font-bold text-white ring-1 ring-white">
                                <Plus className="h-2 w-2" />
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
