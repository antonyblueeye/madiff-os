"use client";

import { useState } from "react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
    Globe,
    Plus,
    TrendingUp,
    Eye,
    ThumbsUp,
    MessageCircle,
    Share2,
    Calendar,
    ExternalLink,
} from "lucide-react";

interface PostMetric {
    id: number;
    title: string;
    date: string;
    views: number;
    reactions: number;
    comments: number;
    reposts: number;
    engagementRate: string;
    topic: string;
}

const initialPosts: PostMetric[] = [
    {
        id: 1,
        title: "How We Scaled Engineering Pods for FinTech Clients in 2026",
        date: "2026-09-21",
        views: 4850,
        reactions: 92,
        comments: 18,
        reposts: 7,
        engagementRate: "2.41%",
        topic: "Case Study",
    },
    {
        id: 2,
        title: "The Shift from Legacy Staff Augmentation to Dedicated AI Delivery Units",
        date: "2026-09-17",
        views: 6120,
        reactions: 145,
        comments: 29,
        reposts: 12,
        engagementRate: "3.04%",
        topic: "Thought Leadership",
    },
    {
        id: 3,
        title: "Meet our Principal Architect: Why distributed teams outpace local hubs",
        date: "2026-09-12",
        views: 3200,
        reactions: 74,
        comments: 9,
        reposts: 4,
        engagementRate: "2.72%",
        topic: "Culture / Team",
    },
];

