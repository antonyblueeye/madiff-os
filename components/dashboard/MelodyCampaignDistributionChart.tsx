"use client";

import { Card } from "@/components/ui/Card";
import { Megaphone, Layers } from "lucide-react";
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

interface CampaignChartProps {
    data?: { campaign: string; count: number }[];
}

const CAMPAIGN_COLORS = [
    "#354f52",
    "#52796f",
    "#84a98c",
    "#2f3e46",
    "#cad2c5",
    "#475569",
    "#6e84a3",
    "#95aac9",
];

export function MelodyCampaignDistributionChart({ data = [] }: CampaignChartProps) {
    const formattedData = data.map((d) => ({
        ...d,
        displayName: d.campaign.length > 20 ? `${d.campaign.slice(0, 19)}...` : d.campaign,
    }));

    return (
        <Card className="p-5">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-[#354f52]" />
                    <div>
                        <h3 className="text-sm font-bold text-[#1f2d3d]">Contacts by Campaign</h3>
                        <p className="text-xs text-[#6e84a3]">
                            Outbound campaign breakdown ({data.reduce((s, d) => s + d.count, 0).toLocaleString()} contacts with assigned campaigns)
                        </p>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={formattedData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f4f8" vertical={false} />
                    <XAxis
                        dataKey="displayName"
                        stroke="#95aac9"
                        fontSize={10}
                        angle={-20}
                        textAnchor="end"
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
                        formatter={(val: any) => [`${Number(val).toLocaleString()} contacts`, "Campaign Volume"]}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {formattedData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CAMPAIGN_COLORS[index % CAMPAIGN_COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
}
