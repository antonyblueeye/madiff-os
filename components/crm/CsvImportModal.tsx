"use client";

import { useState, useRef, useMemo } from "react";
import {
    Upload,
    FileSpreadsheet,
    X,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    Check,
    Loader2,
    Info,
} from "lucide-react";

interface CsvImportModalProps {
    onClose: () => void;
    onImportSuccess: (count: number, message: string) => void;
    availableCampaigns?: string[];
    availableOwners?: string[];
}

// Available lead target fields in our system
const TARGET_FIELDS = [
    { key: "contact_name", label: "Full Name (Required)", required: true, description: "Lead full name or first + last name" },
    { key: "email", label: "Email Address", required: false, description: "Work or personal email" },
    { key: "title", label: "Job Title", required: false, description: "e.g. CTO, VP Engineering" },
    { key: "company_name", label: "Company Name", required: false, description: "Organization name" },
    { key: "company_domain_name", label: "Company Domain / Website", required: false, description: "e.g. madiff.eu" },
    { key: "phone", label: "Phone Number", required: false, description: "Direct or office phone" },
    { key: "location", label: "Location / City / Country", required: false, description: "e.g. London, UK" },
    { key: "linkedin_url", label: "LinkedIn URL", required: false, description: "Profile link" },
    { key: "campaign", label: "Campaign Name", required: false, description: "Outbound campaign tag" },
    { key: "contact_owner", label: "Contact Owner", required: false, description: "Assigned sales rep" },
    { key: "lead_status", label: "Lead Status", required: false, description: "NEW, CONNECTED, etc." },
    { key: "lifecycle_stage", label: "Lifecycle Stage", required: false, description: "lead, mql, sql" },
    { key: "technology", label: "Technology / Stack", required: false, description: "Primary tech tags" },
    { key: "role", label: "Role Category", required: false, description: "Engineering, Executive, etc." },
];

/**
 * Robust CSV Line Parser handling quotes, commas, escaped quotes
 */
function parseCsv(text: string): { headers: string[]; rows: string[][] } {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };

    const parseLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    cur += '"';
                    i++; // skip escaped quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === "," && !inQuotes) {
                result.push(cur.trim());
                cur = "";
            } else {
                cur += char;
            }
        }
        result.push(cur.trim());
        return result;
    };

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map(parseLine).filter((r) => r.some((c) => c.trim().length > 0));

    return { headers, rows };
}