export default function LinkedInMadiffPage() {
    const [posts, setPosts] = useState<PostMetric[]>(initialPosts);
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newViews, setNewViews] = useState("");
    const [newReactions, setNewReactions] = useState("");
    const [newComments, setNewComments] = useState("");
    const [newTopic, setNewTopic] = useState("Thought Leadership");

    const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
    const totalReactions = posts.reduce((sum, p) => sum + p.reactions, 0);
    const totalComments = posts.reduce((sum, p) => sum + p.comments, 0);

    const handleAddPost = (e: React.FormEvent) => {
        e.preventDefault();
        const views = parseInt(newViews) || 0;
        const reactions = parseInt(newReactions) || 0;
        const comments = parseInt(newComments) || 0;
        const er = views > 0 ? (((reactions + comments) / views) * 100).toFixed(2) + "%" : "0%";

        const newPost: PostMetric = {
            id: Date.now(),
            title: newTitle || "Untitled Post",
            date: new Date().toISOString().split("T")[0],
            views,
            reactions,
            comments,
            reposts: 0,
            engagementRate: er,
            topic: newTopic,
        };

        setPosts([newPost, ...posts]);
        setShowModal(false);
        setNewTitle("");
        setNewViews("");
        setNewReactions("");
        setNewComments("");
    };

    return (
        <PagePlaceholder
            title="Madiff LinkedIn Company Page"
            description="Track organic content performance, impressions, and engagement metrics (manual logger & analytics bridge)."
            icon={Globe}
            tag="Organic Social"
        >
            {/* Top Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase tracking-wide">Total Organic Views</span>
                    <p className="mt-1 text-2xl font-extrabold text-[#1f2d3d] font-mono">{totalViews.toLocaleString()}</p>
                    <span className="text-[11px] text-[#10b981] font-semibold flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" /> +16.2% vs previous period
                    </span>
                </Card>
                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase tracking-wide">Reactions & Comments</span>
                    <p className="mt-1 text-2xl font-extrabold text-[#1f2d3d] font-mono">
                        {(totalReactions + totalComments).toLocaleString()}
                    </p>
                    <span className="text-[11px] text-[#354f52] font-medium mt-1">
                        {totalReactions} likes · {totalComments} discussions
                    </span>
                </Card>
                <Card className="p-4">
                    <span className="text-[11px] font-bold text-[#6e84a3] uppercase tracking-wide">Avg. Engagement Rate</span>
                    <p className="mt-1 text-2xl font-extrabold text-[#354f52] font-mono">2.72%</p>
                    <span className="text-[11px] text-[#6e84a3] mt-1">B2B tech benchmark: ~1.8%</span>
                </Card>
            </div>

            {/* Posts Table & Add button */}
            <Card className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 border-b border-[#eaedf3] pb-3">
                    <div>
                        <h3 className="text-sm font-bold text-[#1f2d3d]">Published Company Posts</h3>
                        <p className="text-xs text-[#6e84a3] mt-0.5">
                            Logged manually from LinkedIn Campaign / Page Admin Analytics
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#354f52] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#2f3e46] transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" /> Log New Post Stats
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#eaedf3] text-[#6e84a3] font-bold uppercase text-[10px]">
                                <th className="pb-3 font-semibold">Post Title & Topic</th>
                                <th className="pb-3 font-semibold">Date</th>
                                <th className="pb-3 font-semibold text-right">Views</th>
                                <th className="pb-3 font-semibold text-right">Reactions</th>
                                <th className="pb-3 font-semibold text-right">Comments</th>
                                <th className="pb-3 font-semibold text-right">Eng. Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eaedf3]">
                            {posts.map((post) => (
                                <tr key={post.id} className="hover:bg-[#f8fafc] transition-colors">
                                    <td className="py-3.5 pr-4">
                                        <div className="font-bold text-[#1f2d3d] max-w-md line-clamp-1">
                                            {post.title}
                                        </div>
                                        <span className="inline-block mt-1 rounded bg-[#f1f4f8] px-2 py-0.5 text-[10px] font-semibold text-[#354f52] border border-[#e2e8f0]">
                                            {post.topic}
                                        </span>
                                    </td>
                                    <td className="py-3.5 font-mono text-[#6e84a3] whitespace-nowrap">
                                        {post.date}
                                    </td>
                                    <td className="py-3.5 text-right font-mono font-bold text-[#1f2d3d]">
                                        {post.views.toLocaleString()}
                                    </td>
                                    <td className="py-3.5 text-right font-mono font-bold text-[#354f52]">
                                        {post.reactions}
                                    </td>
                                    <td className="py-3.5 text-right font-mono text-[#6e84a3]">
                                        {post.comments}
                                    </td>
                                    <td className="py-3.5 text-right font-mono font-extrabold text-[#10b981]">
                                        {post.engagementRate}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal for manual logging */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <form
                        onSubmit={handleAddPost}
                        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 border border-[#eaedf3]"
                    >
                        <div className="flex items-center justify-between border-b border-[#eaedf3] pb-3">
                            <div className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-[#354f52]" />
                                <h3 className="text-base font-bold text-[#1f2d3d]">Log Post Analytics</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="text-sm text-[#95aac9] hover:text-[#1f2d3d]"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[#6e84a3] uppercase">Post Headline</label>
                            <input
                                required
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="E.g. Why specialized AI pods beat generic IT staffing"
                                className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3.5 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#6e84a3] uppercase">Impressions</label>
                                <input
                                    type="number"
                                    required
                                    value={newViews}
                                    onChange={(e) => setNewViews(e.target.value)}
                                    placeholder="4500"
                                    className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#6e84a3] uppercase">Reactions</label>
                                <input
                                    type="number"
                                    required
                                    value={newReactions}
                                    onChange={(e) => setNewReactions(e.target.value)}
                                    placeholder="85"
                                    className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#6e84a3] uppercase">Comments</label>
                                <input
                                    type="number"
                                    required
                                    value={newComments}
                                    onChange={(e) => setNewComments(e.target.value)}
                                    placeholder="14"
                                    className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[#6e84a3] uppercase">Topic Category</label>
                            <select
                                value={newTopic}
                                onChange={(e) => setNewTopic(e.target.value)}
                                className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3.5 py-2 text-xs text-[#1f2d3d] outline-none"
                            >
                                <option value="Thought Leadership">Thought Leadership</option>
                                <option value="Case Study">Case Study</option>
                                <option value="Culture / Team">Culture / Team</option>
                                <option value="Tech Insights">Tech Insights</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eaedf3]">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="rounded-lg px-4 py-2 text-xs font-medium text-[#6e84a3] hover:text-[#1f2d3d]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-lg bg-[#354f52] px-4 py-2 text-xs font-bold text-white hover:bg-[#2f3e46] transition-colors"
                            >
                                Save Entry
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </PagePlaceholder>
    );
}
