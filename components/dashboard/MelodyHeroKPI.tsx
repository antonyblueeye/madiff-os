"use client";

import { Users, Building2, Mail, Globe, MessageSquareCheck, ExternalLink } from "lucide-react";

interface HeroWidgetProps {
    totalContacts: number;
    uniqueCompanies: number;
    withEmail: number;
    withLinkedin: number;
    withDomain: number;
    withReplied: number;
}

export function MelodyHeroKPI({
    totalContacts = 40142,
    uniqueCompanies = 17221,
    withEmail = 21383,
    withLinkedin = 30365,
    withDomain = 23747,
    withReplied = 228,
}: Partial<HeroWidgetProps>) {
    const emailPercentage = totalContacts > 0 ? Math.round((withEmail / totalContacts) * 100) : 0;
    const linkedinPercentage = totalContacts > 0 ? Math.round((withLinkedin / totalContacts) * 100) : 0;

    return (
        <div className="hero-kpi-banner overflow-hidden p-6 text-white rounded-2xl shadow-lg">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
                {/* 1. Total Contacts in DB */}
                <div className="px-3 py-2 sm:py-0 first:pl-0">
                    <div className="flex items-center gap-1.5 text-xs text-[#e2e8f0] font-semibold">
                        <Users className="h-4 w-4 text-[#84a98c]" />
                        <span>Total Contacts</span>
                    </div>
                    <div className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow-sm">
                        {totalContacts.toLocaleString()}
                    </div>
                    <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/25 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200">
                        Live PostgreSQL DB
                    </div>
                </div>

                {/* 2. Unique Companies */}
                <div className="px-3 py-2 sm:py-0">
                    <div className="flex items-center gap-1.5 text-xs text-[#e2e8f0] font-semibold">
                        <Building2 className="h-4 w-4 text-[#84a98c]" />
                        <span>Unique Companies</span>
                    </div>
                    <div className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow-sm">
                        {uniqueCompanies.toLocaleString()}
                    </div>
                    <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/25 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200">
                        Distinct Accounts
                    </div>
                </div>

                {/* 3. Verified Emails */}
                <div className="px-3 py-2 sm:py-0">
                    <div className="flex items-center gap-1.5 text-xs text-[#e2e8f0] font-semibold">
                        <Mail className="h-4 w-4 text-[#84a98c]" />
                        <span>Verified Emails</span>
                    </div>
                    <div className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow-sm">
                        {withEmail.toLocaleString()}
                    </div>
                    <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/25 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200">
                        {emailPercentage}% coverage
                    </div>
                </div>

                {/* 4. LinkedIn Profiles */}
                <div className="px-3 py-2 sm:py-0">
                    <div className="flex items-center gap-1.5 text-xs text-[#e2e8f0] font-semibold">
                        <ExternalLink className="h-4 w-4 text-[#84a98c]" />
                        <span>LinkedIn Profiles</span>
                    </div>
                    <div className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow-sm">
                        {withLinkedin.toLocaleString()}
                    </div>
                    <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/25 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200">
                        {linkedinPercentage}% of database
                    </div>
                </div>

                {/* 5. Company Domains */}
                <div className="px-3 py-2 sm:py-0">
                    <div className="flex items-center gap-1.5 text-xs text-[#e2e8f0] font-semibold">
                        <Globe className="h-4 w-4 text-[#84a98c]" />
                        <span>Company Domains</span>
                    </div>
                    <div className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow-sm">
                        {withDomain.toLocaleString()}
                    </div>
                    <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/25 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200">
                        Enriched Domains
                    </div>
                </div>

                {/* 6. Engaged / Replied */}
                <div className="px-3 py-2 sm:py-0">
                    <div className="flex items-center gap-1.5 text-xs text-[#e2e8f0] font-semibold">
                        <MessageSquareCheck className="h-4 w-4 text-[#84a98c]" />
                        <span>Total Replied</span>
                    </div>
                    <div className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow-sm">
                        {withReplied.toLocaleString()}
                    </div>
                    <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/25 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200">
                        Positive Responses
                    </div>
                </div>
            </div>
        </div>
    );
}
