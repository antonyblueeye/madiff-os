"use client";

import { useAuth } from "./AuthContext";
import { LoginPage } from "./LoginPage";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#f4f6fa]">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto px-7 py-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
