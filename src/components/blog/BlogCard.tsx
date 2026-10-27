import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlogCover } from "@/components/blog/BlogCover";
import { formatDate, readingMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";

interface BlogCardProps {
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    createdAt: Date;
    publishedAt?: Date | null;
    content?: string;
    tags: {
        tag: {
            id: number;
            name: string;
            slug: string;
        };
    }[];
    layout?: "card" | "row" | "lead";
    eyebrow?: string;
    headingLevel?: "h2" | "h3";
    priority?: boolean;
    className?: string;
}

export function BlogCard({
    title,
    slug,
    excerpt,
    coverImage,
    createdAt,
    publishedAt,
    content,
    tags,
    layout = "card",
    eyebrow,
    headingLevel = "h3",
    priority = false,
    className,
}: BlogCardProps) {
    const Heading = headingLevel;
    const date = publishedAt ?? createdAt;
    const topic = tags[0]?.tag.name;
    const minutes = content ? readingMinutes(content) : null;

    const meta = (
        <p className="text-meta text-muted-foreground">
            <time dateTime={date.toISOString()}>{formatDate(date)}</time>
            {minutes && (
                <>
                    <span aria-hidden="true" className="mx-1.5">·</span>
                    {minutes} min read
                </>
            )}
        </p>
    );

    const kicker = (eyebrow || topic) && (
        <p className="eyebrow flex flex-wrap items-center gap-x-1.5">
            {eyebrow && <span className="text-coral-ink">{eyebrow}</span>}
            {eyebrow && topic && <span aria-hidden="true" className="text-muted-foreground/60">·</span>}
            {topic && <span>{topic}</span>}
        </p>
    );

    const titleLink = (
        <Link
            href={`/blog/${slug}`}
            className="outline-none after:absolute after:inset-0 after:z-10 after:rounded-[inherit] after:content-['']"
        >
            {title}
        </Link>
    );

    const shell =
        "group relative overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow,transform] duration-200 ease-(--ease-standard) hover:border-border-strong hover:shadow-md has-[a:focus-visible]:border-ring has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/30";

    if (layout === "lead") {
        return (
            <article className={cn(shell, "grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]", className)}>
                <BlogCover
                    slug={slug}
                    coverImage={coverImage}
                    alt=""
                    label={topic}
                    labelSize="lg"
                    priority={priority}
                    sizes="(min-width: 1280px) 660px, (min-width: 768px) 55vw, 100vw"
                    className="aspect-[16/10] md:aspect-auto md:min-h-[22rem]"
                />
                <div className="flex min-w-0 flex-col p-6 sm:p-8 lg:p-10">
                    {kicker}
                    <Heading className="mt-3 font-display text-section font-semibold text-balance text-foreground">
                        {titleLink}
                    </Heading>
                    {excerpt && (
                        <p className="mt-4 line-clamp-4 text-[1.0625rem] leading-relaxed text-pretty text-muted-foreground">
                            {excerpt}
                        </p>
                    )}
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-8">
                        {meta}
                        <span aria-hidden="true" className="inline-flex items-center gap-1 text-sm font-medium text-primary-ink">
                            Read article
                            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </span>
                    </div>
                </div>
            </article>
        );
    }

    if (layout === "row") {
        return (
            <article className={cn(shell, "flex gap-4 p-3 sm:gap-5", className)}>
                <BlogCover
                    slug={slug}
                    coverImage={coverImage}
                    alt=""
                    label={topic}
                    labelSize="sm"
                    sizes="160px"
                    className="aspect-[4/3] w-28 shrink-0 rounded-xl sm:w-40 [&>div]:p-3"
                />
                <div className="flex min-w-0 flex-1 flex-col py-1 pr-2">
                    {kicker}
                    <Heading className="mt-1 line-clamp-3 text-[1.0625rem] leading-snug font-semibold text-pretty text-foreground transition-colors group-hover:text-primary-ink">
                        {titleLink}
                    </Heading>
                    <div className="mt-auto pt-2">{meta}</div>
                </div>
            </article>
        );
    }

    return (
        <article className={cn(shell, "flex h-full flex-col motion-safe:hover:-translate-y-0.5", className)}>
            <BlogCover
                slug={slug}
                coverImage={coverImage}
                alt=""
                label={topic}
                priority={priority}
                sizes="(min-width: 1280px) 400px, (min-width: 640px) 50vw, 100vw"
                className="aspect-[16/10]"
            />
            <div className="flex flex-1 flex-col p-5 sm:p-6">
                {kicker}
                <Heading className="mt-2 text-card font-semibold text-pretty text-foreground transition-colors group-hover:text-primary-ink">
                    {titleLink}
                </Heading>
                {excerpt && (
                    <p className="mt-2 line-clamp-3 text-[0.9375rem] leading-relaxed text-muted-foreground">{excerpt}</p>
                )}
                <div className="mt-auto pt-5">{meta}</div>
            </div>
        </article>
    );
}
