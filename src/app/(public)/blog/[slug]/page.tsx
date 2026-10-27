import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants";
import { BlogContent } from "@/components/blog/BlogContent";
import { ShareButtons } from "@/components/shared/ShareButtons";
import { BlogCard } from "@/components/blog/BlogCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
    return prisma.blogPost.findUnique({
        where: { slug, published: true },
        include: {
            tags: { include: { tag: true } },
        },
    });
}

async function getRelatedPosts(postId: string, tagIds: string[], limit = 3) {
    if (tagIds.length === 0) return [];
    return prisma.blogPost.findMany({
        where: {
            id: { not: postId },
            published: true,
            tags: { some: { tagId: { in: tagIds } } },
        },
        include: { tags: { include: { tag: true } } },
        orderBy: { createdAt: "desc" },
        take: limit,
    });
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug);
    if (!post) return { title: "Not Found" };

    return {
        title: post.title,
        description: post.excerpt || undefined,
        openGraph: {
            title: post.title,
            description: post.excerpt || undefined,
            url: `${SITE_URL}/blog/${post.slug}`,
            type: "article",
            ...(post.coverImage && {
                images: [`${SITE_URL}/api/uploads/${post.coverImage}`],
            }),
        },
    };
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPost(slug);
    if (!post) notFound();

    // Increment view count
    await prisma.blogPost.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
    });

    const tagIds = post.tags.map((t) => t.tagId);
    const relatedPosts = await getRelatedPosts(post.id, tagIds);
    const pageUrl = `${SITE_URL}/blog/${post.slug}`;

    return (
        <article className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Back */}
            <Link href="/blog">
                <Button variant="ghost" className="mb-4 -ml-2 gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Blog
                </Button>
            </Link>

            {/* Cover */}
            {post.coverImage && (
                <div className="aspect-video relative overflow-hidden rounded-xl mb-8">
                    <img
                        src={`/api/uploads/${post.coverImage}`}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Header */}
            <header className="mb-8">
                <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "long", day: "numeric" }
                        )}
                    </span>
                    <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.viewCount + 1} views
                    </span>
                </div>

                {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((bt) => (
                            <Badge key={bt.tag.id} variant="secondary">
                                {bt.tag.name}
                            </Badge>
                        ))}
                    </div>
                )}

                <ShareButtons url={pageUrl} title={post.title} />
            </header>

            {/* Content */}
            <BlogContent html={post.content} />

            {/* Related */}
            {relatedPosts.length > 0 && (
                <section className="mt-16 border-t pt-10">
                    <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedPosts.map((related) => (
                            <BlogCard
                                key={related.id}
                                title={related.title}
                                slug={related.slug}
                                excerpt={related.excerpt}
                                coverImage={related.coverImage}
                                createdAt={related.createdAt}
                                tags={related.tags}
                            />
                        ))}
                    </div>
                </section>
            )}
        </article>
    );
}
