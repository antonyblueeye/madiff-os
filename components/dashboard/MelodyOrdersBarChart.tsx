"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Package } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

const orderData = [
    { name: "Jan", delivered: 280, estimated: 480 },
    { name: "Feb", delivered: 390, estimated: 600 },
    { name: "Mar", delivered: 410, estimated: 610 },
    { name: "Apr", delivered: 780, estimated: 950 },
    { name: "May", delivered: 530, estimated: 620 },
    { name: "Jun", delivered: 340, estimated: 490 },
    { name: "Jul", delivered: 200, estimated: 360 },
    { name: "Aug", delivered: 410, estimated: 460 },
    { name: "Sep", delivered: 660, estimated: 710 },
    { name: "Oct", delivered: 790, estimated: 830 },
    { name: "Nov", delivered: 500, estimated: 660 },
    { name: "Dec", delivered: 640, estimated: 780 },
];

export function MelodyOrdersBarChart() {
    return (
        <Card className="p-5">
            <CardHeader
                title="Outbound Dispatches & Deliveries"
                subtitle="Monthly cold outreach volume vs target estimate"
                icon={<Package className="h-4 w-4" />}
            />
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={orderData} barGap={4}>
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
                    <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: "11px", color: "#6e84a3", paddingTop: "12px" }}
                    />
                    <Bar
                        dataKey="delivered"
                        name="Delivered & Verified"
                        fill="#2f3e46"
                        radius={[4, 4, 0, 0]}
                        barSize={14}
                    />
                    <Bar
                        dataKey="estimated"
                        name="Target Estimated"
                        fill="#e2e8f0"
                        radius={[4, 4, 0, 0]}
                        barSize={14}
                    />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
}
