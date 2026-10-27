import { cache } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { PdfReader } from "@/components/pdf/PdfReader";
import { TagBadge } from "@/components/shared/TagBadge";
import { ShareButtons } from "@/components/shared/ShareButtons";
import { PdfCard } from "@/components/pdf/PdfCard";
import { buttonVariants } from "@/components/ui/button-variants";
import { formatDate, formatFileSize } from "@/lib/format";
import { summarizeNoteTags } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Shared by generateMetadata and the page within one request
const getNote = cache(async (slug: string) => {
    return prisma.pdfNote.findUnique({
        where: { slug },
        include: {
            tags: {
                include: { tag: true },
            },
        },
    });
});

async function getRelatedNotes(
    noteId: number,
    tagIds: number[],
    limit = 4
) {
    if (tagIds.length === 0) return [];
    return prisma.pdfNote.findMany({
        where: {
            id: { not: noteId },
            tags: { some: { tagId: { in: tagIds } } },
        },
        include: {
            tags: { include: { tag: true } },
        },
        orderBy: { viewCount: "desc" },
        take: limit,
    });
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const note = await getNote(slug);
    if (!note) return { title: "Not Found" };

    const tags = note.tags.map((t) => t.tag.name);
    return {
        title: note.title,
        description: note.description || `Read ${note.title} on ${SITE_NAME}`,
        keywords: tags,
        openGraph: {
            title: note.title,
            description: note.description || undefined,
            url: `${SITE_URL}/notes/${note.slug}`,
            type: "article",
        },
    };
}

export default async function NotePage({ params }: PageProps) {
    const { slug } = await params;
    const note = await getNote(slug);
    if (!note) notFound();

    // Increment view count (simple — no cookie dedup in server component)
    await prisma.pdfNote.update({
        where: { id: note.id },
        data: { viewCount: { increment: 1 } },
    });

    const tagIds = note.tags.map((t) => t.tagId);
    const relatedNotes = await getRelatedNotes(note.id, tagIds);

    const pageUrl = `${SITE_URL}/notes/${note.slug}`;
    const { subject, phase, rest } = summarizeNoteTags(note.tags.map((t) => t.tag));
    const views = note.viewCount + 1;

    return (
        <>
            <div className="container-page pt-6 md:pt-10">
                <nav aria-label="Breadcrumb">
                    <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                        <li>
                            <Link href="/notes" className="rounded-sm underline-offset-4 hover:text-foreground hover:underline">
                                Study notes
                            </Link>
                        </li>
                        {subject && (
                            <>
                                <li aria-hidden="true">
                                    <ChevronRight className="size-3.5" />
                                </li>
                                <li>
                                    <Link
                                        href={`/notes?tag=${subject.slug}`}
                                        className="rounded-sm underline-offset-4 hover:text-foreground hover:underline"
                                    >
                                        {subject.name}
                                    </Link>
                                </li>
                            </>
                        )}
                    </ol>
                </nav>

                <header className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end lg:gap-12">
                    <div className="min-w-0">
                        {(subject || phase) && (
                            <p className="eyebrow flex flex-wrap gap-x-1.5">
                                {subject && <span>{subject.name}</span>}
                                {subject && phase && <span aria-hidden="true" className="text-muted-foreground/60">·</span>}
                                {phase && <span className="text-muted-foreground">{phase.name}</span>}
                            </p>
                        )}
                        <h1 className="mt-2 font-display text-title font-semibold text-balance break-words">
                            {note.title}
                        </h1>
                        {note.description && (
                            <p className="mt-4 max-w-[65ch] text-lg leading-relaxed text-pretty text-muted-foreground">
                                {note.description}
                            </p>
                        )}
                        {rest.length > 0 && (
                            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tags">
                                {rest.map((tag) => (
                                    <li key={tag.id} className="max-w-full">
                                        <TagBadge
                                            name={tag.name}
                                            category={tag.category}
                                            href={`/notes?tag=${tag.slug}`}
                                            showCategory
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <aside aria-label="Note details" className="rounded-2xl border bg-card p-5">
                        <dl className="grid grid-cols-3 gap-3 text-center">
                            <div className="rounded-xl bg-sunken px-2 py-3">
                                <dt className="text-xs text-muted-foreground">Added</dt>
                                <dd className="mt-1 text-sm font-semibold">
                                    <time dateTime={note.createdAt.toISOString()}>{formatDate(note.createdAt)}</time>
                                </dd>
                            </div>
                            <div className="rounded-xl bg-sunken px-2 py-3">
                                <dt className="text-xs text-muted-foreground">Views</dt>
                                <dd className="mt-1 text-sm font-semibold tabular-nums">{views.toLocaleString("en-US")}</dd>
                            </div>
                            <div className="rounded-xl bg-sunken px-2 py-3">
                                <dt className="text-xs text-muted-foreground">PDF size</dt>
                                <dd className="mt-1 text-sm font-semibold">{formatFileSize(note.fileSize)}</dd>
                            </div>
                        </dl>
                        <a
                            href={`/api/uploads/${note.filePath}?download=1`}
                            download={note.fileName}
                            className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full")}
                        >
                            <Download data-icon="inline-start" />
                            Download PDF
                        </a>
                        <ShareButtons url={pageUrl} title={note.title} className="mt-3 justify-center" />
                    </aside>
                </header>
            </div>

            <section aria-label="Document reader" className="container-page mt-8 md:mt-10">
                <PdfReader filePath={note.filePath} fileName={note.fileName} />
            </section>

            {relatedNotes.length > 0 ? (
                <section aria-labelledby="related-title" className="container-page pt-14 pb-16 md:pt-20 md:pb-24">
                    <div className="flex items-end justify-between gap-4 border-b pb-4">
                        <h2 id="related-title" className="font-display text-2xl font-semibold tracking-tight">
                            Related notes
                        </h2>
                        <Link
                            href={subject ? `/notes?tag=${subject.slug}` : "/notes"}
                            className="text-sm font-medium text-primary-ink underline-offset-4 hover:underline"
                        >
                            {subject ? `More in ${subject.name}` : "All notes"}
                        </Link>
                    </div>
                    <ul className={cn("mt-6 grid gap-4", relatedNotes.length > 1 && "md:grid-cols-2")}>
                        {relatedNotes.map((related) => (
                            <li key={related.id}>
                                <PdfCard
                                    title={related.title}
                                    slug={related.slug}
                                    description={related.description}
                                    createdAt={related.createdAt}
                                    fileSize={related.fileSize}
                                    tags={related.tags}
                                    layout="row"
                                />
                            </li>
                        ))}
                    </ul>
                </section>
            ) : (
                <div className="pb-16 md:pb-24" />
            )}
        </>
    );
}
