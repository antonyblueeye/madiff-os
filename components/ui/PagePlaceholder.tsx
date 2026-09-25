import { Card } from "./Card";
import { LucideIcon, Sparkles } from "lucide-react";
import Link from "next/link";

export function PagePlaceholder({
    title,
    description,
    icon: Icon,
    tag = "Madiff System",
    action,
    actions,
    children,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    tag?: string;
    action?: React.ReactNode;
    actions?: React.ReactNode;
    children?: React.ReactNode;
}) {
    const actionEl = action || actions;
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Clean Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-[#eaedf3] shadow-sm">
                <div className="flex items-center gap-3.5">
                    <div className="rounded-xl bg-[#f4f6fa] border border-[#eaedf3] p-2.5 text-[#354f52]">
                        <Icon className="h-6 w-6 text-[#52796f]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold tracking-tight text-[#1f2d3d]">{title}</h1>
                            <span className="rounded-md bg-[#84a98c]/15 px-2 py-0.5 text-xs font-semibold text-[#354f52] border border-[#84a98c]/30">
                                {tag}
                            </span>
                        </div>
                        <p className="text-xs text-[#6e84a3] mt-0.5">{description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    {actionEl}
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-lg border border-[#e2e8f0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#475569] hover:bg-[#f8fafc] hover:text-[#1e293b] transition-all"
                    >
                        Overview
                    </Link>
                </div>
            </div>

            {children ? (
                children
            ) : (
                <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed border-[#cbd5e1]">
                    <div className="rounded-2xl bg-[#f1f5f9] p-4 text-[#52796f] mb-3">
                        <Sparkles className="h-7 w-7" />
                    </div>
                    <h3 className="text-sm font-bold text-[#1f2d3d]">Module Ready</h3>
                    <p className="mt-1 max-w-md text-xs text-[#6e84a3]">
                        This workspace connects to live sync and execution endpoints.
                    </p>
                </Card>
            )}
        </div>
    );
}