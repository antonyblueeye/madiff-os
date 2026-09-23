"use client";

import { UserPlus, Clock, Download, CheckCircle2, DollarSign, AlertCircle } from "lucide-react";

interface HeroWidgetProps {
    totalLeads: number;
    avgReplyTime: string;
    emailsSent: number;
    deliveredCount: number;
    pipelineWon: string;
    pendingReviews: number;
}

export function MelodyHeroKPI({
    totalLeads = 54000,
    avgReplyTime = "2.4 hrs",
    emailsSent = 35200,
    deliveredCount = 7500,
    pipelineWon = "$184k",
    pendingReviews = 18,
}: Partial<HeroWidgetProps>) {
    return (
        <div className="hero-kpi-banner overflow-hidden p-6 text-white">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
                {/* 1. New Leads / Users */}
                <div className="px-3 py-2 sm:py-0 first:pl-0">
                    <div className="flex items-center gap-1.5 text-xs text-[#e2e8f0] font-semibold">
                        <UserPlus className="h-4 w-4 text-[#84a98c]" />
                        <span>Sourced Leads</span>
                    </div>
                    <div className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow-sm">
                        {totalLeads.toLocaleString()}
                    </div>
                    <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/25 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200">
                        +14.2% increase
                    </div>
                </div>

                {/* 2. Avg Reply Time */}
                <div className="px-3 py-2 sm:py-0">
                    <div className="flex items-center gap-1.5 text-xs text-[#e2e8f0] font-semibold">
                        <Clock className="h-4 w-4 text-[#84a98c]" />
                        <span>Avg Reply Time</span>
                    </div>
                    <div className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow-sm">
                        {avgReplyTime}
                    </div>
                    <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/25 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200">
                        30% decrease
                    </div>
                </div>

                {/* 3. Emails Sent / Dispatches */}
                <div className="px-3 py-2 sm:py-0">
                    <div className="flex items-center gap-1.5 text-xs text-[#e2e8f0] font-semibold">
                        <Download className="h-4 w-4 text-[#84a98c]" />
                        <span>Sent via Reply</span>
                    </div>
                    <div className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow-sm">
                        {emailsSent.toLocaleString()}
                    </div>
                    <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/25 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200">
                        +18% increase
                    </div>
                </div>

                {/* 4. Delivered & Active */}
                <div className="px-3 py-2 sm:py-0">
                    <div className="flex items-center gap-1.5 text-xs text-[#e2e8f0] font-semibold">
                        <CheckCircle2 className="h-4 w-4 text-[#84a98c]" />
                        <span>Deliverability</span>
                    </div>
                    <div className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow-sm">
                        99.2%
                    </div>
                    <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/25 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200">
                        Top inbox tier
                    </div>
                </div>

                {/* 5. Pipeline / Deals */}
                <div className="px-3 py-2 sm:py-0">
                    <div className="flex items-center gap-1.5 text-xs text-[#e2e8f0] font-semibold">
                        <DollarSign className="h-4 w-4 text-[#84a98c]" />
                        <span>HubSpot Pipeline</span>
                    </div>
                    <div className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow-sm">
                        {pipelineWon}
                    </div>
                    <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/25 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200">
                        +24% increase
                    </div>
                </div>

                {/* 6. Pending / Tasks */}
                <div className="px-3 py-2 sm:py-0 last:pr-0">
                    <div className="flex items-center gap-1.5 text-xs text-[#e2e8f0] font-semibold">
                        <AlertCircle className="h-4 w-4 text-amber-300" />
                        <span>Action Required</span>
                    </div>
                    <div className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow-sm">
                        {pendingReviews}
                    </div>
                    <div className="mt-2 inline-flex items-center rounded-full bg-amber-500/25 border border-amber-400/50 px-2.5 py-0.5 text-[10px] font-bold text-amber-200">
                        Queue review
                    </div>
                </div>
            </div>
        </div>
    );
}
