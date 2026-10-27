import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDate, formatFileSize } from "@/lib/format";
import { accentFor, summarizeNoteTags, type Accent } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

interface PdfCardProps {
    title: string;
    slug: string;
    description: string | null;
    createdAt: Date;
    fileSize?: number;
    tags: {
        tag: {
            id: number;
            name: string;
            slug: string;
            category: string;
        };
    }[];
    layout?: "card" | "row" | "feature";
    headingLevel?: "h2" | "h3";
    className?: string;
}

const GLYPH_TONES: Record<Accent, { sheet: string; fold: string; band: string; text: string }> = {
    teal: { sheet: "fill-secondary", fold: "fill-mint-strong", band: "fill-primary", text: "fill-primary-foreground" },
    coral: { sheet: "fill-coral-soft", fold: "fill-coral/35", band: "fill-coral-ink", text: "fill-white" },
    ink: { sheet: "fill-muted", fold: "fill-border-strong", band: "fill-ink dark:fill-foreground", text: "fill-ink-foreground dark:fill-background" },
};

/** Compact document glyph: a folded sheet with a PDF band, tinted per subject. */
export function DocGlyph({ accent, className }: { accent: Accent; className?: string }) {
    const tone = GLYPH_TONES[accent];
    return (
        <svg viewBox="0 0 40 48" aria-hidden="true" className={cn("h-12 w-10 shrink-0", className)}>
            <path d="M4 4a4 4 0 0 1 4-4h19l13 13v31a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" className={tone.sheet} />
            <path d="M27 0l13 13H31a4 4 0 0 1-4-4z" className={tone.fold} />
            <path d="M11 22h18M11 27h14M11 32h16" strokeWidth="2" strokeLinecap="round" className="stroke-foreground/20" />
            <rect x="0" y="36" width="24" height="10" rx="3" className={tone.band} />
            <text x="12" y="43.4" textAnchor="middle" fontSize="7" fontWeight="700" letterSpacing="0.4" className={tone.text}>
                PDF
            </text>
        </svg>
    );
}

export function PdfCard({
    title,
    slug,
    description,
    createdAt,
    fileSize,
    tags,
    layout = "card",
    headingLevel = "h3",
    className,
}: PdfCardProps) {
    const { subject, phase, rest } = summarizeNoteTags(tags.map((t) => t.tag));
    const accent = accentFor(subject?.slug ?? slug);
    const Heading = headingLevel;
    const visibleRest = rest.slice(0, layout === "row" ? 3 : 2);
    const hiddenCount = rest.length - visibleRest.length;
    const href = `/notes/${slug}`;

    const eyebrow =
        subject || phase ? (
            <p className="eyebrow flex min-w-0 flex-wrap items-center gap-x-1.5">
                {subject && <span>{subject.name}</span>}
                {subject && phase && <span aria-hidden="true" className="text-muted-foreground/60">·</span>}
                {phase && <span className="text-muted-foreground">{phase.name}</span>}
            </p>
        ) : (
            <p className="eyebrow text-muted-foreground">Study note</p>
        );

    const tagList =
        visibleRest.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-1.5" aria-label="Tags">
                {visibleRest.map((t) => (
                    <li
                        key={t.id}
                        className="inline-flex h-6 max-w-[12rem] items-center truncate rounded-full bg-muted px-2.5 text-xs font-medium text-foreground/80"
                    >
                        <span className="truncate">{t.name}</span>
                    </li>
                ))}
                {hiddenCount > 0 && (
                    <li className="text-xs font-medium text-muted-foreground">+{hiddenCount} more</li>
                )}
            </ul>
        ) : null;

    const meta = (
        <p className="text-meta text-muted-foreground">
            <time dateTime={createdAt.toISOString()}>{formatDate(createdAt)}</time>
            {fileSize !== undefined && (
                <>
                    <span aria-hidden="true" className="mx-1.5">·</span>
                    PDF, {formatFileSize(fileSize)}
                </>
            )}
        </p>
    );

    const action = (
        <span
            aria-hidden="true"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary-ink"
        >
            Open note
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
    );

    const titleLink = (
        <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:rounded-[inherit] after:content-['']"
        >
            {title}
        </Link>
    );

    const shell =
        "group relative rounded-2xl border bg-card transition-[border-color,box-shadow,transform] duration-200 ease-(--ease-standard) hover:border-border-strong hover:shadow-md has-[a:focus-visible]:border-ring has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/30 motion-safe:hover:-translate-y-0.5";

    if (layout === "row") {
        return (
            <article className={cn(shell, "flex gap-4 p-4 sm:gap-5 sm:p-5", className)}>
                <DocGlyph accent={accent} className="mt-0.5 hidden sm:block" />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    {eyebrow}
                    <Heading className="text-card font-semibold text-pretty text-foreground transition-colors group-hover:text-primary-ink">
                        {titleLink}
                    </Heading>
                    {description && (
                        <p className="line-clamp-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
                            {description}
                        </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
                            {meta}
                            {tagList}
                        </div>
                        {action}
                    </div>
                </div>
            </article>
        );
    }

    if (layout === "feature") {
        return (
            <article className={cn(shell, "grid overflow-hidden md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]", className)}>
                <div className="relative flex min-h-48 items-center justify-center overflow-hidden bg-mint p-8">
                    <svg viewBox="0 0 200 160" aria-hidden="true" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
                        <defs>
                            <pattern id={`feature-grid-${slug}`} width="16" height="16" patternUnits="userSpaceOnUse">
                                <path d="M16 0H0v16" fill="none" strokeWidth="0.6" className="stroke-primary/15" />
                            </pattern>
                        </defs>
                        <rect width="200" height="160" fill={`url(#feature-grid-${slug})`} />
                        <circle cx="168" cy="26" r="46" className="fill-primary/8" />
                    </svg>
                    <div className="relative rotate-[-4deg] rounded-xl border bg-card p-4 shadow-md transition-transform duration-300 group-hover:rotate-[-2deg]">
                        <DocGlyph accent={accent} className="h-24 w-20" />
                    </div>
                </div>
                <div className="flex min-w-0 flex-col gap-2 p-6 sm:p-8">
                    {eyebrow}
                    <Heading className="font-display text-[1.625rem] leading-tight font-semibold tracking-[-0.015em] text-balance text-foreground sm:text-[1.875rem]">
                        {titleLink}
                    </Heading>
                    {description && (
                        <p className="line-clamp-3 text-base leading-relaxed text-muted-foreground">{description}</p>
                    )}
                    {tagList && <div className="mt-2">{tagList}</div>}
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
                        {meta}
                        {action}
                    </div>
                </div>
            </article>
        );
    }

    return (
        <article className={cn(shell, "flex h-full flex-col p-5 sm:p-6", className)}>
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 pt-1">{eyebrow}</div>
                <DocGlyph accent={accent} className="h-10 w-8" />
            </div>
            <Heading className="mt-3 text-card font-semibold text-pretty text-foreground transition-colors group-hover:text-primary-ink">
                {titleLink}
            </Heading>
            {description && (
                <p className="mt-2 line-clamp-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{description}</p>
            )}
            {tagList && <div className="mt-4">{tagList}</div>}
            <div className="mt-auto pt-5">
                <div className="flex items-center justify-between gap-3 border-t border-dashed pt-4">
                    {meta}
                    {action}
                </div>
            </div>
        </article>
    );
}
