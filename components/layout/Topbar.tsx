"use client";

import { Search, Bell, Mail, Plus, Globe, ChevronDown, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Topbar() {
    const [searchVal, setSearchVal] = useState("");

    return (
        <header className="flex h-16 items-center justify-between gap-4 border-b border-[#eaedf3] bg-white px-7">
            {/* Search Input (Melody style) */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
                <button className="text-[#6e84a3] hover:text-[#1f2d3d] md:hidden">
                    <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2 rounded-lg bg-[#f4f6fa] border border-[#eaedf3] px-3.5 py-1.5 w-full text-xs text-[#1f2d3d] focus-within:border-[#354f52] focus-within:bg-white transition-all">
                    <Search className="h-4 w-4 text-[#95aac9]" />
                    <input
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        placeholder="Search contacts, sequences, campaigns..."
                        className="bg-transparent text-xs text-[#1f2d3d] outline-none w-full placeholder:text-[#95aac9]"
                    />
                </div>
            </div>

            {/* Actions right (like Melody: + Create new, Lang, Notification badges, Avatar) */}
            <div className="flex items-center gap-3.5">
                <Link
                    href="/apollo-sourcing"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#354f52] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#2f3e46] transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" /> New Lead Search
                </Link>

                <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-2.5 py-1.5 text-xs font-semibold text-[#475569]">
                    <span>Global (EN)</span>
                    <ChevronDown className="h-3 w-3 text-[#95aac9]" />
                </div>

                <div className="relative">
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#eaedf3] bg-white text-[#6e84a3] hover:bg-[#f8fafc] hover:text-[#1f2d3d] transition-colors">
                        <Bell className="h-4 w-4" />
                    </button>
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444] text-[9px] font-bold text-white">
                        4
                    </span>
                </div>

                <div className="relative">
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#eaedf3] bg-white text-[#6e84a3] hover:bg-[#f8fafc] hover:text-[#1f2d3d] transition-colors">
                        <Mail className="h-4 w-4" />
                    </button>
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#354f52] text-[9px] font-bold text-white">
                        12
                    </span>
                </div>

                {/* Profile pill */}
                <div className="flex items-center gap-2 border-l border-[#eaedf3] pl-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2f3e46] text-white text-xs font-bold shadow-sm">
                        M
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-[#95aac9] hidden sm:block" />
                </div>
            </div>
        </header>
    );
}