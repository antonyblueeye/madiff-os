"use client";

import { useState } from "react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
    CalendarDays,
    Plus,
    CheckCircle2,
    Clock,
    Globe,
    FileText,
    ArrowUpRight,
    Eye,
    X,
    User,
    Sparkles,
} from "lucide-react";

interface ContentItem {
    id: string;
    title: string;
    channel: "Madiff LinkedIn Page" | "Engineering Blog" | "Candidate Newsletter";
    scheduledDate: string;
    author: string;
    status: "Published" | "Scheduled" | "In Review" | "Draft";
    summary: string;
    fullArticleContent?: string;
    tags?: string[];
    readsOrViews?: string;
    imageUrl?: string;
}

const initialContentPlan: ContentItem[] = [
    {
        id: "cnt-1",
        title: "Why Distributed AI Engineering Pods Outpace Classical Staffing in 2026",
        channel: "Madiff LinkedIn Page",
        scheduledDate: "2026-09-25",
        author: "Anton D.",
        status: "Scheduled",
        summary: "Detailed breakdown of autonomous agent integration and why fixed senior pods deliver faster.",
        tags: ["AI Engineering", "Autonomous Pods", "B2B Tech"],
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
        fullArticleContent: `The era of classical IT body-shopping is officially over. In 2026, tech leaders don't need 10 junior developers blindly completing tickets; they need tightly integrated, autonomous pods capable of architecting, deploying, and self-verifying production systems.

Key Takeaways:
1. Pod Architecture vs Headcount: Why a 3-person AI-augmented team ships 3x faster than a traditional 10-person dev unit.
2. Cognitive Continuity: How domain-specific AI memory eliminates knowledge loss between sprints.
3. Deliverables over Hours: Shifting procurement contracts from billable hours to guaranteed sprint milestones.

At Madiff, we build dedicated units for FinTech, Web3, and HealthTech scale-ups where speed-to-market is the only moat that matters.`,
    },
    {
        id: "cnt-2",
        title: "Madiff Talent Digest #25: The Rise of Go and Rust in High-Frequency Trading",
        channel: "Candidate Newsletter",
        scheduledDate: "2026-09-28",
        author: "Talent Team",
        status: "In Review",
        summary: "Bi-weekly curated digest sent to 3,500+ senior backend engineers in EU.",
        tags: ["Rust", "Golang", "HFT Architecture"],
        imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop",
        fullArticleContent: `Welcome to Issue #25 of the Madiff Engineering Digest!

This week we're dissecting the architectural shifts in European quantitative trading and ultra-low-latency gateways.

Highlights:
- Benchmarking Tokio vs Go goroutines under 500,000 req/sec load.
- Memory safety without garbage collection pauses: zero-allocation memory buffers in Rust.
- Open Principal Engineer roles at Madiff FinTech partners across London, Berlin, and Zurich.`,
    },
    {
        id: "cnt-3",
        title: "Case Study: Modernizing Core Banking Infrastructure for a Nordic FinTech Unicorn",
        channel: "Engineering Blog",
        scheduledDate: "2026-10-02",
        author: "Principal Architect",
        status: "Draft",
        summary: "Technical deep-dive on event-driven architectures and zero-downtime database migrations.",
        tags: ["Case Study", "FinTech", "Cloud Migration"],
        imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop",
        fullArticleContent: `When NordicFin hit 4 million active accounts, their monolithic Postgres database faced acute concurrency locks during market opens.

Here is how Madiff's 4-engineer pod designed and executed an event-driven event-sourcing layer using Apache Kafka and CockroachDB with zero milliseconds of client downtime.

Result: 85% reduction in p99 latency and a robust foundation ready for Series C European expansion.`,
    },
    {
        id: "cnt-4",
        title: "How We Scaled Engineering Pods for FinTech Clients in 2026",
        channel: "Madiff LinkedIn Page",
        scheduledDate: "2026-09-18",
        author: "Anton D.",
        status: "Published",
        summary: "Practical takeaways from executing 3 concurrent client deliveries.",
        readsOrViews: "4,850 impressions",
        tags: ["Leadership", "FinTech", "Milestones"],
        imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000&auto=format&fit=crop",
        fullArticleContent: `Reflecting on the last 3 quarters at Madiff. Sponsoring client delivery isn't about throwing people at a problem — it's about setting clear architectural guardrails and letting senior engineers operate without bureaucracy.

Key stats:
- 4,850 impressions on LinkedIn
- 92 comments and inbound leads from 4 CTOs
- Average deployment lead time dropped to 18 hours.`,
    },
];

