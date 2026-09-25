"use client";

import { useState } from "react";
import { LeadItem } from "@/lib/mock-data";
import { X, Check, Edit3, AlertCircle, RefreshCw, UserCheck, Megaphone, Target, CheckSquare, Sparkles } from "lucide-react";

interface BulkEditModalProps {
    selectedLeadIds: string[];
    selectedLeads: LeadItem[];
    availableOwners: string[];
    availableCampaigns: string[];
    availableStages: string[];
    availableLeadStatuses: string[];
    onClose: () => void;
    onSuccess: (updatedCount: number, message: string) => void;
}

export function BulkEditModal({
    selectedLeadIds,
    selectedLeads,
    availableOwners,
    availableCampaigns,
    availableStages,
    availableLeadStatuses,
    onClose,
    onSuccess,
}: BulkEditModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Flags to determine which fields to update
    const [updateCampaign, setUpdateCampaign] = useState(false);
    const [campaignValue, setCampaignValue] = useState("");

    const [updateOwner, setUpdateOwner] = useState(false);
    const [ownerValue, setOwnerValue] = useState("");

    const [updateLifecycleStage, setUpdateLifecycleStage] = useState(false);
    const [lifecycleStageValue, setLifecycleStageValue] = useState("lead");

    const [updateLeadStatus, setUpdateLeadStatus] = useState(false);
    const [leadStatusValue, setLeadStatusValue] = useState("NEW");

    const [updateConnectionStatus, setUpdateConnectionStatus] = useState(false);
    const [connectionStatusValue, setConnectionStatusValue] = useState("CONNECTED");

    const [updateReplied, setUpdateReplied] = useState(false);
    const [repliedValue, setRepliedValue] = useState("true");

    const handleApply = async () => {
        const updates: Record<string, any> = {};

        if (updateCampaign) updates.campaign = campaignValue;
        if (updateOwner) updates.contactOwner = ownerValue;
        if (updateLifecycleStage) updates.lifecycleStage = lifecycleStageValue;
        if (updateLeadStatus) updates.leadStatus = leadStatusValue;
        if (updateConnectionStatus) updates.linkedinConnectionStatus = connectionStatusValue;
        if (updateReplied) updates.replied = repliedValue;

        if (Object.keys(updates).length === 0) {
            setErrorMsg("Please select at least one field to update by checking its box.");
            return;
        }

        setIsSaving(true);
        setErrorMsg(null);

        try {
            const res = await fetch("/api/leads/bulk-edit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    leadIds: selectedLeadIds,
                    updates,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to update leads");
            }

            onSuccess(data.updatedCount || selectedLeadIds.length, data.message || `Updated ${selectedLeadIds.length} contact(s)`);
            onClose();
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to apply bulk edit");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-[#eaedf3] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#eaedf3] bg-[#fafbfc] px-6 py-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#354f52] text-white shadow-xs">
                            <Edit3 className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-extrabold text-[#1f2d3d]">Bulk Edit Contacts</h2>
                            <p className="text-[11px] text-[#6e84a3]">
                                Updating <strong>{selectedLeadIds.length}</strong> selected contact(s)
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-[#95aac9] hover:bg-[#eaedf3] hover:text-[#1f2d3d] transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <p className="text-xs text-[#6e84a3]">
                        Check the boxes next to the properties you want to overwrite for all selected leads:
                    </p>

                    {errorMsg && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Field 1: Campaign */}
                    <div className={`p-3 rounded-xl border transition-colors ${updateCampaign ? "border-[#354f52] bg-[#f8fafc]" : "border-[#eaedf3] bg-white"}`}>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs font-bold text-[#1f2d3d] cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={updateCampaign}
                                    onChange={(e) => setUpdateCampaign(e.target.checked)}
                                    className="rounded border-[#eaedf3] text-[#354f52] focus:ring-[#354f52]"
                                />
                                <Megaphone className="h-3.5 w-3.5 text-[#354f52]" />
                                <span>Change Campaign</span>
                            </label>
                        </div>
                        {updateCampaign && (
                            <div className="mt-2 pl-6">
                                <input
                                    type="text"
                                    list="campaign-options"
                                    value={campaignValue}
                                    onChange={(e) => setCampaignValue(e.target.value)}
                                    placeholder="Type or select campaign..."
                                    className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52]"
                                />
                                <datalist id="campaign-options">
                                    <option value="">No Campaign (Clear)</option>
                                    {availableCampaigns.map((c) => (
                                        <option key={c} value={c} />
                                    ))}
                                </datalist>
                            </div>
                        )}
                    </div>

                    {/* Field 2: Contact Owner */}
                    <div className={`p-3 rounded-xl border transition-colors ${updateOwner ? "border-[#354f52] bg-[#f8fafc]" : "border-[#eaedf3] bg-white"}`}>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs font-bold text-[#1f2d3d] cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={updateOwner}
                                    onChange={(e) => setUpdateOwner(e.target.checked)}
                                    className="rounded border-[#eaedf3] text-[#354f52] focus:ring-[#354f52]"
                                />
                                <UserCheck className="h-3.5 w-3.5 text-[#354f52]" />
                                <span>Change Contact Owner</span>
                            </label>
                        </div>
                        {updateOwner && (
                            <div className="mt-2 pl-6">
                                <select
                                    value={ownerValue}
                                    onChange={(e) => setOwnerValue(e.target.value)}
                                    className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52]"
                                >
                                    <option value="Unassigned">Unassigned</option>
                                    {availableOwners.map((o) => (
                                        <option key={o} value={o}>
                                            {o}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Field 3: Lifecycle Stage */}
                    <div className={`p-3 rounded-xl border transition-colors ${updateLifecycleStage ? "border-[#354f52] bg-[#f8fafc]" : "border-[#eaedf3] bg-white"}`}>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs font-bold text-[#1f2d3d] cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={updateLifecycleStage}
                                    onChange={(e) => setUpdateLifecycleStage(e.target.checked)}
                                    className="rounded border-[#eaedf3] text-[#354f52] focus:ring-[#354f52]"
                                />
                                <Target className="h-3.5 w-3.5 text-[#354f52]" />
                                <span>Change Lifecycle Stage</span>
                            </label>
                        </div>
                        {updateLifecycleStage && (
                            <div className="mt-2 pl-6">
                                <select
                                    value={lifecycleStageValue}
                                    onChange={(e) => setLifecycleStageValue(e.target.value)}
                                    className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] capitalize"
                                >
                                    <option value="lead">Lead</option>
                                    <option value="marketingqualifiedlead">Marketing Qualified Lead (MQL)</option>
                                    <option value="salesqualifiedlead">Sales Qualified Lead (SQL)</option>
                                    <option value="opportunity">Opportunity</option>
                                    <option value="customer">Customer</option>
                                    <option value="evangelist">Evangelist</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Field 4: Lead Status */}
                    <div className={`p-3 rounded-xl border transition-colors ${updateLeadStatus ? "border-[#354f52] bg-[#f8fafc]" : "border-[#eaedf3] bg-white"}`}>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs font-bold text-[#1f2d3d] cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={updateLeadStatus}
                                    onChange={(e) => setUpdateLeadStatus(e.target.checked)}
                                    className="rounded border-[#eaedf3] text-[#354f52] focus:ring-[#354f52]"
                                />
                                <CheckSquare className="h-3.5 w-3.5 text-[#354f52]" />
                                <span>Change Lead Status</span>
                            </label>
                        </div>
                        {updateLeadStatus && (
                            <div className="mt-2 pl-6">
                                <select
                                    value={leadStatusValue}
                                    onChange={(e) => setLeadStatusValue(e.target.value)}
                                    className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52]"
                                >
                                    <option value="NEW">NEW</option>
                                    <option value="OPEN">OPEN</option>
                                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                                    <option value="OPEN_DEAL">OPEN_DEAL</option>
                                    <option value="CONNECTED">CONNECTED</option>
                                    <option value="UNQUALIFIED">UNQUALIFIED</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Field 5: LinkedIn Connection Status */}
                    <div className={`p-3 rounded-xl border transition-colors ${updateConnectionStatus ? "border-[#354f52] bg-[#f8fafc]" : "border-[#eaedf3] bg-white"}`}>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs font-bold text-[#1f2d3d] cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={updateConnectionStatus}
                                    onChange={(e) => setUpdateConnectionStatus(e.target.checked)}
                                    className="rounded border-[#eaedf3] text-[#354f52] focus:ring-[#354f52]"
                                />
                                <span>Change LinkedIn Connection Status</span>
                            </label>
                        </div>
                        {updateConnectionStatus && (
                            <div className="mt-2 pl-6">
                                <select
                                    value={connectionStatusValue}
                                    onChange={(e) => setConnectionStatusValue(e.target.value)}
                                    className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52]"
                                >
                                    <option value="CONNECTED">CONNECTED (1st Degree)</option>
                                    <option value="PENDING">PENDING</option>
                                    <option value="Not Connected">Not Connected</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Field 6: Replied Status */}
                    <div className={`p-3 rounded-xl border transition-colors ${updateReplied ? "border-[#354f52] bg-[#f8fafc]" : "border-[#eaedf3] bg-white"}`}>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs font-bold text-[#1f2d3d] cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={updateReplied}
                                    onChange={(e) => setUpdateReplied(e.target.checked)}
                                    className="rounded border-[#eaedf3] text-[#354f52] focus:ring-[#354f52]"
                                />
                                <span>Change Replied Flag</span>
                            </label>
                        </div>
                        {updateReplied && (
                            <div className="mt-2 pl-6">
                                <select
                                    value={repliedValue}
                                    onChange={(e) => setRepliedValue(e.target.value)}
                                    className="w-full rounded-lg border border-[#eaedf3] bg-white px-3 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52]"
                                >
                                    <option value="true">Replied (Yes)</option>
                                    <option value="false">Not Replied (No)</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-[#eaedf3] bg-[#fafbfc] px-6 py-3.5">
                    <span className="text-xs text-[#6e84a3]">
                        Changes marked as <em>pending push</em> to HubSpot
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            disabled={isSaving}
                            className="rounded-xl border border-[#eaedf3] bg-white px-4 py-2 text-xs font-bold text-[#6e84a3] hover:bg-[#f1f4f8] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#354f52] px-4 py-2 text-xs font-bold text-white hover:bg-[#2f3e46] transition-colors shadow-xs"
                        >
                            {isSaving ? (
                                <>
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                    <span>Applying...</span>
                                </>
                            ) : (
                                <>
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Apply to {selectedLeadIds.length} Lead(s)</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
