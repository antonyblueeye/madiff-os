"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Share2,
    FileCode,
    CalendarDays,
    Users2,
    Award,
    Layers,
    Activity,
    Settings,
    ChevronRight,
    Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavigation = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/crm", label: "Leads CRM", icon: Users, badge: "Omnichannel" },
    { href: "/zoho-newsletter", label: "Newsletter Analytics", icon: Mail, badge: "Zoho Live" },
    { href: "/campaigns", label: "Campaigns", icon: Share2 },
    { href: "/newsletter-builder", label: "Newsletter Builder", icon: FileCode, badge: "Editor" },
    { href: "/content-plan", label: "Content Calendar", icon: CalendarDays },
    { href: "/ai-communities", label: "AI Communities", icon: Users2, badge: "Groups" },
    { href: "/clutch", label: "Clutch Hub", icon: Award },
    { href: "/integrations", label: "API Gateways", icon: Layers },
];

const secondaryNavigation = [
    { href: "/activity", label: "Activity Log", icon: Activity },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="flex w-64 flex-col border-r border-[#eaedf3] bg-white">
            {/* Brand Logo header */}
            <div className="flex h-18 items-center gap-3 border-b border-[#eaedf3] px-6 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#2f3e46] to-[#52796f] text-white shadow-sm font-bold text-base">
                    M
                </div>
                <div>
                    <div className="text-base font-extrabold tracking-tight text-[#1f2d3d] flex items-center gap-1.5">
                        Madiff <span className="text-xs font-semibold text-[#84a98c]">OS</span>
                    </div>
                    <p className="text-[10px] text-[#95aac9] font-medium tracking-wide uppercase">Outbound Intelligence</p>
                </div>
            </div>

            {/* User profile card inside sidebar */}
            <div className="flex items-center gap-3 border-b border-[#eaedf3] px-6 py-4 bg-[#fafbfc]">
                <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#354f52] text-xs font-bold text-white ring-2 ring-[#eaedf3]">
                        AD
                    </div>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#10b981] ring-2 ring-white" />
                </div>
                <div className="overflow-hidden">
                    <p className="text-xs font-bold text-[#1f2d3d] truncate">Anton D.</p>
                    <p className="text-[11px] text-[#6e84a3] truncate">Super Admin · Madiff</p>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 space-y-6 overflow-y-auto px-3.5 py-4">
                <div>
                    <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#95aac9]">
                        Operations & Growth
                    </div>
                    <nav className="space-y-0.5">
                        {mainNavigation.map((item) => {
                            const Icon = item.icon;
                            const active =
                                item.href === "/"
                                    ? pathname === "/"
                                    : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                                        active
                                            ? "bg-[#354f52] text-white font-semibold shadow-sm"
                                            : "text-[#475569] hover:bg-[#f1f4f8] hover:text-[#1e293b]"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon
                                            className={cn(
                                                "h-4 w-4 transition-colors",
                                                active ? "text-[#cad2c5]" : "text-[#6e84a3] group-hover:text-[#354f52]"
                                            )}
                                        />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span
                                            className={cn(
                                                "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase",
                                                active
                                                    ? "bg-white/20 text-white"
                                                    : "bg-[#84a98c]/20 text-[#354f52]"
                                            )}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div>
                    <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#95aac9]">
                        System
                    </div>
                    <nav className="space-y-0.5">
                        {secondaryNavigation.map((item) => {
                            const Icon = item.icon;
                            const active = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                                        active
                                            ? "bg-[#354f52] text-white font-semibold"
                                            : "text-[#475569] hover:bg-[#f1f4f8] hover:text-[#1e293b]"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon
                                            className={cn(
                                                "h-4 w-4",
                                                active ? "text-[#cad2c5]" : "text-[#6e84a3] group-hover:text-[#354f52]"
                                            )}
                                        />
                                        <span>{item.label}</span>
                                    </div>
                                    <ChevronRight className="h-3 w-3 text-[#95aac9]" />
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Sidebar bottom status indicator */}
            <div className="border-t border-[#eaedf3] p-4 bg-[#fafbfc]">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#1f2d3d]">System Health</span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#10b981]">
                        <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                        Online
                    </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#e2e8f0] overflow-hidden">
                    <div className="h-full w-[96%] bg-[#52796f] rounded-full" />
                </div>
            </div>
        </aside>
    );
}