export default function ContentPlanPage() {
    const [contentList, setContentList] = useState<ContentItem[]>(initialContentPlan);
    const [viewArticle, setViewArticle] = useState<ContentItem | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newChannel, setNewChannel] = useState<ContentItem["channel"]>("Madiff LinkedIn Page");
    const [newDate, setNewDate] = useState("");
    const [newAuthor, setNewAuthor] = useState("Anton D.");
    const [newSummary, setNewSummary] = useState("");
    const [newContent, setNewContent] = useState("");

    const handleCreateContent = (e: React.FormEvent) => {
        e.preventDefault();
        const newItem: ContentItem = {
            id: `cnt-${Date.now()}`,
            title: newTitle,
            channel: newChannel,
            scheduledDate: newDate || "2026-10-05",
            author: newAuthor,
            status: "Scheduled",
            summary: newSummary,
            fullArticleContent: newContent || newSummary,
            tags: ["Madiff Ops", "Outbound"],
            imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
        };
        setContentList([newItem, ...contentList]);
        setShowCreateModal(false);
        setNewTitle("");
        setNewSummary("");
        setNewContent("");
    };

    return (
        <PagePlaceholder
            title="Content Marketing & Editorial Calendar"
            description="Manage published and queued articles, LinkedIn posts, and candidate digests with full visual preview."
            icon={CalendarDays}
            tag="Editorial Hub"
            action={
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#354f52] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#2f3e46] transition-colors"
                >
                    <Plus className="h-4 w-4" /> Add Planned Article
                </button>
            }
        >
            {/* Top Metrics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase">Scheduled This Month</span>
                    <p className="mt-1 text-2xl font-extrabold text-[#1f2d3d] font-mono">8 Articles</p>
                    <span className="text-[11px] text-[#10b981] font-semibold mt-1">LinkedIn + Blog</span>
                </Card>
                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase">Candidate Newsletters</span>
                    <p className="mt-1 text-2xl font-extrabold text-[#1f2d3d] font-mono">2 Issues</p>
                    <span className="text-[11px] text-[#6e84a3] mt-1">Sent via Zoho</span>
                </Card>
                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase">Avg Organic ER</span>
                    <p className="mt-1 text-2xl font-extrabold text-[#354f52] font-mono">2.84%</p>
                    <span className="text-[11px] text-[#10b981] font-semibold mt-1">+0.4% vs benchmark</span>
                </Card>
                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase">Lead Inquiries from Content</span>
                    <p className="mt-1 text-2xl font-extrabold text-[#1f2d3d] font-mono">14 Inbound</p>
                    <span className="text-[11px] text-[#6e84a3] mt-1">Directly in CRM</span>
                </Card>
            </div>

            {/* Articles Table */}
            <Card className="p-5">
                <div className="flex items-center justify-between mb-4 border-b border-[#eaedf3] pb-3">
                    <div>
                        <h3 className="text-sm font-bold text-[#1f2d3d]">Editorial Calendar & Queued Posts</h3>
                        <p className="text-xs text-[#6e84a3] mt-0.5">
                            Click any row to open full article preview with cover graphics and text
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#eaedf3] text-[#6e84a3] font-bold uppercase text-[10px]">
                                <th className="pb-3">Article Title & Abstract</th>
                                <th className="pb-3">Channel</th>
                                <th className="pb-3">Date</th>
                                <th className="pb-3">Author</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3 text-right">Preview</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eaedf3]">
                            {contentList.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => setViewArticle(item)}
                                    className="hover:bg-[#f8fafc] transition-colors cursor-pointer"
                                >
                                    <td className="py-3.5 pr-4 max-w-md">
                                        <div className="font-bold text-[#1f2d3d] text-sm hover:text-[#354f52]">
                                            {item.title}
                                        </div>
                                        <div className="text-[11px] text-[#6e84a3] mt-0.5 line-clamp-1">
                                            {item.summary}
                                        </div>
                                    </td>
                                    <td className="py-3.5">
                                        <span className="rounded bg-[#f1f4f8] px-2 py-0.5 text-[11px] font-semibold text-[#354f52] border border-[#e2e8f0]">
                                            {item.channel}
                                        </span>
                                    </td>
                                    <td className="py-3.5 font-mono text-[#6e84a3]">{item.scheduledDate}</td>
                                    <td className="py-3.5 font-medium text-[#1f2d3d]">{item.author}</td>
                                    <td className="py-3.5">
                                        <Badge
                                            variant={
                                                item.status === "Published"
                                                    ? "success"
                                                    : item.status === "Scheduled"
                                                    ? "brand"
                                                    : item.status === "In Review"
                                                    ? "warning"
                                                    : "default"
                                            }
                                        >
                                            {item.status}
                                        </Badge>
                                    </td>
                                    <td className="py-3.5 text-right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewArticle(item);
                                            }}
                                            className="inline-flex items-center gap-1 rounded-lg border border-[#eaedf3] bg-white px-2.5 py-1 text-[11px] font-bold text-[#354f52] hover:bg-[#f1f4f8] transition-colors shadow-sm"
                                        >
                                            <Eye className="h-3 w-3" /> View Post
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* FULL POST PREVIEW MODAL */}
            {viewArticle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-[#eaedf3] space-y-5">
                        <div className="flex items-start justify-between border-b border-[#eaedf3] pb-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Badge variant="brand">{viewArticle.channel}</Badge>
                                    <span className="text-xs font-mono text-[#6e84a3]">
                                        Scheduled: {viewArticle.scheduledDate}
                                    </span>
                                </div>
                                <h2 className="text-xl font-extrabold text-[#1f2d3d] tracking-tight">
                                    {viewArticle.title}
                                </h2>
                            </div>
                            <button
                                onClick={() => setViewArticle(null)}
                                className="rounded-lg p-1.5 text-[#95aac9] hover:bg-[#f1f4f8] hover:text-[#1f2d3d]"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Visual Cover Banner */}
                        {viewArticle.imageUrl && (
                            <div className="relative h-60 w-full overflow-hidden rounded-xl border border-[#eaedf3] bg-[#f8fafc]">
                                <img
                                    src={viewArticle.imageUrl}
                                    alt={viewArticle.title}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-black/70 px-3 py-1 text-xs text-white backdrop-blur-sm">
                                    <User className="h-3 w-3" /> Author: {viewArticle.author}
                                </div>
                            </div>
                        )}

                        {/* Article Tags */}
                        {viewArticle.tags && (
                            <div className="flex items-center gap-2">
                                {viewArticle.tags.map((t, idx) => (
                                    <span
                                        key={idx}
                                        className="rounded-full bg-[#f1f4f8] px-2.5 py-0.5 text-[11px] font-semibold text-[#354f52] border border-[#e2e8f0]"
                                    >
                                        #{t}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Article Body Content */}
                        <div className="rounded-xl border border-[#eaedf3] bg-[#fafbfc] p-5 text-xs text-[#1f2d3d] leading-relaxed whitespace-pre-line font-normal">
                            {viewArticle.fullArticleContent || viewArticle.summary}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#eaedf3]">
                            <span className="text-xs text-[#6e84a3]">
                                Status: <strong className="text-[#1f2d3d]">{viewArticle.status}</strong>
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setViewArticle(null)}
                                    className="rounded-lg px-4 py-2 text-xs font-semibold text-[#6e84a3] hover:text-[#1f2d3d]"
                                >
                                    Close Preview
                                </button>
                                <button className="flex items-center gap-1.5 rounded-lg bg-[#354f52] px-4 py-2 text-xs font-bold text-white hover:bg-[#2f3e46] transition-colors shadow-sm">
                                    <Globe className="h-3.5 w-3.5" /> Publish to LinkedIn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for adding content */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <form
                        onSubmit={handleCreateContent}
                        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 border border-[#eaedf3]"
                    >
                        <div className="flex items-center justify-between border-b border-[#eaedf3] pb-3">
                            <h3 className="text-base font-bold text-[#1f2d3d]">Schedule New Article</h3>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="text-sm text-[#95aac9] hover:text-[#1f2d3d]"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[#6e84a3] uppercase">Article Title</label>
                            <input
                                required
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="E.g. Why Dedicated AI Engineering Pods Scale Faster"
                                className="w-full rounded-lg border border-[#eaedf3] px-3.5 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#6e84a3] uppercase">Channel</label>
                                <select
                                    value={newChannel}
                                    onChange={(e) => setNewChannel(e.target.value as any)}
                                    className="w-full rounded-lg border border-[#eaedf3] px-3 py-2 text-xs text-[#1f2d3d] outline-none"
                                >
                                    <option value="Madiff LinkedIn Page">Madiff LinkedIn Page</option>
                                    <option value="Engineering Blog">Engineering Blog</option>
                                    <option value="Candidate Newsletter">Candidate Newsletter</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#6e84a3] uppercase">Publication Date</label>
                                <input
                                    type="date"
                                    required
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    className="w-full rounded-lg border border-[#eaedf3] px-3 py-2 text-xs text-[#1f2d3d] outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[#6e84a3] uppercase">Short Summary</label>
                            <input
                                required
                                value={newSummary}
                                onChange={(e) => setNewSummary(e.target.value)}
                                placeholder="Brief overview for calendar feed..."
                                className="w-full rounded-lg border border-[#eaedf3] px-3.5 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52]"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[#6e84a3] uppercase">Full Article Content</label>
                            <textarea
                                rows={4}
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                placeholder="Draft the complete article body, takeaways, and call to action..."
                                className="w-full rounded-lg border border-[#eaedf3] px-3.5 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52]"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eaedf3]">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="rounded-lg px-4 py-2 text-xs font-medium text-[#6e84a3] hover:text-[#1f2d3d]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-lg bg-[#354f52] px-4 py-2 text-xs font-bold text-white hover:bg-[#2f3e46]"
                            >
                                Save to Calendar
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </PagePlaceholder>
    );
}
