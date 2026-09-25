"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    user: {
        username: string;
        name: string;
        role: string;
        avatarInitials: string;
    } | null;
    login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    login: async () => ({ success: false }),
    logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<{
        username: string;
        name: string;
        role: string;
        avatarInitials: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check localStorage or cookie on initial load
        try {
            const stored = localStorage.getItem("madiff_user_session");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed?.authenticated) {
                    setIsAuthenticated(true);
                    setUser(parsed.user);
                }
            } else {
                // If cookie exists
                const hasCookie = document.cookie.includes("madiff_auth_token");
                if (hasCookie) {
                    const defaultUser = {
                        username: "admin",
                        name: "Anton Synieokyi",
                        role: "Super Admin",
                        avatarInitials: "AS",
                    };
                    setIsAuthenticated(true);
                    setUser(defaultUser);
                    localStorage.setItem("madiff_user_session", JSON.stringify({ authenticated: true, user: defaultUser }));
                }
            }
        } catch (e) {
            console.warn("Auth parse error:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setIsAuthenticated(true);
                setUser(data.user);
                localStorage.setItem(
                    "madiff_user_session",
                    JSON.stringify({ authenticated: true, user: data.user })
                );
                return { success: true };
            }
            return { success: false, error: data.error || "Invalid username or password" };
        } catch (err: any) {
            return { success: false, error: err.message || "Login request failed" };
        }
    };

    const logout = async () => {
        try {
            await fetch("/api/auth/login", { method: "DELETE" });
        } catch {
            // ignore
        }
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("madiff_user_session");
        document.cookie = "madiff_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {loading ? (
                <div className="flex h-screen w-screen items-center justify-center bg-[#f4f6fa]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-9 w-9 animate-spin rounded-full border-3 border-[#354f52] border-t-transparent" />
                        <span className="text-xs font-semibold text-[#6e84a3]">Loading Madiff Outbound Hub...</span>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
