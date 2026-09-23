"use client";

import { Sparkles, Command, ArrowRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function AICommandBar() {
    const [value, setValue] = useState("");

    return (
        <div className="relative flex-1 max-w-2xl">
            <div className="group flex items-center gap-2.5 rounded-xl border border-[#354f52]/80 bg-[#1f2c31]/80 px-3.5 py-2 transition-all duration-200 focus-within:border-[#84a98c] focus-within:bg-[#25353c] focus-within:ring-2 focus-within:ring-[#84a98c]/20">
                <Sparkles className="h-4 w-4 text-[#84a98c] transition-transform group-hover:scale-110" />
                <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Ask Madiff Copilot: 'Sync Apollo leads with Reply.io' or 'Check bounce rate'..."
                    className="flex-1 bg-transparent text-xs text-[#cad2c5] outline-none placeholder:text-[#cad2c5]/40"
                />
                <div className="flex items-center gap-1.5">
                    {value ? (
                        <button className="flex items-center gap-1 rounded-lg bg-[#84a98c] px-2 py-0.5 text-xs font-semibold text-[#182226] hover:bg-[#96bc9e]">
                            Run <ArrowRight className="h-3 w-3" />
                        </button>
                    ) : (
                        <kbd className="hidden items-center gap-1 rounded-md border border-[#52796f]/40 bg-[#2f3e46]/60 px-2 py-0.5 text-[10px] font-mono text-[#cad2c5]/70 md:flex">
                            <Command className="h-3 w-3" />K
                        </kbd>
                    )}
                </div>
            </div>
        </div>
    );
}