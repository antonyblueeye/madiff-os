"use client";

import { Card } from "@/components/ui/Card";
import { TrendingUp, BarChart2, CheckCircle2 } from "lucide-react";
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";

interface MonthlyTrendItem {
    month: string;
    campaign_count: number;
    total_sent: string;
    total_delivered: string;
    total_opens: string;
    total_bounces: string;
    avg_open_rate: string;
    avg_delivery_rate: string;
    avg_click_rate: string;
}

interface NewsletterChartsProps {
    monthlyData: MonthlyTrendItem[];
}

export function NewsletterPerformanceCharts({ monthlyData }: NewsletterChartsProps) {
    const formattedData = monthlyData.map((d) => ({
        ...d,
        sent: parseInt(d.total_sent || "0", 10),
        delivered: parseInt(d.total_delivered || "0", 10),
        opens: parseInt(d.total_opens || "0", 10),
        openRate: parseFloat(d.avg_open_rate || "0"),
        deliveryRate: parseFloat(d.avg_delivery_rate || "0"),
        clickRate: parseFloat(d.avg_click_rate || "0"),
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Volume Trend (Sent vs Delivered vs Opens) */}
            <Card className="p-5">
                <div className="flex items-center justify-between mb-4 border-b border-[#eaedf3] pb-3">
                    <div className="flex items-center gap-2">
                        <BarChart2 className="h-4 w-4 text-[#354f52]" />
                        <div>
                            <h3 className="text-sm font-bold text-[#1f2d3d]">Monthly Newsletter Volume</h3>
                            <p className="text-xs text-[#6e84a3]">Emails dispatched, delivered, and opened by month</p>
                        </div>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={260}>
                    <ComposedChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f4f8" vertical={false} />
                        <XAxis dataKey="month" stroke="#95aac9" fontSize={11} tickLine={false} />
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
                            formatter={(val: any, name: any) => [
                                `${Number(val).toLocaleString()}`,
                                name === "sent" ? "Sent" : name === "delivered" ? "Delivered" : "Opens",
                            ]}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                            formatter={(value) => (value === "sent" ? "Total Sent" : value === "delivered" ? "Delivered" : "Opens")}
                        />
                        <Bar dataKey="sent" fill="#cad2c5" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="delivered" fill="#52796f" radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="opens" stroke="#354f52" strokeWidth={3} dot={{ r: 4, fill: "#354f52" }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </Card>

            {/* Chart 2: Rates & Quality Trend (Delivery Rate % & Open Rate %) */}
            <Card className="p-5">
                <div className="flex items-center justify-between mb-4 border-b border-[#eaedf3] pb-3">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[#52796f]" />
                        <div>
                            <h3 className="text-sm font-bold text-[#1f2d3d]">Delivery & Engagement Rates</h3>
                            <p className="text-xs text-[#6e84a3]">Delivery success % and Open rate % trends</p>
                        </div>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={260}>
                    <ComposedChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f4f8" vertical={false} />
                        <XAxis dataKey="month" stroke="#95aac9" fontSize={11} tickLine={false} />
                        <YAxis
                            stroke="#95aac9"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            unit="%"
                            domain={[0, 100]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#ffffff",
                                border: "1px solid #eaedf3",
                                borderRadius: "10px",
                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                                fontSize: "12px",
                            }}
                            formatter={(val: any, name: any) => [
                                `${Number(val)}%`,
                                name === "deliveryRate" ? "Delivery Rate" : name === "openRate" ? "Open Rate" : "Click Rate",
                            ]}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                            formatter={(value) => (value === "deliveryRate" ? "Delivery %" : value === "openRate" ? "Open Rate %" : "Click Rate %")}
                        />
                        <Line type="monotone" dataKey="deliveryRate" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981" }} />
                        <Line type="monotone" dataKey="openRate" stroke="#354f52" strokeWidth={2.5} dot={{ r: 4, fill: "#354f52" }} />
                        <Line type="monotone" dataKey="clickRate" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
}
