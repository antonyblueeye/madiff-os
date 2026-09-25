"use client";

import {
    Search,
    Bell,
    Plus,
    Globe,
    ChevronDown,
    Menu,
    LogOut,
    Settings,
    User,
    CheckCircle2,
    RefreshCw,
    Send,
    ExternalLink,
    Clock,
    X,
    Shield,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthContext";

interface NotificationItem {
    id: string;
    type: "webhook" | "sync" | "push" | string;
    source: string;
    title: string;
    description: string;
    time: string;
    rawDate: string;
    status: "success" | "info" | "accent" | "error";
    read?: boolean;
}

export function Topbar() {
    const { user, logout } = useAuth();
    const [searchVal, setSearchVal] = useState("");

    // Dropdown states
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState("en");

    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifLoading, setNotifLoading] = useState(false);

    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Refs for outside click handling
    const langRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setNotifLoading(true);
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (e) {
            console.warn("Could not fetch notifications:", e);
        } finally {
            setNotifLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // 1 minute auto refresh
        return () => clearInterval(interval);
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (langRef.current && !langRef.current.contains(event.target as Node)) {
                setIsLangOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAllRead = () => {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    return (
        <header className="relative z-30 flex h-16 items-center justify-between gap-4 border-b border-[#eaedf3] bg-white px-7">
            {/* Search Input */}
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

            {/* Actions right */}
            <div className="flex items-center gap-3.5">
                <Link
                    href="/apollo-sourcing"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#354f52] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#2f3e46] transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" /> New Lead Search
                </Link>

                {/* Language Dropdown */}
                <div className="relative" ref={langRef}>
                    <button
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className="flex items-center gap-1.5 rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-2.5 py-1.5 text-xs font-semibold text-[#475569] hover:bg-[#edf2f7] transition-colors"
                    >
                        <Globe className="h-3.5 w-3.5 text-[#95aac9]" />
                        <span>{selectedLang === "en" ? "Global (EN)" : "Polski (PL)"}</span>
                        <ChevronDown className={`h-3 w-3 text-[#95aac9] transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isLangOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#eaedf3] bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95 duration-100">
                            <button
                                onClick={() => {
                                    setSelectedLang("en");
                                    setIsLangOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                    selectedLang === "en"
                                        ? "bg-[#f4f6fa] text-[#1f2d3d] font-bold"
                                        : "text-[#6e84a3] hover:bg-[#fafbfc] hover:text-[#1f2d3d]"
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="text-base leading-none">🇬🇧</span> English
                                </span>
                                {selectedLang === "en" && <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" />}
                            </button>

                            <div className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-[#95aac9] cursor-not-allowed">
                                <span className="flex items-center gap-2">
                                    <span className="text-base leading-none">🇵🇱</span> Polski
                                </span>
                                <span className="rounded bg-[#fef3c7] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#b45309]">
                                    Pending
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notifications Bell Dropdown */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => {
                            setIsNotifOpen(!isNotifOpen);
                            if (!isNotifOpen) {
                                fetchNotifications();
                            }
                        }}
                        className={`relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#eaedf3] transition-colors ${
                            isNotifOpen ? "bg-[#f4f6fa] text-[#1f2d3d]" : "bg-white text-[#6e84a3] hover:bg-[#f8fafc] hover:text-[#1f2d3d]"
                        }`}
                        title="Activity Notifications"
                    >
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444] text-[9px] font-bold text-white shadow-sm">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#eaedf3] bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                            {/* Notification Header */}
                            <div className="flex items-center justify-between border-b border-[#eaedf3] px-4 py-3 bg-[#fafbfc]">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xs font-bold text-[#1f2d3d]">System Activity Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="rounded-full bg-[#354f52]/10 px-2 py-0.5 text-[10px] font-bold text-[#354f52]">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            className="text-[11px] font-medium text-[#354f52] hover:underline"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    <button
                                        onClick={fetchNotifications}
                                        className="text-[#95aac9] hover:text-[#1f2d3d]"
                                        title="Refresh notifications"
                                    >
                                        <RefreshCw className={`h-3.5 w-3.5 ${notifLoading ? "animate-spin" : ""}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Notification List */}
                            <div className="max-h-[380px] overflow-y-auto divide-y divide-[#eaedf3]/60">
                                {notifications.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-[#95aac9]">
                                        No recent activity recorded
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className="p-3.5 hover:bg-[#fafbfc] transition-colors flex items-start gap-3"
                                        >
                                            <div
                                                className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${
                                                    n.type === "webhook"
                                                        ? "bg-[#0284c7]/10 text-[#0284c7]"
                                                        : n.type === "sync"
                                                        ? "bg-[#10b981]/10 text-[#10b981]"
                                                        : "bg-[#f59e0b]/10 text-[#f59e0b]"
                                                }`}
                                            >
                                                {n.type === "webhook" ? (
                                                    <Send className="h-3.5 w-3.5" />
                                                ) : n.type === "sync" ? (
                                                    <RefreshCw className="h-3.5 w-3.5" />
                                                ) : (
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">
                                                        {n.source}
                                                    </span>
                                                    <span className="text-[10px] text-[#95aac9] flex items-center gap-1 font-mono">
                                                        <Clock className="h-2.5 w-2.5" /> {n.time}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-bold text-[#1f2d3d] truncate">{n.title}</p>
                                                <p className="text-[11px] text-[#6e84a3] leading-snug line-clamp-2 mt-0.5">
                                                    {n.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Notification Footer */}
                            <div className="border-t border-[#eaedf3] bg-[#fafbfc] px-4 py-2.5 text-center">
                                <Link
                                    href="/activity"
                                    onClick={() => setIsNotifOpen(false)}
                                    className="text-xs font-bold text-[#354f52] hover:underline flex items-center justify-center gap-1"
                                >
                                    <span>Open Full Audit Trail</span>
                                    <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Pill & Settings / Logout Dropdown */}
                <div className="relative border-l border-[#eaedf3] pl-3" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 rounded-xl p-1 hover:bg-[#f8fafc] transition-colors focus:outline-none"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#2f3e46] to-[#52796f] text-white text-xs font-bold shadow-sm ring-1 ring-[#eaedf3]">
                            {user?.avatarInitials || "AS"}
                        </div>
                        <div className="hidden lg:block text-left mr-1">
                            <p className="text-xs font-bold text-[#1f2d3d] leading-none">{user?.name || "Anton Synieokyi"}</p>
                            <p className="text-[10px] text-[#95aac9] font-medium mt-0.5">Super Admin</p>
                        </div>
                        <ChevronDown className={`h-3.5 w-3.5 text-[#95aac9] transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#eaedf3] bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                            {/* User Header */}
                            <div className="px-3 py-2.5 border-b border-[#eaedf3] mb-1">
                                <p className="text-xs font-bold text-[#1f2d3d]">{user?.name || "Anton Synieokyi"}</p>
                                <p className="text-[11px] text-[#6e84a3]">{user?.username || "admin"} · Madiff Group</p>
                            </div>

                            {/* Navigation links */}
                            <div className="space-y-0.5 py-1">
                                <Link
                                    href="/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#475569] hover:bg-[#f4f6fa] hover:text-[#1f2d3d] transition-colors"
                                >
                                    <Settings className="h-3.5 w-3.5 text-[#6e84a3]" />
                                    <span>System Settings</span>
                                </Link>

                                <Link
                                    href="/activity"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#475569] hover:bg-[#f4f6fa] hover:text-[#1f2d3d] transition-colors"
                                >
                                    <Shield className="h-3.5 w-3.5 text-[#6e84a3]" />
                                    <span>Security & Audit Log</span>
                                </Link>
                            </div>

                            {/* Logout Action */}
                            <div className="border-t border-[#eaedf3] pt-1 mt-1">
                                <button
                                    onClick={async () => {
                                        setIsProfileOpen(false);
                                        await logout();
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                    <span>Log out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}