import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
    icon: Icon,
    title,
    description,
    children,
    className,
    tone = "default",
}: {
    icon: LucideIcon;
    title: string;
    description?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    tone?: "default" | "plain";
}) {
    return (
        <div
            className={cn(
                "flex flex-col items-center px-6 py-14 text-center sm:py-16",
                tone === "default" && "rounded-2xl border border-dashed border-border-strong bg-card/60",
                className
            )}
        >
            <div className="relative mb-5">
                <span
                    aria-hidden="true"
                    className="absolute -inset-3 rounded-full border border-dashed border-primary/25"
                />
                <span className="relative flex size-14 items-center justify-center rounded-full bg-secondary text-primary-ink">
                    <Icon className="size-6" aria-hidden="true" />
                </span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-balance">{title}</h2>
            {description && (
                <div className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-pretty text-muted-foreground">
                    {description}
                </div>
            )}
            {children && <div className="mt-6 flex flex-wrap items-center justify-center gap-2">{children}</div>}
        </div>
    );
}
