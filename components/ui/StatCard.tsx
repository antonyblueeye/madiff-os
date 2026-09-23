import { Card } from "./Card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({
    label,
    value,
    delta,
    icon: Icon,
    trend = "up",
    subtext,
}: {
    label: string;
    value: string;
    delta?: string;
    icon: LucideIcon;
    trend?: "up" | "down" | "neutral";
    subtext?: string;
}) {
    const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
    return (
        <Card className="relative overflow-hidden group hover:border-[#84a98c]/50 transition-all duration-300">
            {/* Ambient subtle glow on hover */}
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#84a98c]/5 blur-2xl group-hover:bg-[#84a98c]/15 transition-all duration-500" />

            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-[#cad2c5]/70">
                        {label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight text-[#cad2c5]">
                        {value}
                    </p>
                    {delta && (
                        <div
                            className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                                trend === "up"
                                    ? "text-[#84a98c]"
                                    : trend === "down"
                                    ? "text-rose-400"
                                    : "text-[#cad2c5]/60"
                            }`}
                        >
                            {trend !== "neutral" && <TrendIcon className="h-3 w-3" />}
                            <span>{delta}</span>
                        </div>
                    )}
                    {subtext && (
                        <p className="text-[11px] text-[#cad2c5]/50 mt-0.5">{subtext}</p>
                    )}
                </div>
                <div className="rounded-xl border border-[#52796f]/40 bg-[#354f52]/40 p-2.5 text-[#84a98c] shadow-inner group-hover:border-[#84a98c]/40 group-hover:bg-[#52796f]/30 transition-colors">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </Card>
    );
}