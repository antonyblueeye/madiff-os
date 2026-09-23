import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={cn("rounded-xl border border-[#eaedf3] bg-white p-5 shadow-sm transition-all hover:shadow-md", className)}>
            {children}
        </div>
    );
}

export function CardHeader({
    title,
    subtitle,
    action,
    icon,
}: {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    icon?: React.ReactNode;
}) {
    return (
        <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
                {icon && <span className="text-[#354f52]">{icon}</span>}
                <div>
                    <h3 className="text-sm font-bold text-[#1f2d3d] tracking-tight">{title}</h3>
                    {subtitle && <p className="text-xs text-[#6e84a3] mt-0.5">{subtitle}</p>}
                </div>
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}