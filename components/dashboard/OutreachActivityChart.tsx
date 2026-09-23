"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
    { name: "Week 35", reply: 840, linkedin: 310, zoho: 950 },
    { name: "Week 36", reply: 980, linkedin: 360, zoho: 1100 },
    { name: "Week 37", reply: 1120, linkedin: 390, zoho: 880 },
    { name: "Week 38", reply: 1180, linkedin: 430, zoho: 960 },
];

export function OutreachActivityChart() {
    return (
        <Card className="col-span-2">
            <CardHeader
                title="Weekly Outreach Cadence"
                subtitle="Reply.io (Cold Email) vs LinkedHelper (InMail/Connects) vs Zoho"
            />
            <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data}>
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
                    />
                    <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: "11px", color: "#cad2c5", paddingTop: "6px" }}
                    />
                    <Bar dataKey="reply" name="Reply.io Cold Emails" fill="#84a98c" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="linkedin" name="LinkedHelper Connects" fill="#52796f" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="zoho" name="Zoho Candidates" fill="#cad2c5" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
}