"use client";

import { Card } from "@/components/ui/Card";
import { PieChart as PieIcon, Activity as ActivityIcon, Donut } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const pieData = [
    { name: "Active Leads", value: 75, color: "#2f3e46" },
    { name: "Responded", value: 25, color: "#10b981" },
];

const dailyRingData = [
    { name: "Reply.io", value: 50, color: "#2f3e46" },
    { name: "LinkedHelper", value: 25, color: "#ef4444" },
    { name: "Zoho", value: 15, color: "#10b981" },
    { name: "Apollo", value: 10, color: "#e2e8f0" },
];

export function MelodyBottomWidgets() {
    return (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Widget 1: Sales / Channel Status (Pie) */}
            <Card className="p-5 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <PieIcon className="h-4 w-4 text-[#354f52]" />
                        <h3 className="text-sm font-bold text-[#1f2d3d]">Outreach Status</h3>
                    </div>
                    <p className="text-xs text-[#6e84a3]">Active sequence engagement vs conversion</p>
                </div>

                <div className="relative h-44 my-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                innerRadius={0}
                                outerRadius={65}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-[#eaedf3] pt-3">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#2f3e46]" />
                        <span className="text-[#6e84a3]">Active Sequences</span>
                    </div>
                    <span className="font-bold font-mono text-[#1f2d3d]">75%</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1.5">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
                        <span className="text-[#6e84a3]">Engaged / Replied</span>
                    </div>
                    <span className="font-bold font-mono text-[#1f2d3d]">25%</span>
                </div>
            </Card>

            {/* Widget 2: Activity Stream (Melody Activity with avatars and timestamps) */}
            <Card className="p-5 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-3">
                    <ActivityIcon className="h-4 w-4 text-[#354f52]" />
                    <h3 className="text-sm font-bold text-[#1f2d3d]">Live Team & Bot Activity</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#10b981] mt-1 shrink-0" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-[#1f2d3d]">4 contacts replied to sequence</p>
                                <span className="text-[10px] text-[#95aac9]">8:30 AM</span>
                            </div>
                            <p className="text-[11px] text-[#6e84a3] mt-0.5">FinTech CTOs campaign positive response</p>
                            <div className="flex -space-x-1.5 mt-2">
                                <div className="h-6 w-6 rounded-full bg-[#354f52] text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                                    M
                                </div>
                                <div className="h-6 w-6 rounded-full bg-[#84a98c] text-[#182226] flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                                    AD
                                </div>
                                <div className="h-6 w-6 rounded-full bg-[#52796f] text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                                    JD
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 border-t border-[#eaedf3] pt-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444] mt-1 shrink-0" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-[#1f2d3d]">HubSpot deal created</p>
                                <span className="text-[10px] text-[#95aac9]">11:40 AM</span>
                            </div>
                            <p className="text-[11px] text-[#6e84a3] mt-0.5">CloudScale Systems — $48,500 pipeline</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 border-t border-[#eaedf3] pt-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#354f52] mt-1 shrink-0" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-[#1f2d3d]">Zoho candidate digest sent</p>
                                <span className="text-[10px] text-[#95aac9]">4:30 PM</span>
                            </div>
                            <p className="text-[11px] text-[#6e84a3] mt-0.5">3,200 engineers received issue #24</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Widget 3: Daily Sales Ring (Melody Donut) */}
            <Card className="p-5 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Donut className="h-4 w-4 text-[#354f52]" />
                        <h3 className="text-sm font-bold text-[#1f2d3d]">Channel Allocation</h3>
                    </div>
                    <p className="text-xs text-[#6e84a3]">Volume dispatch for the past month</p>
                </div>

                <div className="relative h-44 my-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={dailyRingData}
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {dailyRingData.map((entry, index) => (
                                    <Cell key={`ring-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-[#eaedf3] pt-3 text-[#6e84a3]">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#2f3e46]" />
                        <span>Reply (50%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
                        <span>LH LinkedIn (25%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                        <span>Zoho (15%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#e2e8f0]" />
                        <span>Apollo (10%)</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
