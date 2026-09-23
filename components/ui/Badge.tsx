import { cn } from "@/lib/utils";

const variants = {
    default: "bg-[#f1f4f8] text-[#52796f] border-[#e2e8f0]",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    accent: "bg-[#84a98c]/15 text-[#354f52] border-[#84a98c]/30 font-semibold",
    brand: "bg-[#2f3e46] text-white border-transparent",
    sage: "bg-[#84a98c]/20 text-[#2f3e46] border-[#84a98c]/30",
};

export function Badge({
    children,
    variant = "default",
    className,
}: {
    children: React.ReactNode;
    variant?: keyof typeof variants;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-tight transition-colors",
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}