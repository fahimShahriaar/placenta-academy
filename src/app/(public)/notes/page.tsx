import { prisma } from "@/lib/prisma";
import { searchNotes } from "@/lib/search";
import { PdfCard } from "@/components/pdf/PdfCard";
import { PdfSearchBar } from "@/components/pdf/PdfSearchBar";
import { PdfFilterSidebar } from "@/components/pdf/PdfFilterSidebar";
import { Pagination } from "@/components/shared/Pagination";
import { Suspense } from "react";

const CATEGORY_ORDER = ["PHASE", "SUBJECT", "SYSTEM", "TOPIC", "OTHER"];
const CATEGORY_LABELS: Record<string, string> = {
    PHASE: "Phase",
    SUBJECT: "Subject",
    SYSTEM: "System",
    TOPIC: "Topic",
    OTHER: "Other",
};

export default async function NotesPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const params = await searchParams;
    const query = typeof params.q === "string" ? params.q : undefined;
    const page = typeof params.page === "string" ? parseInt(params.page) || 1 : 1;

    const tagSlugs: string[] = [];
    if (params.tag) {
        if (Array.isArray(params.tag)) {
            tagSlugs.push(...params.tag);
        } else {
            tagSlugs.push(params.tag);
        }
    }

    // Fetch tags with counts for the sidebar
    const allTags = await prisma.pdfTag.findMany({
        include: { _count: { select: { notes: true } } },
        orderBy: { name: "asc" },
    });

    const tagGroups = CATEGORY_ORDER.map((cat) => ({
        category: cat,
        label: CATEGORY_LABELS[cat],
        tags: allTags.filter((t) => t.category === cat),
    }));

    const { notes, totalPages, currentPage } = await searchNotes({
        query,
        tags: tagSlugs.length > 0 ? tagSlugs : undefined,
        page,
    });

    // Build search params for pagination
    const paginationParams: Record<string, string> = {};
    if (query) paginationParams.q = query;
    tagSlugs.forEach((t, i) => {
        paginationParams[`tag${i > 0 ? i : ""}`] = t;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Study Notes</h1>
                <p className="text-muted-foreground">
                    Browse and search medical education PDF notes
                </p>
            </div>

            <div className="mb-6">
                <Suspense>
                    <PdfSearchBar />
                </Suspense>
            </div>

            <div className="flex gap-8">
                <Suspense>
                    <PdfFilterSidebar tagGroups={tagGroups} />
                </Suspense>

                <div className="flex-1 min-w-0">
                    {notes.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-lg text-muted-foreground">
                                {query || tagSlugs.length > 0
                                    ? "No notes match your search or filters."
                                    : "No notes available yet."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {notes.map((note) => (
                                    <PdfCard
                                        key={note.id}
                                        title={note.title}
                                        slug={note.slug}
                                        description={note.description}
                                        createdAt={note.createdAt}
                                        tags={note.tags}
                                    />
                                ))}
                            </div>
                            <div className="mt-8">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    basePath="/notes"
                                    searchParams={paginationParams}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
