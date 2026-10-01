"use client";

import React, { useState, useEffect } from "react";
import {
    Zap,
    Play,
    Pause,
    Plus,
    RefreshCw,
    Trash2,
    CheckCircle2,
    SlidersHorizontal,
    Sparkles,
    Building2,
    Mail,
    Users,
    Globe,
    Cpu,
    Filter,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Calendar,
    ArrowRight,
    Search
} from "lucide-react";
import { OutboundEngineConfig, EngineRunStepLog } from "@/lib/engine-orchestrator";

export default function EnginesPage() {
    const [engines, setEngines] = useState<OutboundEngineConfig[]>([]);
    const [replyCampaigns, setReplyCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [runningEngineId, setRunningEngineId] = useState<number | null>(null);
    const [selectedEngineLogs, setSelectedEngineLogs] = useState<{ id: number; logs: EngineRunStepLog[] } | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [targetRole, setTargetRole] = useState("Senior AI Engineer");
    const [roleDescription, setRoleDescription] = useState(
        "Commercial experience building LLM pipelines, PyTorch, LangChain or fine-tuning models in Python. Exclude UI designers, civil engineers, or unrelated hardware engineers."
    );
    const [scrapeKeywords, setScrapeKeywords] = useState("AI engineer, Machine Learning, LLM");
    const [scrapeLocation, setScrapeLocation] = useState("Poland");
    const [targetTitles, setTargetTitles] = useState("CTO, VP of Engineering, Head of AI, Engineering Manager");
    const [targetIndustries, setTargetIndustries] = useState("Software, Information Technology, Financial Services");
    const [employeeRanges, setEmployeeRanges] = useState("11-50, 51-200, 201-500");
    const [leadsPerRun, setLeadsPerRun] = useState(25);
    const [replyMode, setReplyMode] = useState<"existing" | "new">("existing");
    const [replyCampaignId, setReplyCampaignId] = useState<string>("");
    const [newSeqName, setNewSeqName] = useState("");
    const [emailSubject, setEmailSubject] = useState("Quick question regarding your AI Engineer opening at {{company}}");
    const [emailBody, setEmailBody] = useState(
        "Hi {{firstName}},\n\nSaw that your team is expanding and actively hiring for an AI Engineer.\n\nWe specialize in accelerating technical hiring and providing senior pre-vetted AI talent on flexible models.\n\nWould you be open to a 10-minute intro call this week to see if we can assist?\n\nBest,\nAnton"
    );
    const [frequency, setFrequency] = useState<"daily" | "hourly" | "weekly" | "manual">("daily");
    const [runImmediately, setRunImmediately] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadEngines();
    }, []);

    async function loadEngines() {
        try {
            setLoading(true);
            const res = await fetch("/api/engines");
            const data = await res.json();
            if (data.success) {
                setEngines(data.engines || []);
                setReplyCampaigns(data.replyCampaigns || []);
            }
        } catch (err) {
            console.error("Failed to load engines:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleRunEngine(id: number) {
        setRunningEngineId(id);
        try {
            const res = await fetch("/api/engines", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "run", engineId: id }),
            });
            const data = await res.json();
            if (data.success && data.runResult) {
                setSelectedEngineLogs({ id, logs: data.runResult.logs || [] });
                await loadEngines();
            } else {
                alert(`Error executing engine: ${data.error || "Unknown error"}`);
            }
        } catch (err: any) {
            alert(`Execution failed: ${err.message}`);
        } finally {
            setRunningEngineId(null);
        }
    }

    async function handleToggleStatus(id: number) {
        try {
            const res = await fetch("/api/engines", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "toggle_status", engineId: id }),
            });
            const data = await res.json();
            if (data.success) {
                setEngines((prev) =>
                    prev.map((e) => (e.id === id ? { ...e, status: data.status } : e))
                );
            }
        } catch (err) {
            console.error("Failed to toggle engine status:", err);
        }
    }

    async function handleDeleteEngine(id: number, eName: string) {
        if (!confirm(`Are you sure you want to delete engine "${eName}"?`)) return;
        try {
            const res = await fetch(`/api/engines?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setEngines((prev) => prev.filter((e) => e.id !== id));
            }
        } catch (err) {
            console.error("Failed to delete engine:", err);
        }
    }

    async function handleCreateEngine(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const selectedCampaignObj = replyCampaigns.find((c) => String(c.id) === String(replyCampaignId));

            const payload = {
                name,
                targetRole,
                roleDescription,
                scrapeKeywords: scrapeKeywords.split(",").map((s) => s.trim()).filter(Boolean),
                scrapeLocation,
                targetTitles: targetTitles.split(",").map((s) => s.trim()).filter(Boolean),
                targetIndustries: targetIndustries.split(",").map((s) => s.trim()).filter(Boolean),
                employeeRanges: employeeRanges.split(",").map((s) => s.trim()).filter(Boolean),
                leadsPerRun,
                replyCampaignId: replyMode === "existing" && replyCampaignId ? Number(replyCampaignId) : null,
                replyCampaignName: replyMode === "existing" ? selectedCampaignObj?.name || null : newSeqName || `Engine - ${name}`,
                emailSubject: replyMode === "new" ? emailSubject : null,
                emailBody: replyMode === "new" ? emailBody : null,
                frequency,
                runImmediately,
            };

            const res = await fetch("/api/engines", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                setShowCreateModal(false);
                if (data.initialRunResult) {
                    setSelectedEngineLogs({ id: data.engine.id, logs: data.initialRunResult.logs || [] });
                }
                await loadEngines();
            } else {
                alert(`Error: ${data.error || "Failed to create engine"}`);
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="flex-1 space-y-6 p-8 bg-[#f8fafc] min-h-screen text-[#1f2d3d]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#eaedf3] pb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#354f52]/10 rounded-lg text-[#354f52]">
                            <Zap className="h-6 w-6 text-[#354f52]" />
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-[#1f2d3d]">
                            Outbound Engines <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#84a98c]/20 text-[#354f52]">Autonomous AI Sourcing</span>
                        </h1>
                    </div>
                    <p className="mt-1 text-xs text-[#6e84a3]">
                        Multi-portal scraping &rarr; Gemini 3.8 Flash AI Qualification &rarr; Apollo Decision-Maker Discovery &rarr; CRM Sync &rarr; Reply.io Sequence Enrollment.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadEngines}
                        disabled={loading}
                        className="px-3.5 py-2 bg-white border border-[#eaedf3] hover:bg-[#f8fafc] text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm text-[#475569]"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                        <span>Refresh</span>
                    </button>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-[#354f52] hover:bg-[#283d3f] text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Create New Engine</span>
                    </button>
                </div>
            </div>

            {/* Architecture Workflow Infographic */}
            <div className="bg-white rounded-xl border border-[#eaedf3] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-[#6e84a3]">
                    <span>Engine Pipeline Stages</span>
                    <span className="text-[11px] text-[#84a98c] flex items-center gap-1 font-semibold lowercase">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        end-to-end active
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-[#fafbfc] rounded-lg border border-[#f1f4f8]">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#1f2d3d] mb-1">
                            <span className="h-5 w-5 rounded-full bg-[#354f52] text-white flex items-center justify-center text-[10px]">1</span>
                            <span>Scrape 5 Gateways</span>
                        </div>
                        <p className="text-[11px] text-[#6e84a3] leading-relaxed">
                            Collects live job postings from NoFluffJobs, Remotive, Jobicy, RemoteOK and WWR.
                        </p>
                    </div>

                    <div className="p-3 bg-[#fafbfc] rounded-lg border border-[#84a98c]/30 bg-emerald-50/20">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 mb-1">
                            <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                            <span>Gemini 3.8 AI Filter</span>
                        </div>
                        <p className="text-[11px] text-[#6e84a3] leading-relaxed">
                            Disqualifies false positives (e.g. Design Engineers) & verifies ideal tech stack.
                        </p>
                    </div>

                    <div className="p-3 bg-[#fafbfc] rounded-lg border border-[#f1f4f8]">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#1f2d3d] mb-1">
                            <span className="h-5 w-5 rounded-full bg-[#354f52] text-white flex items-center justify-center text-[10px]">3</span>
                            <span>Apollo Lead Discovery</span>
                        </div>
                        <p className="text-[11px] text-[#6e84a3] leading-relaxed">
                            Finds CTOs, VPs, Founders of hiring companies and unlocks verified work emails.
                        </p>
                    </div>

                    <div className="p-3 bg-[#fafbfc] rounded-lg border border-[#f1f4f8]">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#1f2d3d] mb-1">
                            <span className="h-5 w-5 rounded-full bg-[#354f52] text-white flex items-center justify-center text-[10px]">4</span>
                            <span>Reply.io & CRM Push</span>
                        </div>
                        <p className="text-[11px] text-[#6e84a3] leading-relaxed">
                            Enrolls leads into outreach campaigns & stores deduplicated profiles in local CRM.
                        </p>
                    </div>
                </div>
            </div>

            {/* Engines List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#6e84a3] px-1 font-medium">
                    <span>Configured Engines ({engines.length})</span>
                    <span>Recurring Schedule: Daily automated execution</span>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xl border border-[#eaedf3] p-12 text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-[#84a98c] mb-3" />
                        <p className="text-xs text-[#6e84a3]">Loading engines from database...</p>
                    </div>
                ) : engines.length === 0 ? (
                    <div className="bg-white rounded-xl border border-dashed border-[#eaedf3] p-12 text-center">
                        <Zap className="h-10 w-10 mx-auto text-[#cad2c5] mb-3" />
                        <h3 className="text-sm font-bold text-[#1f2d3d]">No Outbound Engines Yet</h3>
                        <p className="text-xs text-[#6e84a3] mt-1 max-w-sm mx-auto">
                            Create your first autonomous engine. It will continuously monitor job boards for vacancies and find decision makers for outreach.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 px-4 py-2 bg-[#354f52] text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-sm"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Create Engine</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {engines.map((eng) => {
                            const isRunning = runningEngineId === eng.id;
                            const stats = eng.stats || { totalScraped: 0, aiApproved: 0, aiRejected: 0, leadsFound: 0, pushedToReply: 0 };

                            return (
                                <div
                                    key={eng.id}
                                    className={`bg-white rounded-xl border transition-all p-5 ${
                                        eng.status === "active" ? "border-[#eaedf3] hover:border-[#84a98c]" : "border-slate-200 bg-slate-50/50 opacity-80"
                                    }`}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                        {/* Main details */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                        eng.status === "active"
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : "bg-slate-100 text-slate-600 border border-slate-200"
                                                    }`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${eng.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                                                    {eng.status === "active" ? "Running / Active" : "Paused"}
                                                </span>

                                                <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#f1f4f8] text-[#354f52] rounded-md">
                                                    Frequency: {eng.frequency || "Daily"}
                                                </span>

                                                {eng.reply_campaign_name && (
                                                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100 flex items-center gap-1">
                                                        <Mail className="h-2.5 w-2.5" />
                                                        Campaign: {eng.reply_campaign_name}
                                                    </span>
                                                )}

                                                <span className="text-[11px] text-[#95aac9] ml-auto">
                                                    Last Run: {eng.last_run_at ? new Date(eng.last_run_at).toLocaleString() : "Never"}
                                                </span>
                                            </div>

                                            <div>
                                                <h3 className="text-base font-bold text-[#1f2d3d] flex items-center gap-2">
                                                    {eng.name}
                                                    <span className="text-xs font-normal text-[#6e84a3]">
                                                        &bull; Hiring: <b>{eng.target_role}</b>
                                                    </span>
                                                </h3>
                                                <p className="text-xs text-[#475569] mt-1 line-clamp-2 bg-[#f8fafc] p-2 rounded-lg border border-[#f1f4f8]">
                                                    <b>AI Evaluation Criteria:</b> {eng.role_description}
                                                </p>
                                            </div>

                                            {/* Sourcing target filters preview */}
                                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6e84a3]">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3 text-[#354f52]" />
                                                    Target titles: <b>{(eng.target_titles || []).slice(0, 3).join(", ")}</b>
                                                </span>
                                                <span>&bull;</span>
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="h-3 w-3 text-[#354f52]" />
                                                    Industries: <b>{(eng.target_industries || []).slice(0, 2).join(", ") || "Any"}</b>
                                                </span>
                                                <span>&bull;</span>
                                                <span>Limit: <b>{eng.leads_per_run || 25} leads/run</b></span>
                                            </div>

                                            {/* Metrics Stats row */}
                                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[#f1f4f8]">
                                                <div className="p-2 rounded-lg bg-[#fafbfc] border border-[#eaedf3]/60 text-center">
                                                    <div className="text-[10px] text-[#95aac9] uppercase font-bold">Scraped</div>
                                                    <div className="text-sm font-extrabold text-[#1f2d3d]">{stats.totalScraped}</div>
                                                </div>
                                                <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 text-center">
                                                    <div className="text-[10px] text-emerald-600 uppercase font-bold">AI Approved</div>
                                                    <div className="text-sm font-extrabold text-emerald-700">{stats.aiApproved}</div>
                                                </div>
                                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
                                                    <div className="text-[10px] text-slate-500 uppercase font-bold">AI Filtered</div>
                                                    <div className="text-sm font-extrabold text-slate-600">{stats.aiRejected}</div>
                                                </div>
                                                <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100 text-center">
                                                    <div className="text-[10px] text-blue-600 uppercase font-bold">Leads Found</div>
                                                    <div className="text-sm font-extrabold text-blue-700">{stats.leadsFound}</div>
                                                </div>
                                                <div className="p-2 rounded-lg bg-purple-50/50 border border-purple-100 text-center">
                                                    <div className="text-[10px] text-purple-600 uppercase font-bold">Pushed to Reply</div>
                                                    <div className="text-sm font-extrabold text-purple-700">{stats.pushedToReply}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions block */}
                                        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#eaedf3] min-w-[150px]">
                                            <button
                                                onClick={() => handleRunEngine(eng.id)}
                                                disabled={isRunning}
                                                className="w-full px-3.5 py-2 bg-[#354f52] hover:bg-[#283d3f] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                                            >
                                                {isRunning ? (
                                                    <>
                                                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                                        <span>Running Pipeline...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="h-3.5 w-3.5 fill-white" />
                                                        <span>Run Now</span>
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => handleToggleStatus(eng.id)}
                                                className={`w-full px-3.5 py-1.5 border text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                                                    eng.status === "active"
                                                        ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                                        : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                                }`}
                                            >
                                                {eng.status === "active" ? (
                                                    <>
                                                        <Pause className="h-3 w-3" />
                                                        <span>Pause Engine</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="h-3 w-3" />
                                                        <span>Resume Engine</span>
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => handleDeleteEngine(eng.id, eng.name)}
                                                className="p-1.5 text-[#95aac9] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto lg:ml-0"
                                                title="Delete Engine"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Execution logs collapse if available */}
                                    {selectedEngineLogs?.id === eng.id && (
                                        <div className="mt-4 pt-4 border-t border-[#f1f4f8] bg-[#fafbfc] p-3.5 rounded-lg">
                                            <div className="flex items-center justify-between text-xs font-bold text-[#1f2d3d] mb-2">
                                                <span className="flex items-center gap-1">
                                                    <Sparkles className="h-3.5 w-3.5 text-[#84a98c]" /> Latest Execution Live Logs
                                                </span>
                                                <button
                                                    onClick={() => setSelectedEngineLogs(null)}
                                                    className="text-[11px] text-[#95aac9] hover:text-[#1f2d3d]"
                                                >
                                                    Hide logs
                                                </button>
                                            </div>
                                            <div className="space-y-1.5 max-h-56 overflow-y-auto font-mono text-[11px]">
                                                {selectedEngineLogs.logs.map((log, lIdx) => (
                                                    <div
                                                        key={lIdx}
                                                        className={`flex items-start gap-2 p-1.5 rounded ${
                                                            log.status === "success"
                                                                ? "bg-emerald-50/80 text-emerald-800"
                                                                : log.status === "error"
                                                                ? "bg-red-50 text-red-800"
                                                                : log.status === "warning"
                                                                ? "bg-amber-50 text-amber-800"
                                                                : "bg-white text-slate-700"
                                                        }`}
                                                    >
                                                        <span className="font-bold uppercase text-[9px] px-1 py-0.2 bg-black/5 rounded">
                                                            {log.step}
                                                        </span>
                                                        <span className="flex-1">{log.message}</span>
                                                        <span className="text-[9px] text-[#95aac9]">
                                                            {new Date(log.timestamp).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* CREATE ENGINE MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl border border-[#eaedf3] shadow-xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-[#eaedf3] pb-4 mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-[#1f2d3d] flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-[#354f52]" />
                                    Configure Outbound Engine
                                </h2>
                                <p className="text-xs text-[#6e84a3]">
                                    Setup automated scraping, Gemini AI qualification, Apollo sourcing and Reply.io campaign enrollment.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleCreateEngine} className="space-y-4">
                            {/* Step 1: Vacancy Target */}
                            <div className="space-y-3 p-4 rounded-xl bg-[#fafbfc] border border-[#eaedf3]">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#354f52] flex items-center gap-1.5">
                                    <span className="h-4 w-4 rounded-full bg-[#354f52] text-white flex items-center justify-center text-[9px]">1</span>
                                    Target Hiring Vacancy & AI Prompt
                                </span>

                                <div>
                                    <label className="text-xs font-bold text-[#1f2d3d]">Engine Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Polish AI Engineer Hiring Engine"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 bg-white border border-[#eaedf3] rounded-lg text-xs font-medium focus:outline-none focus:border-[#354f52]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-[#1f2d3d]">Target Role Title</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Senior AI Engineer"
                                            value={targetRole}
                                            onChange={(e) => setTargetRole(e.target.value)}
                                            className="w-full mt-1 px-3 py-2 bg-white border border-[#eaedf3] rounded-lg text-xs font-medium focus:outline-none focus:border-[#354f52]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-[#1f2d3d]">Scraping Keywords</label>
                                        <input
                                            type="text"
                                            placeholder="AI Engineer, Machine Learning, LLM"
                                            value={scrapeKeywords}
                                            onChange={(e) => setScrapeKeywords(e.target.value)}
                                            className="w-full mt-1 px-3 py-2 bg-white border border-[#eaedf3] rounded-lg text-xs font-medium focus:outline-none focus:border-[#354f52]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-[#1f2d3d] flex items-center justify-between">
                                        <span>Role Description & Gemini AI Qualification Rules</span>
                                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                            <Sparkles className="h-3 w-3" /> Gemini 3.8 Flash Powered
                                        </span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        required
                                        placeholder="Describe ideal skills and explicitly state what to reject (e.g. 'Must have commercial Python/PyTorch/LLM. Reject civil engineers, sales engineers and UI designers')."
                                        value={roleDescription}
                                        onChange={(e) => setRoleDescription(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 bg-white border border-[#eaedf3] rounded-lg text-xs font-medium focus:outline-none focus:border-[#354f52]"
                                    />
                                </div>
                            </div>

                            {/* Step 2: Apollo Sourcing */}
                            <div className="space-y-3 p-4 rounded-xl bg-[#fafbfc] border border-[#eaedf3]">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#354f52] flex items-center gap-1.5">
                                    <span className="h-4 w-4 rounded-full bg-[#354f52] text-white flex items-center justify-center text-[9px]">2</span>
                                    Apollo Decision-Maker Targeting
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-[#1f2d3d]">Target Person Titles</label>
                                        <input
                                            type="text"
                                            placeholder="CTO, VP of Engineering, Head of AI"
                                            value={targetTitles}
                                            onChange={(e) => setTargetTitles(e.target.value)}
                                            className="w-full mt-1 px-3 py-2 bg-white border border-[#eaedf3] rounded-lg text-xs font-medium focus:outline-none focus:border-[#354f52]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-[#1f2d3d]">Industries to Target</label>
                                        <input
                                            type="text"
                                            placeholder="Software, Information Technology"
                                            value={targetIndustries}
                                            onChange={(e) => setTargetIndustries(e.target.value)}
                                            className="w-full mt-1 px-3 py-2 bg-white border border-[#eaedf3] rounded-lg text-xs font-medium focus:outline-none focus:border-[#354f52]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-[#1f2d3d]">Company Size (Employees)</label>
                                        <input
                                            type="text"
                                            placeholder="11-50, 51-200, 201-500"
                                            value={employeeRanges}
                                            onChange={(e) => setEmployeeRanges(e.target.value)}
                                            className="w-full mt-1 px-3 py-2 bg-white border border-[#eaedf3] rounded-lg text-xs font-medium focus:outline-none focus:border-[#354f52]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-[#1f2d3d]">Max Leads per Run</label>
                                        <input
                                            type="number"
                                            min={5}
                                            max={100}
                                            value={leadsPerRun}
                                            onChange={(e) => setLeadsPerRun(Number(e.target.value))}
                                            className="w-full mt-1 px-3 py-2 bg-white border border-[#eaedf3] rounded-lg text-xs font-medium focus:outline-none focus:border-[#354f52]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: Reply.io Campaign & Schedule */}
                            <div className="space-y-3 p-4 rounded-xl bg-[#fafbfc] border border-[#eaedf3]">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#354f52] flex items-center gap-1.5">
                                    <span className="h-4 w-4 rounded-full bg-[#354f52] text-white flex items-center justify-center text-[9px]">3</span>
                                    Reply.io Campaign & Frequency
                                </span>

                                <div className="flex items-center gap-4 text-xs font-semibold">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={replyMode === "existing"}
                                            onChange={() => setReplyMode("existing")}
                                            className="accent-[#354f52]"
                                        />
                                        <span>Use Existing Reply Campaign</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={replyMode === "new"}
                                            onChange={() => setReplyMode("new")}
                                            className="accent-[#354f52]"
                                        />
                                        <span>Create New Sequence On The Fly</span>
                                    </label>
                                </div>

                                {replyMode === "existing" ? (
                                    <div>
                                        <label className="text-xs font-bold text-[#1f2d3d]">Select Reply Campaign</label>
                                        <select
                                            value={replyCampaignId}
                                            onChange={(e) => setReplyCampaignId(e.target.value)}
                                            className="w-full mt-1 px-3 py-2 bg-white border border-[#eaedf3] rounded-lg text-xs font-medium focus:outline-none focus:border-[#354f52]"
                                        >
                                            <option value="">-- Do not auto-push (CRM only) --</option>
                                            {replyCampaigns.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    #{c.id} - {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-xs font-bold text-[#1f2d3d]">Email Subject Line</label>
                                            <input
                                                type="text"
                                                value={emailSubject}
                                                onChange={(e) => setEmailSubject(e.target.value)}
                                                className="w-full mt-1 px-3 py-2 bg-white border border-[#eaedf3] rounded-lg text-xs font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-[#1f2d3d]">Email Body Template</label>
                                            <textarea
                                                rows={4}
                                                value={emailBody}
                                                onChange={(e) => setEmailBody(e.target.value)}
                                                className="w-full mt-1 px-3 py-2 bg-white border border-[#eaedf3] rounded-lg text-xs font-mono"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                    <div>
                                        <label className="text-xs font-bold text-[#1f2d3d]">Execution Frequency</label>
                                        <select
                                            value={frequency}
                                            onChange={(e: any) => setFrequency(e.target.value)}
                                            className="w-full mt-1 px-3 py-2 bg-white border border-[#eaedf3] rounded-lg text-xs font-medium focus:outline-none"
                                        >
                                            <option value="daily">Daily (Automated Run)</option>
                                            <option value="hourly">Hourly</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="manual">Manual Trigger Only</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center pt-5">
                                        <label className="flex items-center gap-2 text-xs font-bold text-[#1f2d3d] cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={runImmediately}
                                                onChange={(e) => setRunImmediately(e.target.checked)}
                                                className="h-4 w-4 rounded accent-[#354f52]"
                                            />
                                            <span>Run workflow immediately on creation</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Submit & Cancel */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eaedf3]">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 border border-[#eaedf3] text-xs font-semibold rounded-lg hover:bg-[#f8fafc]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 bg-[#354f52] hover:bg-[#283d3f] text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                            <span>Creating & Running Engine...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="h-3.5 w-3.5" />
                                            <span>Launch Engine</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
