"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { TrendingUp } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const salesLineData = [
    { name: "W1", value1: 2100, value2: 3800 },
    { name: "W2", value1: 4200, value2: 4500 },
    { name: "W3", value1: 7200, value2: 5200 },
    { name: "W4", value1: 3900, value2: 4800 },
    { name: "W5", value1: 2400, value2: 4900 },
    { name: "W6", value1: 3800, value2: 6400 },
    { name: "W7", value1: 4500, value2: 5800 },
    { name: "W8", value1: 7100, value2: 6700 },
    { name: "W9", value1: 6100, value2: 5400 },
];

export function MelodySalesWaveChart() {
    return (
        <Card className="p-5">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#354f52]" />
                    <h3 className="text-sm font-bold text-[#1f2d3d]">Pipeline Generation Curve</h3>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-extrabold font-mono text-[#1f2d3d]">$56,000</span>
                    <span className="text-xs text-[#6e84a3] ml-1">New Pipeline</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
                <LineChart data={salesLineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f4f8" vertical={false} />
                    <XAxis
                        dataKey="name"
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
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #eaedf3",
                            borderRadius: "10px",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                            fontSize: "12px",
                        }}
                    />
                    <Line
                        type="natural"
                        dataKey="value1"
                        name="Qualified Pipeline"
                        stroke="#2f3e46"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#2f3e46" }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="natural"
                        dataKey="value2"
                        name="Target Baseline"
                        stroke="#cbd5e1"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
}
