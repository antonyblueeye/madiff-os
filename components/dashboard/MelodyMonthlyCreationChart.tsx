"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Calendar, TrendingUp } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface MonthlyChartProps {
    data?: { label: string; count: number }[];
}

export function MelodyMonthlyCreationChart({ data = [] }: MonthlyChartProps) {
    const totalAdded = data.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <Card className="p-5">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#354f52]" />
                    <div>
                        <h3 className="text-sm font-bold text-[#1f2d3d]">Lead Creation Timeline</h3>
                        <p className="text-xs text-[#6e84a3]">Contacts added per month across all funnels</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-xl font-extrabold font-mono text-[#1f2d3d]">
                        {totalAdded.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[#6e84a3] ml-1 block">Total Recorded</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="creationGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#354f52" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#354f52" stopOpacity={0.0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f4f8" vertical={false} />
                    <XAxis
                        dataKey="label"
                        stroke="#95aac9"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: "#eaedf3" }}
                    />
                    <YAxis
                        stroke="#95aac9"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #eaedf3",
                            borderRadius: "10px",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                            fontSize: "12px",
                        }}
                        formatter={(val: any) => [`${Number(val).toLocaleString()} contacts`, "New Leads"]}
                    />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#354f52"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#creationGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
}
