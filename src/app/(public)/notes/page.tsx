import type { Metadata } from "next";
import Link from "next/link";
import { FileSearch, LibraryBig } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { searchNotes } from "@/lib/search";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { PdfCard } from "@/components/pdf/PdfCard";
import { PdfSearchBar } from "@/components/pdf/PdfSearchBar";
import {
    ActiveFilters,
    PdfFilterDrawer,
    PdfFilterSidebar,
    type TagGroup,
} from "@/components/pdf/PdfFilterSidebar";
import { PendingRegion, QueryNavigationProvider } from "@/components/shared/QueryNavigation";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { buttonVariants } from "@/components/ui/button-variants";
import { pluralize } from "@/lib/format";
import { CATEGORY_LABELS, CATEGORY_ORDER, CATEGORY_PLURALS, compareTagNames } from "@/lib/taxonomy";

export const metadata: Metadata = {
    title: "Study notes",
    description: "Search and filter medical study notes by phase, subject, system, and topic.",
};

export default async function NotesPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const params = await searchParams;
    const query = typeof params.q === "string" ? params.q.trim() : "";
    const page = typeof params.page === "string" ? Math.max(1, parseInt(params.page) || 1) : 1;

    const tagSlugs: string[] = [];
    if (params.tag) {
        if (Array.isArray(params.tag)) {
            tagSlugs.push(...params.tag);
        } else {
            tagSlugs.push(params.tag);
        }
    }

    const [allTags, { notes, total, totalPages, currentPage }] = await Promise.all([
        prisma.pdfTag.findMany({
            include: { _count: { select: { notes: true } } },
            orderBy: { name: "asc" },
        }),
        searchNotes({
            query: query || undefined,
            tags: tagSlugs.length > 0 ? tagSlugs : undefined,
            page,
        }),
    ]);

    const tagGroups: TagGroup[] = CATEGORY_ORDER.map((cat) => ({
        category: cat,
        label: CATEGORY_PLURALS[cat],
        tags: allTags.filter((t) => t.category === cat).sort(compareTagNames),
    }));

    const activeTags = allTags
        .filter((t) => tagSlugs.includes(t.slug))
        .map((t) => ({
            slug: t.slug,
            name: t.name,
            category: t.category,
            categoryLabel: CATEGORY_LABELS[t.category],
        }));

    // Build search params for pagination
    const paginationParams: Record<string, string | string[]> = { tag: tagSlugs };
    if (query) paginationParams.q = query;

    const currentQuery = new URLSearchParams();
    if (query) currentQuery.set("q", query);
    tagSlugs.forEach((t) => currentQuery.append("tag", t));

    const filtering = Boolean(query) || tagSlugs.length > 0;
    const firstShown = total === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const lastShown = Math.min(total, currentPage * ITEMS_PER_PAGE);

    return (
        <QueryNavigationProvider basePath="/notes" query={currentQuery.toString()}>
            <div className="border-b bg-card/70">
                <div className="container-page grid gap-8 pt-10 pb-10 md:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-end lg:gap-14 lg:pb-12">
                    <div className="max-w-xl">
                        <p className="eyebrow">Notes library</p>
                        <h1 className="mt-2 font-display text-title font-semibold text-balance">Study notes</h1>
                        <p className="mt-3 text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
                            PDF notes you can read in the browser or download. Search them, or
                            narrow the list by phase, subject, system, and topic.
                        </p>
                    </div>
                    <PdfSearchBar query={query} tags={tagSlugs} />
                </div>
            </div>

            <div className="container-page pt-8 pb-16 md:pt-10 md:pb-24 lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-10 xl:gap-12">
                <aside aria-label="Filters" className="hidden lg:block">
                    <div className="sticky top-24">
                        <PdfFilterSidebar tagGroups={tagGroups} activeTags={tagSlugs} />
                    </div>
                </aside>

                <section aria-labelledby="results-heading" className="min-w-0">
                    <div className="flex items-center justify-between gap-4">
                        <h2 id="results-heading" className="text-base font-semibold" aria-live="polite">
                            {total === 0 ? (
                                "No matching notes"
                            ) : totalPages > 1 ? (
                                <>
                                    {firstShown}–{lastShown}{" "}
                                    <span className="font-normal text-muted-foreground">of {pluralize(total, "note")}</span>
                                </>
                            ) : (
                                pluralize(total, "note")
                            )}
                        </h2>
                        <div className="lg:hidden">
                            <PdfFilterDrawer tagGroups={tagGroups} activeTags={tagSlugs} total={total} />
                        </div>
                    </div>

                    {filtering && (
                        <div className="mt-4">
                            <ActiveFilters query={query} activeTags={activeTags} />
                        </div>
                    )}

                    <PendingRegion className="mt-6">
                        {notes.length === 0 && total > 0 ? (
                            <EmptyState
                                icon={FileSearch}
                                title={`There's no page ${currentPage}`}
                                description={`These results only run to ${pluralize(totalPages, "page")}.`}
                            >
                                <Link
                                    href={`/notes${currentQuery.size > 0 ? `?${currentQuery.toString()}` : ""}`}
                                    className={buttonVariants({ variant: "outline" })}
                                >
                                    Go to the first page
                                </Link>
                            </EmptyState>
                        ) : notes.length === 0 ? (
                            filtering ? (
                                <EmptyState
                                    icon={FileSearch}
                                    title={query ? `No notes match “${query}”` : "No notes match these filters"}
                                    description={
                                        <>
                                            Search looks at note titles, descriptions, and alternate names.
                                            {tagSlugs.length > 0 && " Try removing a filter or two."}
                                        </>
                                    }
                                >
                                    <Link href="/notes" className={buttonVariants({ variant: "outline" })}>
                                        Clear search and filters
                                    </Link>
                                </EmptyState>
                            ) : (
                                <EmptyState
                                    icon={LibraryBig}
                                    title="No notes have been published yet"
                                    description="New study notes will appear here as soon as they're added."
                                >
                                    <Link href="/blog" className={buttonVariants({ variant: "outline" })}>
                                        Read the blog meanwhile
                                    </Link>
                                </EmptyState>
                            )
                        ) : (
                            <>
                                <ul className="grid gap-4">
                                    {notes.map((note) => (
                                        <li key={note.id}>
                                            <PdfCard
                                                title={note.title}
                                                slug={note.slug}
                                                description={note.description}
                                                createdAt={note.createdAt}
                                                fileSize={note.fileSize}
                                                tags={note.tags}
                                                layout="row"
                                            />
                                        </li>
                                    ))}
                                </ul>
                                {totalPages > 1 && (
                                    <div className="mt-10 border-t pt-6">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            basePath="/notes"
                                            searchParams={paginationParams}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </PendingRegion>
                </section>
            </div>
        </QueryNavigationProvider>
    );
}
