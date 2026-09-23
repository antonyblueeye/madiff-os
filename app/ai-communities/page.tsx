"use client";

import { useState } from "react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { aiCommunitiesList } from "@/lib/mock-data";
import {
    Users2,
    ExternalLink,
    MessageSquare,
    Sparkles,
    Calendar,
    CheckCircle2,
    Search,
    Plus,
} from "lucide-react";

export default function AICommunitiesPage() {
    const [communities, setCommunities] = useState(aiCommunitiesList);
    const [search, setSearch] = useState("");

    const filtered = communities.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.focus.toLowerCase().includes(search.toLowerCase()) ||
            c.platform.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <PagePlaceholder
            title="AI Communities & Ecosystem Groups"
            description="Track and engage with high-value technical communities across Slack, Discord, LinkedIn, and Facebook where Madiff sources engineering intelligence and clients."
            icon={Users2}
            tag="Community Engine"
            action={
                <button className="flex items-center gap-1.5 rounded-lg bg-[#354f52] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#2f3e46] transition-colors">
                    <Plus className="h-4 w-4" /> Add Community
                </button>
            }
        >
            {/* Top KPI Metrics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase">Tracked Communities</span>
                    <p className="mt-1 text-2xl font-extrabold text-[#1f2d3d] font-mono">4 Groups</p>
                    <span className="text-[11px] text-[#10b981] font-semibold mt-1">Slack, Discord, LinkedIn, FB</span>
                </Card>
                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase">Aggregated Reach</span>
                    <p className="mt-1 text-2xl font-extrabold text-[#1f2d3d] font-mono">63,700+</p>
                    <span className="text-[11px] text-[#6e84a3] mt-1">Founders & ML Engineers</span>
                </Card>
                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase">Inbound Deal Velocity</span>
                    <p className="mt-1 text-2xl font-extrabold text-[#354f52] font-mono">4 Deals / mo</p>
                    <span className="text-[11px] text-[#10b981] font-semibold mt-1">Direct from community posts</span>
                </Card>
                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase">Our Thought Leadership</span>
                    <p className="mt-1 text-2xl font-extrabold text-[#1f2d3d] font-mono">Top Voice</p>
                    <span className="text-[11px] text-[#6e84a3] mt-1">Active contributor badge</span>
                </Card>
            </div>

            {/* Filter Search */}
            <div className="flex items-center gap-2 rounded-lg bg-white border border-[#eaedf3] px-3.5 py-2 w-72 text-xs text-[#1f2d3d] shadow-sm">
                <Search className="h-3.5 w-3.5 text-[#95aac9]" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by community or topic..."
                    className="bg-transparent text-xs text-[#1f2d3d] outline-none w-full"
                />
            </div>

            {/* Communities Grid */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {filtered.map((comm) => (
                    <Card key={comm.id} className="flex flex-col justify-between p-5 space-y-4">
                        <div>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-extrabold text-[#1f2d3d]">{comm.name}</h3>
                                        <Badge variant="brand">{comm.platform}</Badge>
                                    </div>
                                    <p className="text-xs text-[#52796f] font-semibold mt-0.5">{comm.members} Members</p>
                                </div>

                                <a
                                    href={comm.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-lg border border-[#eaedf3] bg-white p-2 text-[#6e84a3] hover:text-[#1f2d3d] hover:bg-[#f1f4f8] transition-colors"
                                    title="Open Community"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>

                            <p className="mt-3 text-xs text-[#475569] leading-relaxed">
                                <span className="font-bold text-[#1f2d3d]">Core Focus:</span> {comm.focus}
                            </p>

                            <div className="mt-3 space-y-1.5 rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-3 text-xs">
                                <div className="flex items-center justify-between text-[#6e84a3]">
                                    <span>Madiff Role</span>
                                    <span className="font-semibold text-[#1f2d3d]">{comm.ourRole}</span>
                                </div>
                                <div className="flex items-center justify-between text-[#6e84a3]">
                                    <span>Engagement Cadence</span>
                                    <span className="font-semibold text-[#10b981]">{comm.engagementLevel}</span>
                                </div>
                                <div className="flex items-center justify-between text-[#6e84a3]">
                                    <span>Key Contacts</span>
                                    <span className="font-mono text-[#1f2d3d]">{comm.keyContacts}</span>
                                </div>
                            </div>

                            <div className="mt-3 flex items-start gap-2 text-xs text-[#6e84a3] bg-emerald-50/50 border border-emerald-200/60 p-2.5 rounded-lg">
                                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold text-emerald-900">Latest Active Thread: </span>
                                    <span className="text-emerald-800">{comm.recentTopic}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[#eaedf3] text-xs">
                            <span className="text-[11px] text-[#95aac9]">Logged in Madiff Outbound CRM</span>
                            <button className="font-bold text-[#354f52] hover:underline flex items-center gap-1">
                                <MessageSquare className="h-3.5 w-3.5" /> Prepare Discussion Post
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        </PagePlaceholder>
    );
}
