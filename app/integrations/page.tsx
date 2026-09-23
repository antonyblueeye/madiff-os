"use client";

import { useState } from "react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
    Layers,
    CheckCircle2,
    AlertTriangle,
    RefreshCw,
    Key,
    ExternalLink,
    Shield,
    Database,
    Send,
    Globe,
    Mail,
} from "lucide-react";
import { integrationsData, IntegrationStatus } from "@/lib/mock-data";

const iconMap: Record<string, React.ReactNode> = {
    apollo: <Database className="h-5 w-5 text-[#354f52]" />,
    linkedhelper: <Globe className="h-5 w-5 text-[#354f52]" />,
    replyio: <Send className="h-5 w-5 text-[#354f52]" />,
    hubspot: <Database className="h-5 w-5 text-amber-600" />,
    zoho: <Mail className="h-5 w-5 text-[#354f52]" />,
    "linkedin-page": <Globe className="h-5 w-5 text-[#354f52]" />,
};

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<IntegrationStatus[]>(integrationsData);
    const [selectedService, setSelectedService] = useState<IntegrationStatus | null>(null);
    const [apiKey, setApiKey] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    const handleTestConnection = (id: string) => {
        setNotification(`Testing connection for ${id}...`);
        setTimeout(() => {
            setNotification(`Connection to ${id} verified successfully!`);
            setTimeout(() => setNotification(null), 3000);
        }, 800);
    };

    return (
        <PagePlaceholder
            title="Integrations & API Gateways"
            description="Manage authentication tokens, webhook handlers, and health monitors for Apollo, LinkedHelper, Reply.io, HubSpot, Zoho, and LinkedIn."
            icon={Layers}
            tag="6 Connected"
        >
            {notification && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    {notification}
                </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {integrations.map((item) => (
                    <Card key={item.id} className="flex flex-col justify-between p-5 space-y-4">
                        <div>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-2.5">
                                        {iconMap[item.id] || <Layers className="h-5 w-5 text-[#354f52]" />}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#1f2d3d]">{item.name}</h3>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">
                                            {item.category}
                                        </span>
                                    </div>
                                </div>
                                <Badge
                                    variant={
                                        item.status === "connected"
                                            ? "success"
                                            : item.status === "syncing"
                                            ? "warning"
                                            : "warning"
                                    }
                                >
                                    {item.status}
                                </Badge>
                            </div>

                            <p className="mt-3 text-xs text-[#475569] leading-relaxed min-h-[36px]">
                                {item.description}
                            </p>

                            {/* Clean, high-contrast parameter box */}
                            <div className="mt-4 space-y-1.5 rounded-lg border border-[#eaedf3] bg-[#f8fafc] p-3 text-xs">
                                <div className="flex items-center justify-between text-[#6e84a3]">
                                    <span>Sync Status</span>
                                    <span className="font-mono font-bold text-[#1f2d3d]">{item.activeItems}</span>
                                </div>
                                <div className="flex items-center justify-between text-[#6e84a3]">
                                    <span>Last Ping</span>
                                    <span className="font-mono font-semibold text-[#10b981]">{item.lastSync}</span>
                                </div>
                                {item.apiLatency && (
                                    <div className="flex items-center justify-between text-[#6e84a3]">
                                        <span>Latency</span>
                                        <span className="font-mono text-[#6e84a3]">{item.apiLatency}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-[#eaedf3]">
                            <button
                                onClick={() => handleTestConnection(item.name)}
                                className="flex-1 rounded-lg border border-[#eaedf3] bg-white py-2 text-xs font-bold text-[#354f52] hover:bg-[#f1f4f8] transition-all shadow-sm"
                            >
                                Test API
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedService(item);
                                    setApiKey("");
                                }}
                                className="rounded-lg border border-[#eaedf3] bg-white p-2 text-[#6e84a3] hover:text-[#1f2d3d] hover:bg-[#f1f4f8] transition-all shadow-sm"
                                title="Configure Key"
                            >
                                <Key className="h-4 w-4" />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Modal for setting API Keys */}
            {selectedService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 border border-[#eaedf3]">
                        <div className="flex items-center justify-between border-b border-[#eaedf3] pb-3">
                            <div className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-[#354f52]" />
                                <h3 className="text-base font-bold text-[#1f2d3d]">
                                    Configure {selectedService.name}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedService(null)}
                                className="text-sm text-[#95aac9] hover:text-[#1f2d3d]"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-xs text-[#6e84a3]">
                            Enter the production API Key or Bearer Token to authenticate the Madiff Outbound engine.
                        </p>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase text-[#6e84a3]">
                                Secret Key / Webhook Endpoint
                            </label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder={`Enter ${selectedService.name} secret token...`}
                                className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3.5 py-2.5 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eaedf3]">
                            <button
                                onClick={() => setSelectedService(null)}
                                className="rounded-lg px-4 py-2 text-xs font-semibold text-[#6e84a3] hover:text-[#1f2d3d]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setIsSaving(true);
                                    setTimeout(() => {
                                        setIsSaving(false);
                                        setSelectedService(null);
                                        setNotification(`${selectedService.name} credentials updated successfully.`);
                                        setTimeout(() => setNotification(null), 3000);
                                    }, 600);
                                }}
                                className="rounded-lg bg-[#354f52] px-4 py-2 text-xs font-bold text-white hover:bg-[#2f3e46] transition-colors"
                            >
                                {isSaving ? "Saving..." : "Save Credentials"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PagePlaceholder>
    );
}
