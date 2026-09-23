import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { recentSystemActivity, pendingHubTasks } from "@/lib/mock-data";
import { CheckCircle2, AlertCircle, Clock, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function RecentActivity() {
    return (
        <Card>
            <CardHeader
                title="System Event Stream"
                subtitle="Live automated triggers across tools"
                action={
                    <Link
                        href="/activity"
                        className="text-[11px] font-medium text-[#84a98c] hover:underline flex items-center gap-0.5"
                    >
                        View all <ArrowUpRight className="h-3 w-3" />
                    </Link>
                }
            />
            <div className="space-y-3.5">
                {recentSystemActivity.map((a) => (
                    <div
                        key={a.id}
                        className="flex items-start gap-3 border-b border-[#354f52]/40 pb-3 last:border-0 last:pb-0"
                    >
                        <div className="mt-1 flex h-2 w-2 rounded-full bg-[#84a98c] ring-4 ring-[#84a98c]/15" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#84a98c]">
                                    {a.source}
                                </span>
                                <span className="text-[10px] text-[#cad2c5]/50 flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5" /> {a.time}
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs text-[#cad2c5]/90 leading-relaxed">{a.event}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

export function PendingTasks() {
    return (
        <Card className="col-span-full lg:col-span-1">
            <CardHeader
                title="Pending Actions & Queue"
                subtitle="High-impact items requiring human review"
                action={
                    <Badge variant="accent">
                        {pendingHubTasks.length} Pending
                    </Badge>
                }
            />
            <div className="space-y-2.5">
                {pendingHubTasks.map((t) => (
                    <div
                        key={t.id}
                        className="group flex items-center justify-between rounded-xl border border-[#354f52]/60 bg-[#1f2c31]/50 p-3 hover:border-[#84a98c]/40 hover:bg-[#25353c]/70 transition-all"
                    >
                        <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 text-[#52796f] group-hover:text-[#84a98c] transition-colors">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-[#cad2c5] group-hover:text-white transition-colors">
                                    {t.title}
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="rounded bg-[#354f52]/40 px-1.5 py-0.2 text-[10px] font-mono text-[#cad2c5]/70 border border-[#52796f]/30">
                                        {t.platform}
                                    </span>
                                    <span className="text-[10px] text-[#cad2c5]/50">Due {t.due}</span>
                                </div>
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
    );
}