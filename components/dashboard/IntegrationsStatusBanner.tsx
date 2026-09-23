import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { integrationsData } from "@/lib/mock-data";
import { CheckCircle2, AlertTriangle, RefreshCw, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function IntegrationsStatusBanner() {
    return (
        <Card className="border-[#354f52]/80 bg-gradient-to-r from-[#2f3e46]/60 via-[#1f2c31]/80 to-[#2f3e46]/60 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-[#84a98c] animate-pulse" />
                        <h2 className="text-base font-bold text-[#cad2c5] tracking-tight">
                            Madiff Outbound Gateway Status
                        </h2>
                        <Badge variant="success">All Systems Operational</Badge>
                    </div>
                    <p className="mt-1 text-xs text-[#cad2c5]/60 max-w-2xl">
                        Central synchronization layer between Apollo (Prospects), Reply.io & LinkedHelper (Outreach), HubSpot (CRM), Zoho (Talent Pools), and LinkedIn Page metrics.
                    </p>
                </div>
                <Link
                    href="/integrations"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#52796f]/60 bg-[#354f52]/50 px-4 py-2 text-xs font-semibold text-[#cad2c5] hover:border-[#84a98c] hover:bg-[#52796f]/40 hover:text-white transition-all shadow-sm"
                >
                    Manage API Connections
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#84a98c]" />
                </Link>
            </div>

            {/* Micro pills grid for 6 integrations */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 border-t border-[#354f52]/50 pt-4">
                {integrationsData.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-xl border border-[#354f52]/60 bg-[#1f2c31]/40 p-2.5 hover:border-[#52796f] transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#cad2c5] truncate">{item.name}</span>
                            {item.status === "connected" ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#84a98c] shrink-0" />
                            ) : item.status === "syncing" ? (
                                <RefreshCw className="h-3.5 w-3.5 text-amber-300 animate-spin shrink-0" />
                            ) : (
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            )}
                        </div>
                        <div className="mt-1 text-[10px] text-[#cad2c5]/50 truncate font-mono">
                            {item.lastSync}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
