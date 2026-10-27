import { cn } from "@/lib/utils";

/**
 * Brand mark: a branching vessel tree — the placenta's "tree of life" —
 * rising from a single trunk, read here as knowledge organized into branches.
 */
export function BrandMark({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 32 32"
            aria-hidden="true"
            className={cn("size-8 shrink-0", className)}
        >
            <rect width="32" height="32" rx="9" className="fill-primary" />
            <g
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.9"
                className="stroke-primary-foreground"
            >
                <path d="M16 25.5V17" />
                <path d="M16 17c0-3-2.6-4.6-5.6-5.4" />
                <path d="M16 17c0-3 2.6-4.6 5.6-5.4" />
                <path d="M10.4 11.6 9.2 8.2M10.4 11.6 7 11" />
                <path d="M21.6 11.6l1.2-3.4M21.6 11.6 25 11" />
                <path d="M16 17v-5" />
                <path d="M11.5 25.5h9" />
            </g>
            <circle cx="16" cy="9.6" r="2.3" className="fill-coral" />
        </svg>
    );
}

export function Logo({
    className,
    markClassName,
    tone = "default",
}: {
    className?: string;
    markClassName?: string;
    tone?: "default" | "inverted";
}) {
    return (
        <span className={cn("inline-flex items-center gap-2.5", className)}>
            <BrandMark className={markClassName} />
            <span
                className={cn(
                    "font-display text-[1.3125rem] leading-none font-semibold tracking-[-0.015em] whitespace-nowrap",
                    tone === "inverted" ? "text-ink-foreground" : "text-foreground"
                )}
            >
                Placenta{" "}
                <span
                    className={cn(
                        "font-medium",
                        tone === "inverted" ? "text-ink-muted" : "text-primary-ink"
                    )}
                >
                    Academy
                </span>
            </span>
        </span>
    );
}
