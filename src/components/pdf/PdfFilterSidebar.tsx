"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, LoaderCircle, SlidersHorizontal, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { toggleTagParam, useQueryNavigation } from "@/components/shared/QueryNavigation";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface TagGroup {
    category: string;
    label: string;
    tags: {
        id: number;
        name: string;
        slug: string;
        _count: { notes: number };
    }[];
}

const COLLAPSED_LIMIT = 8;

function FilterGroup({ group, activeTags, idPrefix }: { group: TagGroup; activeTags: string[]; idPrefix: string }) {
    const { update } = useQueryNavigation();
    const selectedInGroup = group.tags.filter((t) => activeTags.includes(t.slug)).length;
    const [expanded, setExpanded] = useState(false);
    const needsToggle = group.tags.length > COLLAPSED_LIMIT;
    // Selected tags stay visible even when the group is collapsed
    const visible =
        needsToggle && !expanded
            ? group.tags.filter((t, i) => i < COLLAPSED_LIMIT || activeTags.includes(t.slug))
            : group.tags;
    const headingId = `${idPrefix}-${group.category}`;

    return (
        <div role="group" aria-labelledby={headingId} className="border-t pt-4 first:border-t-0 first:pt-0">
            <h3 id={headingId} className="flex items-center justify-between px-2 text-sm font-semibold text-foreground">
                {group.label}
                {selectedInGroup > 0 && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                        {selectedInGroup} selected
                    </span>
                )}
            </h3>
            <ul className="mt-2 space-y-0.5">
                {visible.map((tag) => {
                    const checked = activeTags.includes(tag.slug);
                    const count = tag._count.notes;
                    return (
                        <li key={tag.id}>
                            <label
                                className={cn(
                                    "flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-[0.9375rem] transition-colors duration-150 hover:bg-muted",
                                    checked && "bg-secondary/70 hover:bg-secondary"
                                )}
                            >
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={() => update((p) => toggleTagParam(p, tag.slug))}
                                />
                                <span
                                    className={cn(
                                        "min-w-0 flex-1 break-words",
                                        checked ? "font-medium text-foreground" : count === 0 ? "text-muted-foreground" : "text-foreground"
                                    )}
                                >
                                    {tag.name}
                                </span>
                                <span className="text-xs text-muted-foreground tabular-nums" aria-label={pluralize(count, "note")}>
                                    {count}
                                </span>
                            </label>
                        </li>
                    );
                })}
            </ul>
            {needsToggle && (
                <button
                    type="button"
                    onClick={() => setExpanded((e) => !e)}
                    aria-expanded={expanded}
                    className="mt-1 inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm font-medium text-primary-ink hover:bg-muted"
                >
                    {expanded ? "Show fewer" : `Show all ${group.tags.length}`}
                    <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} aria-hidden="true" />
                </button>
            )}
        </div>
    );
}

function FilterGroups({ tagGroups, activeTags, idPrefix }: { tagGroups: TagGroup[]; activeTags: string[]; idPrefix: string }) {
    return (
        <div className="space-y-4">
            {tagGroups
                .filter((g) => g.tags.length > 0)
                .map((group) => (
                    <FilterGroup key={group.category} group={group} activeTags={activeTags} idPrefix={idPrefix} />
                ))}
        </div>
    );
}

const MATCH_HINT = "Notes matching any selected filter are shown.";

/** Desktop: contained, sticky filter panel. */
export function PdfFilterSidebar({ tagGroups, activeTags }: { tagGroups: TagGroup[]; activeTags: string[] }) {
    const { update, isPending } = useQueryNavigation();

    return (
        <div className="rounded-2xl border bg-card">
            <div className="flex items-center justify-between gap-2 border-b px-5 py-4">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                    Filters
                    {isPending && <LoaderCircle className="size-4 animate-spin text-muted-foreground" aria-label="Updating results" />}
                </h2>
                {activeTags.length > 0 && (
                    <Button variant="quiet" size="xs" onClick={() => update((p) => p.delete("tag"))}>
                        Clear all
                    </Button>
                )}
            </div>
            <div className="max-h-[calc(100dvh-13rem)] overflow-y-auto overscroll-contain px-3 py-4">
                <p className="mb-4 px-2 text-meta text-muted-foreground">{MATCH_HINT}</p>
                <div className="px-0">
                    <FilterGroups tagGroups={tagGroups} activeTags={activeTags} idPrefix="desktop" />
                </div>
            </div>
        </div>
    );
}

