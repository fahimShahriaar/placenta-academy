"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { SearchField } from "@/components/shared/SearchField";
import { toggleTagParam, useQueryNavigation } from "@/components/shared/QueryNavigation";
import { cn } from "@/lib/utils";

interface BlogTag {
    id: number;
    name: string;
    slug: string;
    _count: { posts: number };
}

export function BlogSearch({ query, tags }: { query: string; tags: string[] }) {
    return (
        <SearchField
            action="/blog"
            defaultValue={query}
            tags={tags}
            size="xl"
            label="Search articles"
            placeholder="Search article titles"
            hint="Matches words in article titles."
        />
    );
}

export function BlogFilterBar({ tags, activeTags }: { tags: BlogTag[]; activeTags: string[] }) {
    const { update, hrefFor } = useQueryNavigation();

    if (tags.length === 0) return null;

    const chip =
        "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,color] duration-150 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none";

    return (
        <div role="group" aria-labelledby="topic-filter-label" className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
            <p id="topic-filter-label" className="shrink-0 pt-2.5 text-sm font-semibold text-foreground">
                Topics
            </p>
            <ul className="flex flex-wrap gap-2">
                <li>
                    <Link
                        href={hrefFor((p) => p.delete("tag"))}
                        onClick={(e) => {
                            e.preventDefault();
                            update((p) => p.delete("tag"));
                        }}
                        aria-current={activeTags.length === 0 ? "true" : undefined}
                        className={cn(
                            chip,
                            activeTags.length === 0
                                ? "border-ink bg-ink text-ink-foreground dark:border-foreground dark:bg-foreground dark:text-background"
                                : "border-border-strong bg-card text-foreground hover:border-foreground/40"
                        )}
                    >
                        All topics
                    </Link>
                </li>
                {tags.map((tag) => {
                    const active = activeTags.includes(tag.slug);
                    return (
                        <li key={tag.id}>
                            <button
                                type="button"
                                aria-pressed={active}
                                onClick={() => update((p) => toggleTagParam(p, tag.slug))}
                                className={cn(
                                    chip,
                                    active
                                        ? "border-primary/40 bg-secondary text-secondary-foreground"
                                        : "border-border-strong bg-card text-foreground hover:border-foreground/40",
                                    tag._count.posts === 0 && !active && "text-muted-foreground"
                                )}
                            >
                                {active && <Check className="-ml-1 size-4" aria-hidden="true" />}
                                {tag.name}
                                <span className="text-xs text-muted-foreground tabular-nums">
                                    {tag._count.posts}
                                    <span className="sr-only"> {tag._count.posts === 1 ? "article" : "articles"}</span>
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
