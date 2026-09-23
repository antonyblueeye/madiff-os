"use client";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { FileCode, ExternalLink, Maximize2, Sparkles, Send } from "lucide-react";
import Link from "next/link";

export default function NewsletterBuilderPage() {
    return (
        <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-[#eaedf3] shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-[#354f52] p-2 text-white">
                        <FileCode className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base font-bold text-[#1f2d3d]">
                                Madiff Email Newsletter Builder
                            </h1>
                            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                Integrated
                            </span>
                        </div>
                        <p className="text-xs text-[#6e84a3]">
                            Visual drag-and-drop constructor with Zoho Campaigns direct export
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href="/newsletter_constructor.html"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs font-semibold text-[#475569] hover:bg-[#f8fafc] transition-colors"
                    >
                        <Maximize2 className="h-3.5 w-3.5" /> Open Fullscreen Window
                    </a>
                </div>
            </div>

            {/* Embedded Iframe of the exact newsletter_constructor.html */}
            <div className="flex-1 rounded-xl border border-[#eaedf3] overflow-hidden bg-white shadow-sm">
                <iframe
                    src="/newsletter_constructor.html"
                    className="w-full h-full border-0"
                    title="Madiff Newsletter Constructor"
                />
            </div>
        </div>
    );
}
