"use client";

import { Card } from "@/components/ui/Card";
import { UserCheck } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface OwnerChartProps {
    data?: { owner: string; count: number }[];
}

const BAR_COLORS = [
    "#2f3e46",
    "#354f52",
    "#52796f",
    "#84a98c",
    "#cad2c5",
    "#95aac9",
    "#6e84a3",
];

export function MelodyOwnerHistogram({ data = [] }: OwnerChartProps) {
    const formattedData = data.map((d) => ({
        ...d,
        displayName: d.owner.length > 16 ? `${d.owner.slice(0, 15)}...` : d.owner,
    }));

    return (
        <Card className="p-5">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-[#354f52]" />
                    <div>
                        <h3 className="text-sm font-bold text-[#1f2d3d]">Contacts by Owner</h3>
                        <p className="text-xs text-[#6e84a3]">Lead distribution across team members</p>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={formattedData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f4f8" horizontal={false} />
                    <XAxis
                        type="number"
                        stroke="#95aac9"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                    />
                    <YAxis
                        dataKey="displayName"
                        type="category"
                        stroke="#1f2d3d"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: "#eaedf3" }}
                        width={110}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #eaedf3",
                            borderRadius: "10px",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                            fontSize: "12px",
                        }}
                        formatter={(val: any) => [`${Number(val).toLocaleString()} contacts`, "Assigned Leads"]}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                        {formattedData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
}
