"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { outreachBreakdown } from "@/lib/mock-data";

export function EmailStatsChart() {
    return (
        <Card>
            <CardHeader
                title="Channel Volume Mix"
                subtitle="Distribution across our communication pipelines"
            />
            <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                    <Pie
                        data={outreachBreakdown}
                        innerRadius={65}
                        outerRadius={92}
                        paddingAngle={4}
                        dataKey="value"
                    >
                        {outreachBreakdown.map((item, index) => (
                            <Cell key={`cell-${index}`} fill={item.color} stroke="#1b262a" strokeWidth={2} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#1f2c31",
                            border: "1px solid #52796f",
                            borderRadius: "12px",
                            color: "#cad2c5",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                        }}
                    />
                    <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: "11px", color: "#cad2c5", paddingTop: "8px" }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
}