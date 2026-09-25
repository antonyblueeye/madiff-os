"use client";

import { useState } from "react";
import { useAuth } from "./AuthContext";
import { Lock, User, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

export function LoginPage() {
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const res = await login(username, password);
        if (!res.success) {
            setError(res.error || "Incorrect login or password");
            setLoading(false);
        }
    };

    const handleFillDemo = () => {
        setUsername("admin");
        setPassword("madiff2026");
        setError(null);
    };

    return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#f4f6fa] px-4">
            <div className="w-full max-w-md">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md border border-[#eaedf3] mb-4 overflow-hidden p-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src="/madiffgroup_logo.jpeg" 
                            alt="Madiff Logo" 
                            className="h-full w-full object-cover rounded-xl"
                        />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-[#1f2d3d]">
                        Madiff <span className="text-[#52796f]">Intelligence Hub</span>
                    </h1>
                    <p className="mt-1.5 text-xs text-[#6e84a3] font-medium">
                        Enterprise Outbound & Multi-Channel Growth Operations
                    </p>
                </div>

                {/* Login Card */}
                <div className="rounded-2xl border border-[#eaedf3] bg-white p-8 shadow-sm">
                    <div className="flex items-center justify-between pb-6 border-b border-[#eaedf3] mb-6">
                        <div>
                            <h2 className="text-base font-bold text-[#1f2d3d]">Sign in to your account</h2>
                            <p className="text-xs text-[#95aac9] font-medium mt-0.5">Enter your executive credentials</p>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#cad2c5]/30 text-[#354f52]">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                    </div>

                    {error && (
                        <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#354f52] mb-1.5">
                                Username
                            </label>
                            <div className="relative flex items-center rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3.5 py-2.5 focus-within:border-[#354f52] focus-within:bg-white transition-all">
                                <User className="h-4 w-4 text-[#95aac9] mr-2.5 flex-shrink-0" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="e.g. admin"
                                    required
                                    className="w-full bg-transparent text-xs text-[#1f2d3d] outline-none placeholder:text-[#95aac9]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#354f52] mb-1.5">
                                Password
                            </label>
                            <div className="relative flex items-center rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3.5 py-2.5 focus-within:border-[#354f52] focus-within:bg-white transition-all">
                                <Lock className="h-4 w-4 text-[#95aac9] mr-2.5 flex-shrink-0" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    required
                                    className="w-full bg-transparent text-xs text-[#1f2d3d] outline-none placeholder:text-[#95aac9]"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#354f52] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#2f3e46] transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <>
                                    <span>Sign in to System</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Hint / Demo Autofill */}
                    <div className="mt-6 pt-5 border-t border-[#eaedf3] flex items-center justify-between text-[11px] text-[#6e84a3]">
                        <span>Authorized Madiff Staff Only</span>
                        <button
                            type="button"
                            onClick={handleFillDemo}
                            className="font-bold text-[#354f52] hover:underline"
                        >
                            Autofill (admin)
                        </button>
                    </div>
                </div>

                <div className="mt-6 text-center text-[11px] text-[#95aac9]">
                    &copy; 2026 Madiff Group · All rights reserved.
                </div>
            </div>
        </div>
    );
}