/** Mobile/tablet: filter trigger that opens an accessible drawer. */
export function PdfFilterDrawer({
    tagGroups,
    activeTags,
    total,
}: {
    tagGroups: TagGroup[];
    activeTags: string[];
    total: number;
}) {
    const [open, setOpen] = useState(false);
    const { update, isPending } = useQueryNavigation();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="outline" size="default" className="shrink-0" />}>
                <SlidersHorizontal data-icon="inline-start" />
                Filters
                {activeTags.length > 0 && (
                    <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                        {activeTags.length}
                    </span>
                )}
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-md data-[side=right]:sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Filter notes</SheetTitle>
                    <SheetDescription>{MATCH_HINT}</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
                    <FilterGroups tagGroups={tagGroups} activeTags={activeTags} idPrefix="drawer" />
                </div>
                <SheetFooter className="flex-row gap-2">
                    <Button
                        variant="outline"
                        size="lg"
                        className="flex-1"
                        disabled={activeTags.length === 0}
                        onClick={() => update((p) => p.delete("tag"))}
                    >
                        Clear all
                    </Button>
                    <Button size="lg" className="flex-[1.4]" onClick={() => setOpen(false)}>
                        {isPending ? (
                            <>
                                <LoaderCircle className="animate-spin" data-icon="inline-start" />
                                Updating…
                            </>
                        ) : (
                            `Show ${pluralize(total, "note")}`
                        )}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

/** Removable chips for the active search and filters. */
export function ActiveFilters({
    query,
    activeTags,
}: {
    query: string;
    activeTags: { slug: string; name: string; category: string; categoryLabel: string }[];
}) {
    const { update, hrefFor } = useQueryNavigation();
    if (!query && activeTags.length === 0) return null;

    const chip =
        "inline-flex h-8 max-w-full items-center gap-1.5 rounded-full border border-primary/25 bg-secondary pr-1.5 pl-3 text-sm text-secondary-foreground transition-colors hover:border-primary/50";

    return (
        <ul className="flex flex-wrap items-center gap-2" aria-label="Active filters">
            {query && (
                <li className="max-w-full">
                    <Link
                        href={hrefFor((p) => p.delete("q"))}
                        onClick={(e) => {
                            e.preventDefault();
                            update((p) => p.delete("q"));
                        }}
                        className={chip}
                        aria-label={`Remove search “${query}”`}
                    >
                        <span className="truncate">
                            <span className="text-secondary-foreground/70">Search:</span>{" "}“{query}”
                        </span>
                        <X className="size-3.5 shrink-0" aria-hidden="true" />
                    </Link>
                </li>
            )}
            {activeTags.map((tag) => (
                <li key={tag.slug} className="max-w-full">
                    <Link
                        href={hrefFor((p) => toggleTagParam(p, tag.slug))}
                        onClick={(e) => {
                            e.preventDefault();
                            update((p) => toggleTagParam(p, tag.slug));
                        }}
                        className={chip}
                        aria-label={`Remove filter ${tag.categoryLabel}: ${tag.name}`}
                    >
                        <span className="truncate">
                            <span className="text-secondary-foreground/70">{tag.categoryLabel}:</span> {tag.name}
                        </span>
                        <X className="size-3.5 shrink-0" aria-hidden="true" />
                    </Link>
                </li>
            ))}
            <li>
                <Link
                    href={hrefFor((p) => {
                        p.delete("q");
                        p.delete("tag");
                    })}
                    onClick={(e) => {
                        e.preventDefault();
                        update((p) => {
                            p.delete("q");
                            p.delete("tag");
                        });
                    }}
                    className="inline-flex h-8 items-center rounded-md px-2 text-sm font-medium text-primary-ink underline-offset-4 hover:underline"
                >
                    Clear all
                </Link>
            </li>
        </ul>
    );
}
