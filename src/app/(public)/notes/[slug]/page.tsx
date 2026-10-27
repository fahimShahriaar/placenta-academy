import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, Eye, Calendar, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { PdfViewer } from "@/components/pdf/PdfViewer";
import { TagBadge } from "@/components/shared/TagBadge";
import { ShareButtons } from "@/components/shared/ShareButtons";
import { Button } from "@/components/ui/button";
import { PdfCard } from "@/components/pdf/PdfCard";

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getNote(slug: string) {
    return prisma.pdfNote.findUnique({
        where: { slug },
        include: {
            tags: {
                include: { tag: true },
            },
        },
    });
}

async function getRelatedNotes(
    noteId: string,
    tagIds: string[],
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

    // Format file size
    const fileSize =
        note.fileSize > 1048576
            ? `${(note.fileSize / 1048576).toFixed(1)} MB`
            : `${(note.fileSize / 1024).toFixed(0)} KB`;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Back link */}
            <Link href="/notes">
                <Button variant="ghost" className="mb-4 -ml-2 gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Notes
                </Button>
            </Link>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-3">{note.title}</h1>

                {note.description && (
                    <p className="text-muted-foreground text-lg mb-4">
                        {note.description}
                    </p>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(note.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </span>
                    <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {note.viewCount + 1} views
                    </span>
                    <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {fileSize}
                    </span>
                </div>

                {/* Tags */}
                {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {note.tags.map((nt) => (
                            <TagBadge key={nt.tag.id} name={nt.tag.name} category={nt.tag.category} />
                        ))}
                    </div>
                )}

                {/* Share */}
                <ShareButtons url={pageUrl} title={note.title} />
            </div>

            {/* PDF Viewer */}
            <PdfViewer filePath={note.filePath} fileName={note.fileName} />

            {/* Related Notes */}
            {relatedNotes.length > 0 && (
                <section className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">Related Notes</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedNotes.map((related) => (
                            <PdfCard
                                key={related.id}
                                title={related.title}
                                slug={related.slug}
                                description={related.description}
                                createdAt={related.createdAt}
                                tags={related.tags}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
