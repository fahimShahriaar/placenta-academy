import Link from "next/link";
import { ArrowRight, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { PdfCard } from "@/components/pdf/PdfCard";
import { BlogCard } from "@/components/blog/BlogCard";
import { AnimatedCounterSection } from "@/components/shared/AnimatedCounterSection";

// Prisma queries aren't tracked by Next's cache, so without this the page is
// prerendered once at build time and never reflects new content.
export const dynamic = "force-dynamic";

export default async function HomePage() {
    const [latestNotes, latestBlogs, noteCount, blogCount, subjectCount] =
        await Promise.all([
            prisma.pdfNote.findMany({
                take: 6,
                orderBy: { createdAt: "desc" },
                include: { tags: { include: { tag: true } } },
            }),
            prisma.blogPost.findMany({
                where: { published: true },
                take: 3,
                orderBy: { createdAt: "desc" },
                include: { tags: { include: { tag: true } } },
            }),
            prisma.pdfNote.count(),
            prisma.blogPost.count({ where: { published: true } }),
            prisma.pdfTag.count({ where: { category: "SUBJECT" } }),
        ]);

    return (
        <div>
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                            <span className="text-primary">Placenta</span> Academy
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
                            Your comprehensive platform for medical education. Access curated
                            notes, study resources, and expert blog posts — all organized by
                            subject, phase, and system.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/notes">
                                <Button size="lg" className="gap-2 w-full sm:w-auto">
                                    <FileText className="h-5 w-5" />
                                    Browse Notes
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/blog">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="gap-2 w-full sm:w-auto"
                                >
                                    <BookOpen className="h-5 w-5" />
                                    Read Blog
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Decorative gradient circle */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </section>

            {/* Stats */}
            <AnimatedCounterSection
                noteCount={noteCount}
                blogCount={blogCount}
                subjectCount={subjectCount}
            />

            {/* Latest Notes */}
            {latestNotes.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold">Latest Notes</h2>
                        <Link href="/notes">
                            <Button variant="ghost" className="gap-1">
                                View all <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {latestNotes.map((note) => (
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
                </section>
            )}

            {/* Latest Blog Posts */}
            {latestBlogs.length > 0 && (
                <section className="bg-muted/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold">
                                Latest Blog Posts
                            </h2>
                            <Link href="/blog">
                                <Button variant="ghost" className="gap-1">
                                    View all <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {latestBlogs.map((blog) => (
                                <BlogCard
                                    key={blog.id}
                                    title={blog.title}
                                    slug={blog.slug}
                                    excerpt={blog.excerpt}
                                    coverImage={blog.coverImage}
                                    createdAt={blog.createdAt}
                                    tags={blog.tags}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
