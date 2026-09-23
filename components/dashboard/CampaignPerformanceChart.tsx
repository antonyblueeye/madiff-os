"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { campaignPerformance } from "@/lib/mock-data";

export function CampaignPerformanceChart() {
    return (
        <Card className="col-span-2">
            <CardHeader
                title="Cross-Channel Outbound Velocity"
                subtitle="Sent vs Opened vs Replied across Apollo/Reply & LinkedHelper"
            />
            <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={campaignPerformance}>
                    <defs>
                        <linearGradient id="gSent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#84a98c" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#84a98c" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gOpened" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#52796f" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#52796f" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#354f52" opacity={0.6} />
                    <XAxis dataKey="name" stroke="#84a98c" opacity={0.7} fontSize={11} tickLine={false} />
                    <YAxis stroke="#84a98c" opacity={0.7} fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#1f2c31",
                            border: "1px solid #52796f",
                            borderRadius: "12px",
                            color: "#cad2c5",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                        }}
                        itemStyle={{ color: "#cad2c5", fontSize: "12px" }}
                        labelStyle={{ color: "#84a98c", fontWeight: "600", marginBottom: "4px" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="sent"
                        stroke="#84a98c"
                        strokeWidth={2.5}
                        fill="url(#gSent)"
                        name="Outbound Sent"
                    />
                    <Area
                        type="monotone"
                        dataKey="opened"
                        stroke="#cad2c5"
                        strokeWidth={2}
                        fill="url(#gOpened)"
                        name="Opened / Viewed"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
}