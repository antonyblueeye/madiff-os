"use client";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
    Award,
    Star,
    ExternalLink,
    CheckCircle2,
    Trophy,
    TrendingUp,
    ShieldCheck,
    Users,
    Building2,
    Calendar,
} from "lucide-react";

interface ClutchReview {
    id: string;
    client: string;
    clientRole: string;
    project: string;
    rating: number;
    reviewTitle: string;
    date: string;
    verified: boolean;
    cost: string;
    clutchUrl: string;
}

const reviews: ClutchReview[] = [
    {
        id: "cr-1",
        client: "Nordic Payment Gateway",
        clientRole: "Head of Core Banking Architecture",
        project: "Autonomous Agentic Payments Migration",
        rating: 5.0,
        cost: "$120,000+",
        reviewTitle: "“Madiff delivered a dedicated pod that outpaced our internal sprint targets by 40%.”",
        date: "September 2026",
        verified: true,
        clutchUrl: "https://clutch.co/profile/madiff",
    },
    {
        id: "cr-2",
        client: "Swiss WealthTech AG",
        clientRole: "Chief Operating Officer",
        project: "Full-Stack Cloud Transformation",
        rating: 5.0,
        cost: "$85,000+",
        reviewTitle: "“Exceptional senior engineering talent. Zero ramp-up friction and spotless communication.”",
        date: "August 2026",
        verified: true,
        clutchUrl: "https://clutch.co/profile/madiff",
    },
    {
        id: "cr-3",
        client: "London InsurTech Labs",
        clientRole: "VP of Product",
        project: "LLM Infrastructure & Real-Time Claims",
        rating: 5.0,
        cost: "$65,000+",
        reviewTitle: "“Madiff engineers are true architectural partners, not just ticket executors.”",
        date: "July 2026",
        verified: true,
        clutchUrl: "https://clutch.co/profile/madiff",
    },
    {
        id: "cr-4",
        client: "Berlin Mobility Data Platform",
        clientRole: "Director of Engineering",
        project: "High-Throughput Streaming Engine (Go/Kafka)",
        rating: 5.0,
        cost: "$90,000+",
        reviewTitle: "“Reliable, proactive and extremely skilled engineers. Delivered on time with zero bugs.”",
        date: "June 2026",
        verified: true,
        clutchUrl: "https://clutch.co/profile/madiff",
    },
];

export default function ClutchPage() {
    return (
        <PagePlaceholder
            title="Clutch Master Intelligence & Awards Hub"
            description="Complete repository of Clutch verified reviews, Leader Matrix positioning, company badges, and profile traffic analytics."
            icon={Award}
            tag="5.0 Rating · Global Leader"
            action={
                <a
                    href="https://clutch.co"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#354f52] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#2f3e46] transition-colors shadow-sm"
                >
                    <ExternalLink className="h-3.5 w-3.5" /> View Public Clutch Profile
                </a>
            }
        >
            {/* Top Score Banner */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <Card className="p-4 flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                        <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-[#6e84a3] uppercase">Overall Score</span>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-2xl font-extrabold text-[#1f2d3d] font-mono">5.0</span>
                            <div className="flex text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-current" />
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-[#6e84a3] uppercase">Verified Interviews</span>
                        <p className="text-2xl font-extrabold text-[#1f2d3d] font-mono mt-0.5">18 Reviews</p>
                        <span className="text-[10px] text-emerald-600 font-semibold">100% verified by Clutch</span>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-[#6e84a3] uppercase">Global Recognition</span>
                        <p className="text-2xl font-extrabold text-[#1f2d3d] font-mono mt-0.5">Top 1%</p>
                        <span className="text-[10px] text-blue-600 font-semibold">AI Engineering category</span>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-[#6e84a3] uppercase">Profile Impressions</span>
                        <p className="text-2xl font-extrabold text-[#1f2d3d] font-mono mt-0.5">2,480 / mo</p>
                        <span className="text-[10px] text-purple-600 font-semibold">+22% buyer intent</span>
                    </div>
                </Card>
            </div>

            {/* Clutch Leaders Matrix & Badges Card */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <Card className="p-5 lg:col-span-2 space-y-3">
                    <h3 className="text-sm font-bold text-[#1f2d3d]">Clutch Leaders Matrix Position</h3>
                    <p className="text-xs text-[#6e84a3]">
                        Madiff is positioned in the top-right <strong className="text-[#1f2d3d]">"Market Leaders"</strong> quadrant based on ability to deliver and verified client satisfaction.
                    </p>

                    <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-3 text-center">
                            <span className="text-[10px] font-bold uppercase text-[#6e84a3]">Ability to Deliver</span>
                            <p className="text-lg font-extrabold text-[#354f52] font-mono mt-1">9.8 / 10</p>
                        </div>
                        <div className="rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-3 text-center">
                            <span className="text-[10px] font-bold uppercase text-[#6e84a3]">Client Focus</span>
                            <p className="text-lg font-extrabold text-[#10b981] font-mono mt-1">10.0 / 10</p>
                        </div>
                        <div className="rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-3 text-center">
                            <span className="text-[10px] font-bold uppercase text-[#6e84a3]">Recommendation Rate</span>
                            <p className="text-lg font-extrabold text-[#1f2d3d] font-mono mt-1">100%</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 space-y-3">
                    <h3 className="text-sm font-bold text-[#1f2d3d]">Active Verified Badges</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50/50 p-2.5">
                            <Trophy className="h-4 w-4 text-amber-600" />
                            <span className="text-xs font-bold text-amber-900">Top B2B Company Europe 2026</span>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-900">Clutch Global Winner — AI Engineering</span>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50/50 p-2.5">
                            <ShieldCheck className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-bold text-blue-900">Verified Service Provider Badge</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Testimonials Stream */}
            <Card className="p-5">
                <div className="flex items-center justify-between mb-4 border-b border-[#eaedf3] pb-3">
                    <div>
                        <h3 className="text-sm font-bold text-[#1f2d3d]">Verified Client Testimonials</h3>
                        <p className="text-xs text-[#6e84a3] mt-0.5">
                            Full transcribed interviews used for outreach social proof
                        </p>
                    </div>
                </div>

                <div className="space-y-3.5">
                    {reviews.map((r) => (
                        <div
                            key={r.id}
                            className="rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-4 hover:border-[#354f52]/40 transition-colors space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex text-amber-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-3 w-3 fill-current" />
                                        ))}
                                    </div>
                                    <span className="font-mono text-xs font-bold text-[#1f2d3d]">5.0</span>
                                    <span className="text-xs text-[#95aac9]">·</span>
                                    <Badge variant="success">Clutch Verified</Badge>
                                    <span className="text-xs font-mono text-[#6e84a3]">Project Size: {r.cost}</span>
                                </div>
                                <span className="text-[11px] text-[#95aac9] font-mono">{r.date}</span>
                            </div>

                            <p className="text-xs font-bold text-[#1f2d3d] italic leading-relaxed">
                                {r.reviewTitle}
                            </p>

                            <div className="flex items-center justify-between pt-1 border-t border-[#eaedf3] text-xs">
                                <div>
                                    <span className="font-bold text-[#354f52]">{r.client}</span>
                                    <span className="text-[#6e84a3] ml-1">({r.clientRole})</span>
                                </div>
                                <span className="text-[11px] text-[#52796f] font-semibold">{r.project}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </PagePlaceholder>
    );
}
