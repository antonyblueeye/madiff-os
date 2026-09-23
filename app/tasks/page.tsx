"use client";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CheckSquare, Plus, Clock, PlayCircle } from "lucide-react";
import { pendingHubTasks } from "@/lib/mock-data";

export default function TasksPage() {
    return (
        <PagePlaceholder
            title="Automation Rules & Human Review Queue"
            description="Manage background tasks, auto-enrichment triggers, sequence safety limits, and approval workflows."
            icon={CheckSquare}
            tag="Operations Queue"
        >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Card className="p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#eaedf3] pb-3">
                        <h3 className="text-sm font-bold text-[#1f2d3d]">Active Background Automation Rules</h3>
                        <Badge variant="success">4 Rules Active</Badge>
                    </div>

                    <div className="space-y-3 text-xs">
                        <div className="rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-3.5 space-y-1">
                            <div className="font-bold text-[#1f2d3d]">Apollo Lead Auto-Push</div>
                            <p className="text-[#6e84a3] leading-relaxed">
                                Automatically push contacts with verified email &gt; 95% to Reply.io sequence "EU Tech Leaders".
                            </p>
                            <span className="inline-block font-mono text-[10px] text-[#354f52] font-semibold pt-1">
                                Trigger: Daily at 08:00 UTC
                            </span>
                        </div>

                        <div className="rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-3.5 space-y-1">
                            <div className="font-bold text-[#1f2d3d]">LinkedHelper Connect Safeguard</div>
                            <p className="text-[#6e84a3] leading-relaxed">
                                Max 25 connection requests / day per seat. Automatically pauses if LinkedIn limits warn.
                            </p>
                            <span className="inline-block font-mono text-[10px] text-[#354f52] font-semibold pt-1">
                                Trigger: Continuous webhook monitor
                            </span>
                        </div>

                        <div className="rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-3.5 space-y-1">
                            <div className="font-bold text-[#1f2d3d]">HubSpot Deal Creator on Positive Reply</div>
                            <p className="text-[#6e84a3] leading-relaxed">
                                When Reply.io tags an inbound reply as "Interested", create Deal in HubSpot and alert via Slack.
                            </p>
                            <span className="inline-block font-mono text-[10px] text-[#354f52] font-semibold pt-1">
                                Trigger: Instant Webhook
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#eaedf3] pb-3">
                        <h3 className="text-sm font-bold text-[#1f2d3d]">Manual Review Tasks</h3>
                        <Badge variant="accent">Action Required</Badge>
                    </div>

                    <div className="space-y-3">
                        {pendingHubTasks.map((t) => (
                            <div
                                key={t.id}
                                className="flex items-center justify-between rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-3.5 hover:border-[#354f52]/40 transition-all"
                            >
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-[#1f2d3d]">{t.title}</div>
                                    <div className="flex items-center gap-2 text-[10px] text-[#6e84a3]">
                                        <span className="font-mono font-bold text-[#354f52]">{t.platform}</span>
                                        <span>·</span>
                                        <span className="flex items-center gap-1 font-mono">
                                            <Clock className="h-3 w-3" /> Due {t.due}
                                        </span>
                                    </div>
                                </div>
                                <Badge
                                    variant={
                                        t.priority === "high"
                                            ? "danger"
                                            : t.priority === "medium"
                                            ? "warning"
                                            : "default"
                                    }
                                >
                                    {t.priority}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </PagePlaceholder>
    );
}
