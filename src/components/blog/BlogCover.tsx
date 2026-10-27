import Image from "next/image";
import { accentFor, type Accent } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

const PALETTES: Record<Accent, { bg: string; ink: string; mark: string }> = {
    teal: { bg: "bg-mint", ink: "text-secondary-foreground", mark: "stroke-primary/35 fill-primary/35" },
    coral: { bg: "bg-coral-soft", ink: "text-coral-ink", mark: "stroke-coral/60 fill-coral/60" },
    ink: { bg: "bg-ink", ink: "text-ink-foreground", mark: "stroke-primary/60 fill-primary/60" },
};

const PATTERNS = ["rings", "lines", "dots", "branches"] as const;

function patternFor(key: string) {
    let hash = 7;
    for (let i = 0; i < key.length; i++) hash = (hash * 17 + key.charCodeAt(i)) >>> 0;
    return PATTERNS[hash % PATTERNS.length];
}

function Pattern({ kind, className, id }: { kind: (typeof PATTERNS)[number]; className: string; id: string }) {
    return (
        <svg
            viewBox="0 0 400 250"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            className={cn("absolute inset-0 size-full", className)}
            fill="none"
        >
            {kind === "rings" && (
                <g strokeWidth="1.5" className="fill-none!">
                    {[40, 75, 110, 145, 180].map((r) => (
                        <circle key={r} cx="340" cy="40" r={r} />
                    ))}
                </g>
            )}
            {kind === "lines" && (
                <>
                    <defs>
                        <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
                            <path d="M0 0v14" strokeWidth="1.5" className="fill-none!" />
                        </pattern>
                    </defs>
                    <path d="M200 0h200v250H120z" fill={`url(#${id})`} className="stroke-none!" />
                </>
            )}
            {kind === "dots" && (
                <>
                    <defs>
                        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
                            <circle cx="3" cy="3" r="1.6" className="stroke-none!" />
                        </pattern>
                    </defs>
                    <rect x="0" y="0" width="400" height="250" fill={`url(#${id})`} className="stroke-none!" />
                </>
            )}
            {kind === "branches" && (
                <>
                    <g strokeWidth="2.5" strokeLinecap="round" className="fill-none!">
                        <path d="M330 250V170c0-30-30-46-66-56M330 170c0-30 30-46 66-56M330 170V96M264 114l-14-34M264 114l-38-6" />
                    </g>
                    <circle cx="330" cy="88" r="7" className="stroke-none!" />
                </>
            )}
        </svg>
    );
}

/**
 * Article cover. Uses the uploaded image when present; otherwise a
 * deterministic typographic cover so each article keeps a stable look.
 */
export function BlogCover({
    slug,
    coverImage,
    alt,
    label,
    sizes,
    priority = false,
    className,
    labelSize = "md",
}: {
    slug: string;
    coverImage: string | null;
    alt: string;
    label?: string;
    sizes: string;
    priority?: boolean;
    className?: string;
    labelSize?: "sm" | "md" | "lg";
}) {
    if (coverImage) {
        return (
            <div className={cn("relative overflow-hidden bg-muted", className)}>
                <Image
                    src={`/api/uploads/${coverImage}`}
                    alt={alt}
                    fill
                    sizes={sizes}
                    priority={priority}
                    className="object-cover transition-transform duration-500 ease-(--ease-standard) group-hover:scale-[1.03]"
                />
            </div>
        );
    }

    const accent = accentFor(slug);
    const palette = PALETTES[accent];
    const kind = patternFor(slug);

    return (
        <div aria-hidden="true" className={cn("relative overflow-hidden", palette.bg, className)}>
            <Pattern kind={kind} id={`cover-${kind}-${slug}`} className={palette.mark} />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <span
                    className={cn(
                        "block font-display leading-[0.95] font-semibold tracking-[-0.02em] text-balance",
                        palette.ink,
                        labelSize === "lg" && "text-[clamp(2rem,4vw,3.25rem)]",
                        labelSize === "md" && "text-[1.75rem]",
                        labelSize === "sm" && "text-lg"
                    )}
                >
                    {label ?? "Article"}
                </span>
            </div>
        </div>
    );
}