export function CsvImportModal({
    onClose,
    onImportSuccess,
    availableCampaigns = [],
    availableOwners = [],
}: CsvImportModalProps) {
    const [step, setStep] = useState<"upload" | "mapping" | "preview">("upload");
    const [file, setFile] = useState<File | null>(null);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvRows, setCsvRows] = useState<string[][]>([]);
    const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({}); // targetFieldKey -> csvHeader

    // Fallbacks
    const [fallbackCampaign, setFallbackCampaign] = useState("CSV Batch Import");
    const [fallbackOwner, setFallbackOwner] = useState("Unassigned");

    const [isImporting, setIsImporting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Read and parse file
    const handleFileSelected = (selectedFile: File) => {
        setErrorMessage(null);
        if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
            setErrorMessage("Please select a valid .csv file");
            return;
        }

        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const parsed = parseCsv(content);
            if (parsed.headers.length === 0) {
                setErrorMessage("The CSV file appears to be empty or invalid.");
                return;
            }

            setCsvHeaders(parsed.headers);
            setCsvRows(parsed.rows);

            // Automatic smart mapping heuristic based on header names
            const initialMapping: Record<string, string> = {};
            for (const header of parsed.headers) {
                const hNorm = header.toLowerCase().replace(/[^a-z0-9]/g, "");

                if (!initialMapping.contact_name && (hNorm.includes("name") || hNorm.includes("fullname") || hNorm.includes("contact") || hNorm === "lead")) {
                    initialMapping.contact_name = header;
                } else if (!initialMapping.email && (hNorm.includes("email") || hNorm.includes("mail"))) {
                    initialMapping.email = header;
                } else if (!initialMapping.title && (hNorm.includes("title") || hNorm.includes("position") || hNorm.includes("role") || hNorm.includes("job"))) {
                    initialMapping.title = header;
                } else if (!initialMapping.company_name && (hNorm.includes("company") || hNorm.includes("organization") || hNorm.includes("account"))) {
                    initialMapping.company_name = header;
                } else if (!initialMapping.company_domain_name && (hNorm.includes("domain") || hNorm.includes("website") || hNorm.includes("url") && !hNorm.includes("linkedin"))) {
                    initialMapping.company_domain_name = header;
                } else if (!initialMapping.phone && (hNorm.includes("phone") || hNorm.includes("mobile") || hNorm.includes("tel"))) {
                    initialMapping.phone = header;
                } else if (!initialMapping.location && (hNorm.includes("location") || hNorm.includes("city") || hNorm.includes("country") || hNorm.includes("region"))) {
                    initialMapping.location = header;
                } else if (!initialMapping.linkedin_url && (hNorm.includes("linkedin") || hNorm.includes("linkedinurl"))) {
                    initialMapping.linkedin_url = header;
                } else if (!initialMapping.campaign && (hNorm.includes("campaign") || hNorm.includes("sequence"))) {
                    initialMapping.campaign = header;
                } else if (!initialMapping.contact_owner && (hNorm.includes("owner") || hNorm.includes("rep") || hNorm.includes("assigned"))) {
                    initialMapping.contact_owner = header;
                }
            }

            setFieldMapping(initialMapping);
            setStep("mapping");
        };
        reader.readAsText(selectedFile);
    };

    // Construct mapped objects for preview and submission
    const mappedLeads = useMemo(() => {
        if (!fieldMapping.contact_name || csvRows.length === 0) return [];

        const nameColIdx = csvHeaders.indexOf(fieldMapping.contact_name);
        if (nameColIdx === -1) return [];

        const colIndices: Record<string, number> = {};
        for (const [targetKey, headerName] of Object.entries(fieldMapping)) {
            if (headerName) {
                colIndices[targetKey] = csvHeaders.indexOf(headerName);
            }
        }

        return csvRows.map((row) => {
            const item: Record<string, string> = {};
            for (const [targetKey, idx] of Object.entries(colIndices)) {
                if (idx !== -1 && row[idx] !== undefined) {
                    item[targetKey] = row[idx].trim();
                }
            }
            return item;
        }).filter((item) => Boolean(item.contact_name));
    }, [csvHeaders, csvRows, fieldMapping]);

    const handleImportSubmit = async () => {
        if (mappedLeads.length === 0) {
            setErrorMessage("No valid leads found. Please make sure the 'Full Name' field is mapped to a column containing contact names.");
            return;
        }

        setIsImporting(true);
        setErrorMessage(null);
        try {
            const res = await fetch("/api/leads/import-csv", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    leads: mappedLeads,
                    campaign: fallbackCampaign.trim() || "CSV Batch Import",
                    contact_owner: fallbackOwner.trim() || "Unassigned",
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                onImportSuccess(data.insertedCount + data.updatedCount, data.message);
            } else {
                setErrorMessage(data.error || data.message || "Failed to import CSV leads");
            }
        } catch (err: any) {
            setErrorMessage(err.message || "Network error while uploading CSV leads");
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-[#eaedf3] space-y-4 my-8">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-[#eaedf3] pb-3.5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                            <FileSpreadsheet className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-extrabold text-[#1f2d3d]">Import Leads from CSV</h3>
                                <span className="rounded-full bg-[#f1f4f8] px-2 py-0.5 text-[10px] font-bold text-[#354f52]">
                                    Step {step === "upload" ? "1/3" : step === "mapping" ? "2/3" : "3/3"}
                                </span>
                            </div>
                            <p className="text-xs text-[#6e84a3]">
                                Upload a spreadsheet, map columns to CRM properties, and import contacts in bulk
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isImporting}
                        className="rounded-lg p-1.5 text-[#95aac9] hover:bg-[#f1f4f8] hover:text-[#1f2d3d] disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {errorMessage && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 animate-in fade-in">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                        <div>
                            <span className="font-bold">Error: </span>
                            {errorMessage}
                        </div>
                    </div>
                )}

                {/* STEP 1: Upload File */}
                {step === "upload" && (
                    <div className="space-y-4 py-2">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.files?.[0]) {
                                    handleFileSelected(e.dataTransfer.files[0]);
                                }
                            }}
                            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#eaedf3] bg-[#f8fafc] p-8 text-center cursor-pointer hover:border-[#354f52] hover:bg-white transition-all group"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        handleFileSelected(e.target.files[0]);
                                    }
                                }}
                            />
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-[#eaedf3] text-[#354f52] group-hover:scale-110 transition-transform">
                                <Upload className="h-6 w-6" />
                            </div>
                            <h4 className="mt-3 text-sm font-bold text-[#1f2d3d]">Click or Drag & Drop your CSV file here</h4>
                            <p className="mt-1 text-xs text-[#6e84a3]">
                                Supports any standard CSV export (Apollo, LinkedIn, HubSpot, ZoomInfo, Excel)
                            </p>
                            <span className="mt-3 inline-block rounded-lg bg-[#354f52] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs">
                                Browse File (.csv)
                            </span>
                        </div>

                        <div className="rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-3 text-xs text-[#6e84a3] space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-[#1f2d3d]">
                                <Info className="h-3.5 w-3.5 text-[#354f52]" />
                                <span>Import Requirements:</span>
                            </div>
                            <p>
                                • <strong className="text-[#1f2d3d]">Full Name</strong> is the only mandatory field.
                            </p>
                            <p>• All other fields (Email, Job Title, Company, Phone, LinkedIn) are optional.</p>
                            <p>• If an email matches an existing contact in your database, their properties will be updated automatically.</p>
                        </div>
                    </div>
                )}

                {/* STEP 2: Column Mapping */}
                {step === "mapping" && (
                    <div className="space-y-4 py-1 text-xs">
                        <div className="flex items-center justify-between rounded-xl bg-[#f8fafc] border border-[#eaedf3] p-3">
                            <div>
                                <span className="font-bold text-[#1f2d3d]">{file?.name}</span>
                                <div className="text-[11px] text-[#6e84a3]">
                                    {csvRows.length.toLocaleString()} rows detected • {csvHeaders.length} columns found
                                </div>
                            </div>
                            <button
                                onClick={() => setStep("upload")}
                                className="text-xs font-bold text-[#354f52] hover:underline"
                            >
                                Change File
                            </button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-extrabold uppercase text-[#1f2d3d]">
                                    Map CSV Columns to System Fields
                                </label>
                                <span className="text-[11px] text-[#6e84a3]">
                                    Required: <strong className="text-red-500">* Full Name</strong>
                                </span>
                            </div>

                            <div className="max-h-72 overflow-y-auto rounded-xl border border-[#eaedf3] bg-white divide-y divide-[#eaedf3]">
                                {TARGET_FIELDS.map((target) => {
                                    const selectedHeader = fieldMapping[target.key] || "";
                                    const isMapped = Boolean(selectedHeader);

                                    return (
                                        <div
                                            key={target.key}
                                            className={`flex items-center justify-between gap-3 p-2.5 transition-colors ${
                                                target.required && !isMapped ? "bg-amber-50/60" : "hover:bg-[#f8fafc]"
                                            }`}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 font-bold text-[#1f2d3d]">
                                                    <span>{target.label}</span>
                                                    {target.required && <span className="text-red-500 font-black">*</span>}
                                                    {isMapped && (
                                                        <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-[#95aac9] truncate">
                                                    {target.description}
                                                </div>
                                            </div>

                                            <div className="w-52 shrink-0">
                                                <select
                                                    value={selectedHeader}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setFieldMapping((prev) => ({
                                                            ...prev,
                                                            [target.key]: val,
                                                        }));
                                                    }}
                                                    className={`w-full rounded-lg border px-2.5 py-1 text-xs outline-none transition-all ${
                                                        isMapped
                                                            ? "border-emerald-300 bg-emerald-50/40 text-[#1f2d3d] font-semibold"
                                                            : target.required
                                                            ? "border-amber-400 bg-white text-[#1f2d3d]"
                                                            : "border-[#eaedf3] bg-white text-[#6e84a3]"
                                                    }`}
                                                >
                                                    <option value="">(Skip this field)</option>
                                                    {csvHeaders.map((h) => (
                                                        <option key={h} value={h}>
                                                            {h}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Fallback Defaults */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#eaedf3]">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-[#6e84a3]">
                                    Default Campaign (for unmapped contacts)
                                </label>
                                <input
                                    value={fallbackCampaign}
                                    onChange={(e) => setFallbackCampaign(e.target.value)}
                                    placeholder="CSV Batch Import"
                                    className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-[#6e84a3]">
                                    Default Contact Owner
                                </label>
                                <select
                                    value={fallbackOwner}
                                    onChange={(e) => setFallbackOwner(e.target.value)}
                                    className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-1.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                                >
                                    <option value="Unassigned">Unassigned</option>
                                    {availableOwners.map((o) => (
                                        <option key={o} value={o}>
                                            {o}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: Preview Sample Records */}
                {step === "preview" && (
                    <div className="space-y-3.5 py-1 text-xs">
                        <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-800">
                            <div>
                                <span className="font-extrabold text-sm">{mappedLeads.length.toLocaleString()} Ready to Import</span>
                                <div className="text-[11px] text-emerald-700 mt-0.5">
                                    All contacts have valid names mapped and will be inserted or updated in PostgreSQL.
                                </div>
                            </div>
                            <span className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-xs font-bold shadow-2xs">
                                Ready
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase text-[#6e84a3]">Preview First 5 Records:</span>
                            <div className="overflow-x-auto rounded-xl border border-[#eaedf3] bg-white">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-[#f8fafc] text-[10px] font-bold uppercase text-[#6e84a3] border-b border-[#eaedf3]">
                                        <tr>
                                            <th className="py-2 px-3">Name</th>
                                            <th className="py-2 px-3">Email</th>
                                            <th className="py-2 px-3">Title</th>
                                            <th className="py-2 px-3">Company</th>
                                            <th className="py-2 px-3">Location</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#eaedf3]">
                                        {mappedLeads.slice(0, 5).map((l, idx) => (
                                            <tr key={idx} className="hover:bg-[#f8fafc]">
                                                <td className="py-2 px-3 font-bold text-[#1f2d3d]">{l.contact_name}</td>
                                                <td className="py-2 px-3 text-[#354f52] font-mono">{l.email || "—"}</td>
                                                <td className="py-2 px-3 text-[#52796f]">{l.title || "—"}</td>
                                                <td className="py-2 px-3 text-[#1f2d3d]">{l.company_name || "—"}</td>
                                                <td className="py-2 px-3 text-[#6e84a3]">{l.location || "Global / Remote"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-[#eaedf3]">
                    {step === "upload" ? (
                        <div className="text-[11px] text-[#6e84a3]">CSV utf-8 format supported</div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setStep(step === "preview" ? "mapping" : "upload")}
                            disabled={isImporting}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-[#6e84a3] hover:bg-[#f1f4f8] hover:text-[#1f2d3d] transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" /> Back
                        </button>
                    )}

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isImporting}
                            className="rounded-lg px-3.5 py-2 text-xs font-semibold text-[#6e84a3] hover:text-[#1f2d3d] disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        {step === "mapping" && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (!fieldMapping.contact_name) {
                                        setErrorMessage("Please map the 'Full Name' field to a column in your CSV before proceeding.");
                                        return;
                                    }
                                    setErrorMessage(null);
                                    setStep("preview");
                                }}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#354f52] px-4 py-2 text-xs font-bold text-white hover:bg-[#2f3e46] transition-colors shadow-sm"
                            >
                                <span>Preview Import</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                        )}

                        {step === "preview" && (
                            <button
                                type="button"
                                onClick={handleImportSubmit}
                                disabled={isImporting || mappedLeads.length === 0}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#354f52] px-5 py-2 text-xs font-bold text-white hover:bg-[#2f3e46] transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isImporting ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        <span>Importing {mappedLeads.length} Leads...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>Confirm & Import {mappedLeads.length} Leads</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
