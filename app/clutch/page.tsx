"use client";

import { useState } from "react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import clutchData from "@/lib/clutch-data.json";
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
    MapPin,
    DollarSign,
    Briefcase,
    Sparkles,
    Check,
    Copy,
    ArrowUpRight,
    PieChart,
    Layers,
    Quote
} from "lucide-react";

export default function ClutchPage() {
    const [activeTab, setActiveTab] = useState<"reviews" | "focus" | "portfolio" | "locations">("reviews");
    const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedQuoteId(id);
        setTimeout(() => setCopiedQuoteId(null), 2000);
    };

    return (
        <PagePlaceholder
            title="Clutch Master Intelligence & Social Proof Hub"
            description="Verified client interviews, real-world case studies, service line distributions, and global delivery presence scraped live from Clutch.co."
            icon={Award}
            tag="Live Scraped Intelligence"
            action={
                <a
                    href="https://clutch.co/profile/madiff"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#354f52] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#2f3e46] transition-colors shadow-2xs"
                >
                    <ExternalLink className="h-3.5 w-3.5" /> View Public Clutch Profile
                </a>
            }
        >
            {/* Top Score Banner */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Card className="p-4 bg-white border-[#eaedf3] shadow-2xs hover:border-[#354f52]/40 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#6e84a3] uppercase tracking-wider">Overall Clutch Score</span>
                        <div className="flex text-amber-500">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-current" />
                            ))}
                        </div>
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-[#1f2d3d] font-mono">{clutchData.company.rating}</span>
                        <span className="text-xs text-[#6e84a3]">/ 5.0</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] border-t border-[#eaedf3] pt-1.5 font-mono">
                        <span className="text-[#6e84a3]">Quality: <strong className="text-emerald-700">5.0</strong></span>
                        <span className="text-[#6e84a3]">Schedule: <strong className="text-emerald-700">5.0</strong></span>
                        <span className="text-[#6e84a3]">Cost: <strong className="text-[#1f2d3d]">4.5</strong></span>
                    </div>
                </Card>

                <Card className="p-4 bg-white border-[#eaedf3] shadow-2xs hover:border-[#354f52]/40 transition-colors">
                    <span className="text-[10px] font-bold text-[#6e84a3] uppercase tracking-wider">Verified Reviews</span>
                    <p className="mt-1 text-3xl font-black text-[#1f2d3d] font-mono">{clutchData.company.reviewCount} In-Depth</p>
                    <span className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> 100% Phone Verified by Clutch
                    </span>
                </Card>

                <Card className="p-4 bg-white border-[#eaedf3] shadow-2xs hover:border-[#354f52]/40 transition-colors">
                    <span className="text-[10px] font-bold text-[#6e84a3] uppercase tracking-wider">Hourly Rate & Scale</span>
                    <p className="mt-1 text-2xl font-black text-[#1f2d3d] font-mono">{clutchData.company.hourlyRate}</p>
                    <span className="text-[11px] text-[#6e84a3] mt-1 block">
                        Team: <strong className="text-[#1f2d3d]">{clutchData.company.employeeSize}</strong>
                    </span>
                </Card>

                <Card className="p-4 bg-white border-[#eaedf3] shadow-2xs hover:border-[#354f52]/40 transition-colors">
                    <span className="text-[10px] font-bold text-[#6e84a3] uppercase tracking-wider">Primary Service Focus</span>
                    <p className="mt-1 text-2xl font-black text-[#354f52] font-mono">AI Dev (40%)</p>
                    <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                        +20% Custom Software, +20% IT Managed
                    </span>
                </Card>
            </div>

            {/* Profile Overview Card */}
            <Card className="p-5 bg-white border-[#eaedf3] shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#eaedf3] pb-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-extrabold text-[#1f2d3d]">{clutchData.company.name}</h2>
                            <Badge variant="accent">Clutch Verified Profile</Badge>
                            <span className="text-xs text-[#6e84a3] font-mono">Founded in {clutchData.company.founded}</span>
                        </div>
                        <p className="text-xs font-semibold text-[#354f52] mt-0.5">{clutchData.company.tagline}</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#6e84a3]">
                        <span className="flex items-center gap-1 font-medium">
                            <MapPin className="h-3.5 w-3.5 text-[#354f52]" /> {clutchData.company.headquarters}
                        </span>
                        <span className="text-[#eaedf3]">|</span>
                        <span className="font-mono text-[#1f2d3d]">{clutchData.company.phone}</span>
                    </div>
                </div>

                <p className="text-xs text-[#475569] leading-relaxed">
                    {clutchData.company.summary}
                </p>
            </Card>

            {/* Tabs Navigation */}
            <div className="flex border-b border-[#eaedf3] gap-2 overflow-x-auto bg-white px-2 rounded-t-xl">
                <button
                    onClick={() => setActiveTab("reviews")}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "reviews"
                            ? "border-[#354f52] text-[#354f52]"
                            : "border-transparent text-[#6e84a3] hover:text-[#1f2d3d]"
                    }`}
                >
                    <Star className="h-4 w-4" />
                    Verified Reviews ({clutchData.reviews.length})
                </button>
                <button
                    onClick={() => setActiveTab("focus")}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "focus"
                            ? "border-[#354f52] text-[#354f52]"
                            : "border-transparent text-[#6e84a3] hover:text-[#1f2d3d]"
                    }`}
                >
                    <PieChart className="h-4 w-4" />
                    Services & AI Focus Breakdown
                </button>
                <button
                    onClick={() => setActiveTab("portfolio")}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "portfolio"
                            ? "border-[#354f52] text-[#354f52]"
                            : "border-transparent text-[#6e84a3] hover:text-[#1f2d3d]"
                    }`}
                >
                    <Layers className="h-4 w-4" />
                    Featured Portfolio Case Studies ({clutchData.portfolioCaseStudies.length})
                </button>
                <button
                    onClick={() => setActiveTab("locations")}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "locations"
                            ? "border-[#354f52] text-[#354f52]"
                            : "border-transparent text-[#6e84a3] hover:text-[#1f2d3d]"
                    }`}
                >
                    <MapPin className="h-4 w-4" />
                    Global Offices & Delivery Hubs ({clutchData.locations.length})
                </button>
            </div>

            {/* TAB 1: VERIFIED REVIEWS */}
            {activeTab === "reviews" && (
                <div className="space-y-4">
                    {clutchData.reviews.map((rev) => (
                        <Card key={rev.id} className="p-5 bg-white border-[#eaedf3] shadow-2xs hover:border-[#354f52]/40 transition-colors space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#eaedf3] pb-3">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className="flex text-amber-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-3.5 w-3.5 fill-current" />
                                            ))}
                                        </div>
                                        <span className="font-mono text-sm font-bold text-[#1f2d3d]">{rev.rating.toFixed(1)}</span>
                                        <Badge variant="success">Clutch Verified Review</Badge>
                                        <span className="text-xs font-mono text-[#6e84a3]">Cost: {rev.cost}</span>
                                    </div>
                                    <h3 className="text-base font-extrabold text-[#1f2d3d] mt-1.5">{rev.title}</h3>
                                </div>

                                <div className="text-right sm:shrink-0 text-xs font-mono text-[#6e84a3]">
                                    <span className="block">{rev.dates}</span>
                                    <span className="text-[11px] text-[#95aac9]">{rev.location}</span>
                                </div>
                            </div>

                            {/* Quote Box */}
                            <div className="relative p-3.5 rounded-xl bg-[#f8fafc] border border-[#eaedf3]">
                                <Quote className="h-4 w-4 text-[#354f52]/30 absolute top-2 left-2" />
                                <p className="text-xs font-bold text-[#1f2d3d] italic pl-5 leading-relaxed">
                                    "{rev.quote}"
                                </p>
                                <div className="mt-2 text-right">
                                    <button
                                        onClick={() => handleCopy(rev.id, `"${rev.quote}" — ${rev.reviewer}, ${rev.role} at ${rev.company}`)}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#354f52] hover:underline"
                                    >
                                        {copiedQuoteId === rev.id ? (
                                            <>
                                                <Check className="h-3 w-3 text-emerald-600" />
                                                <span className="text-emerald-600">Copied for Outreach!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3 w-3" />
                                                <span>Copy Quote for Cold Email / Social</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Summary & Review Breakdown */}
                            <p className="text-xs text-[#475569] leading-relaxed">
                                {rev.summary}
                            </p>

                            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#eaedf3] text-xs">
                                <div>
                                    <span className="font-bold text-[#1f2d3d]">{rev.reviewer}</span>
                                    <span className="text-[#6e84a3]"> • {rev.role} at </span>
                                    <strong className="text-[#354f52]">{rev.company}</strong>
                                    <span className="text-[#95aac9] font-mono"> ({rev.companySize})</span>
                                </div>

                                <div className="flex items-center gap-3 font-mono text-[11px] text-[#6e84a3]">
                                    <span>Quality: <strong className="text-emerald-600">{rev.scores.quality}</strong></span>
                                    <span>Schedule: <strong className="text-emerald-600">{rev.scores.schedule}</strong></span>
                                    <span>Cost: <strong className="text-[#1f2d3d]">{rev.scores.cost}</strong></span>
                                    <span>Refer: <strong className="text-[#0077b5]">{rev.scores.refer}</strong></span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* TAB 2: SERVICES & AI FOCUS BREAKDOWN */}
            {activeTab === "focus" && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Service Lines */}
                        <Card className="p-5 bg-white border-[#eaedf3] shadow-2xs space-y-3">
                            <h3 className="text-sm font-bold text-[#1f2d3d] flex items-center justify-between">
                                <span>Service Lines Breakdown</span>
                                <Badge variant="brand">Clutch Certified</Badge>
                            </h3>
                            <div className="space-y-2.5 pt-1">
                                {clutchData.serviceLines.map((s, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-semibold text-[#1f2d3d]">{s.service}</span>
                                            <span className="font-bold text-[#354f52] font-mono">{s.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-[#f1f4f8] h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-[#354f52] h-full rounded-full transition-all"
                                                style={{ width: `${s.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* AI Focus Sub-distribution */}
                        <Card className="p-5 bg-white border-[#eaedf3] shadow-2xs space-y-3">
                            <h3 className="text-sm font-bold text-[#1f2d3d] flex items-center justify-between">
                                <span>AI Core Capabilities (40% Share Breakdown)</span>
                                <span className="text-xs font-mono text-[#0077b5] font-bold">100% of AI Practice</span>
                            </h3>
                            <div className="space-y-2 pt-1">
                                {clutchData.aiFocus.map((ai, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-[#f8fafc]">
                                        <span className="text-[#334155]">{ai.area}</span>
                                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                            {ai.percentage}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Client Size & Industries */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-5 bg-white border-[#eaedf3] shadow-2xs space-y-3">
                            <h3 className="text-sm font-bold text-[#1f2d3d]">Client Headcount & Revenue Size</h3>
                            <div className="grid grid-cols-3 gap-3 pt-1">
                                {clutchData.clientSizeBreakdown.map((cs, idx) => (
                                    <div key={idx} className="p-3 rounded-xl bg-[#f8fafc] border border-[#eaedf3] text-center space-y-1">
                                        <span className="text-[10px] font-bold uppercase text-[#6e84a3] block">{cs.segment}</span>
                                        <span className="text-xl font-black text-[#1f2d3d] font-mono">{cs.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-5 bg-white border-[#eaedf3] shadow-2xs space-y-3">
                            <h3 className="text-sm font-bold text-[#1f2d3d]">Client Industries Distribution</h3>
                            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                                {clutchData.industryFocus.map((ind, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-[#f8fafc] border border-[#eaedf3]">
                                        <span className="text-[#475569] truncate mr-2">{ind.industry}</span>
                                        <span className="font-mono font-bold text-[#354f52]">{ind.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* TAB 3: FEATURED PORTFOLIO CASE STUDIES */}
            {activeTab === "portfolio" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clutchData.portfolioCaseStudies.map((item) => (
                        <Card key={item.id} className="p-5 bg-white border-[#eaedf3] shadow-2xs hover:border-[#354f52]/40 transition-colors flex flex-col justify-between space-y-3">
                            <div>
                                <div className="flex items-center justify-between gap-2">
                                    <Badge variant="accent">{item.service}</Badge>
                                    <span className="text-[11px] font-mono text-[#6e84a3]">{item.industry}</span>
                                </div>
                                <h3 className="text-sm font-bold text-[#1f2d3d] mt-2">{item.title}</h3>
                                <p className="text-xs text-[#475569] leading-relaxed mt-2 bg-[#f8fafc] p-3 rounded-xl border border-[#eaedf3]">
                                    {item.description}
                                </p>
                            </div>

                            <div className="pt-2 border-t border-[#eaedf3] flex items-center justify-between text-xs">
                                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Deployed in Production
                                </span>
                                <button
                                    onClick={() => handleCopy(item.id, `Madiff Case Study: ${item.title} (${item.industry}) - ${item.description}`)}
                                    className="font-bold text-[#354f52] hover:underline flex items-center gap-1 text-[11px]"
                                >
                                    {copiedQuoteId === item.id ? "Copied!" : "Copy Case Summary"}
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* TAB 4: GLOBAL OFFICES & DELIVERY HUBS */}
            {activeTab === "locations" && (
                <div className="space-y-4">
                    <Card className="p-5 bg-white border-[#eaedf3] shadow-2xs space-y-2">
                        <h3 className="text-sm font-bold text-[#1f2d3d]">Global Footprint (6 Strategic Offices)</h3>
                        <p className="text-xs text-[#6e84a3]">
                            Madiff delivers distributed nearshore and offshore engineering pods across 10+ countries with established regional delivery centers and client advisory presence.
                        </p>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {clutchData.locations.map((loc, idx) => (
                            <Card key={idx} className="p-4 bg-white border-[#eaedf3] shadow-2xs hover:border-[#354f52]/40 transition-colors space-y-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#354f52]/10 text-[#354f52]">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[#1f2d3d]">{loc.city}</h4>
                                            <span className="text-xs text-[#6e84a3]">{loc.country}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f1f4f8] text-[#354f52] border border-[#eaedf3]">
                                        {loc.type}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-[#eaedf3] text-xs text-[#475569]">
                                    <span className="font-mono text-[11px]">{loc.address}</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </PagePlaceholder>
    );
}
