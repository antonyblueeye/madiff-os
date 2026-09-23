"use client";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Activity, Clock } from "lucide-react";
import { recentSystemActivity } from "@/lib/mock-data";

export default function ActivityPage() {
    return (
        <PagePlaceholder
            title="System Activity Stream & Audit Log"
            description="Complete chronological trace of automated outbound events, webhook executions, and CRM synchronization runs."
            icon={Activity}
            tag="Audit Trail"
        >
            <Card className="p-6">
                <div className="space-y-4">
                    {recentSystemActivity.concat([
                        {
                            id: 6,
                            source: "Reply.io",
                            event: "Sender warm-up passed: deliverability index at 99.4%",
                            time: "2 days ago",
                            status: "success",
                        },
                        {
                            id: 7,
                            source: "Apollo.io",
                            event: "Auto-enrichment ran for 120 contacts without direct phone",
                            time: "3 days ago",
                            status: "neutral",
                        },
                    ]).map((a) => (
                        <div
                            key={a.id}
                            className="flex items-start gap-4 border-b border-[#eaedf3] pb-3.5 last:border-0 last:pb-0"
                        >
                            <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#10b981] ring-4 ring-emerald-50" />
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-xs font-bold uppercase text-[#354f52]">
                                        {a.source}
                                    </span>
                                    <span className="text-[11px] text-[#6e84a3] flex items-center gap-1 font-mono">
                                        <Clock className="h-3 w-3" /> {a.time}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-[#1f2d3d] font-medium leading-relaxed">{a.event}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </PagePlaceholder>
    );
}
