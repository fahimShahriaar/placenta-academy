import { cache } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ListTree } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants";
import { BlogContent, prepareArticle, type TocItem } from "@/components/blog/BlogContent";
import { ShareButtons } from "@/components/shared/ShareButtons";
import { BlogCard } from "@/components/blog/BlogCard";
import { countWords, formatDate, readingMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Shared by generateMetadata and the page within one request
const getPost = cache(async (slug: string) => {
    return prisma.blogPost.findUnique({
        where: { slug, published: true },
        include: {
            tags: { include: { tag: true } },
        },
    });
});

async function getRelatedPosts(postId: number, tagIds: number[], limit = 3) {
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

function TocList({ toc }: { toc: TocItem[] }) {
    return (
        <ol className="space-y-1 border-l">
            {toc.map((item) => (
                <li key={item.id}>
                    <a
                        href={`#${item.id}`}
                        className={cn(
                            "-ml-px block border-l border-transparent py-1 text-sm leading-snug text-muted-foreground transition-colors hover:border-primary hover:text-foreground",
                            item.level === 1 ? "pl-4" : "pl-7"
                        )}
                    >
                        {item.text}
                    </a>
                </li>
            ))}
        </ol>
    );
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

    const { content, toc } = prepareArticle(post.content);
    const minutes = readingMinutes(post.content);
    // Only long, sectioned articles get a table of contents
    const showToc = toc.length >= 3 && countWords(post.content) >= 700;
    const date = post.publishedAt || post.createdAt;
    const topic = post.tags[0]?.tag;

    const column = cn("mx-auto w-full max-w-[44rem]", showToc && "xl:mx-0");

    return (
        <article>
            <div className="container-page pt-6 md:pt-10">
                <div className="mx-auto max-w-[64rem]">
                    <div className={cn(showToc && "xl:grid xl:grid-cols-[minmax(0,44rem)_1fr] xl:gap-16")}>
                        <header className={column}>
                            <nav aria-label="Breadcrumb">
                                <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                                    <li>
                                        <Link href="/blog" className="rounded-sm underline-offset-4 hover:text-foreground hover:underline">
                                            Blog
                                        </Link>
                                    </li>
                                    {topic && (
                                        <>
                                            <li aria-hidden="true">
                                                <ChevronRight className="size-3.5" />
                                            </li>
                                            <li>
                                                <Link
                                                    href={`/blog?tag=${topic.slug}`}
                                                    className="rounded-sm underline-offset-4 hover:text-foreground hover:underline"
                                                >
                                                    {topic.name}
                                                </Link>
                                            </li>
                                        </>
                                    )}
                                </ol>
                            </nav>
                            {topic && <p className="mt-8 eyebrow">{topic.name}</p>}
                            <h1 className={cn("font-display text-title font-semibold text-balance break-words", topic ? "mt-2" : "mt-8")}>
                                {post.title}
                            </h1>
                            {post.excerpt && (
                                <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground md:text-xl">
                                    {post.excerpt}
                                </p>
                            )}
                            <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 border-t pt-4 text-sm text-muted-foreground">
                                <time dateTime={date.toISOString()}>{formatDate(date, "long")}</time>
                                <span aria-hidden="true">·</span>
                                <span>About {minutes} min read</span>
                                <span aria-hidden="true">·</span>
                                <span>{(post.viewCount + 1).toLocaleString("en-US")} views</span>
                            </p>
                        </header>
                    </div>

                    {post.coverImage && (
                        <figure className="mt-8 md:mt-10">
                            <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border bg-muted md:aspect-[2/1]">
                                <Image
                                    src={`/api/uploads/${post.coverImage}`}
                                    alt=""
                                    fill
                                    priority
                                    sizes="(min-width: 1088px) 1024px, 100vw"
                                    className="object-cover"
                                />
                            </div>
                        </figure>
                    )}

                    <div className={cn("mt-10 md:mt-12", showToc && "xl:grid xl:grid-cols-[minmax(0,44rem)_1fr] xl:gap-16")}>
                        <div className={column}>
                            {showToc && (
                                <details className="group mb-8 rounded-2xl border bg-card xl:hidden">
                                    <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                                        <ListTree className="size-4 text-primary-ink" aria-hidden="true" />
                                        On this page
                                        <ChevronRight className="ml-auto size-4 transition-transform group-open:rotate-90" aria-hidden="true" />
                                    </summary>
                                    <nav aria-label="On this page" className="px-5 pb-5">
                                        <TocList toc={toc} />
                                    </nav>
                                </details>
                            )}

                            <BlogContent html={content} />

                            <footer className="mt-12 flex flex-col gap-5 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                                {post.tags.length > 0 ? (
                                    <ul className="flex flex-wrap gap-2" aria-label="Topics">
                                        {post.tags.map((bt) => (
                                            <li key={bt.tag.id}>
                                                <Link
                                                    href={`/blog?tag=${bt.tag.slug}`}
                                                    className="inline-flex h-8 items-center rounded-full bg-muted px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
                                                >
                                                    {bt.tag.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span />
                                )}
                                <ShareButtons url={pageUrl} title={post.title} label="Share this article" />
                            </footer>
                        </div>

                        {showToc && (
                            <aside className="hidden xl:block">
                                <nav aria-labelledby="toc-heading" className="sticky top-28">
                                    <p id="toc-heading" className="mb-3 text-meta font-semibold text-foreground">
                                        On this page
                                    </p>
                                    <TocList toc={toc} />
                                </nav>
                            </aside>
                        )}
                    </div>
                </div>
            </div>

            {relatedPosts.length > 0 ? (
                <section aria-labelledby="related-title" className="mt-16 border-t bg-card py-14 md:mt-24 md:py-20">
                    <div className="container-page">
                        <h2 id="related-title" className="font-display text-2xl font-semibold tracking-tight">
                            More to read
                        </h2>
                        <ul
                            className={cn(
                                "mt-6 grid gap-5",
                                relatedPosts.length === 2 && "md:grid-cols-2",
                                relatedPosts.length >= 3 && "sm:grid-cols-2 lg:grid-cols-3"
                            )}
                        >
                            {relatedPosts.map((related) => (
                                <li key={related.id}>
                                    <BlogCard
                                        title={related.title}
                                        slug={related.slug}
                                        excerpt={related.excerpt}
                                        coverImage={related.coverImage}
                                        createdAt={related.createdAt}
                                        publishedAt={related.publishedAt}
                                        content={related.content}
                                        tags={related.tags}
                                        layout={relatedPosts.length === 1 ? "row" : "card"}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            ) : (
                <div className="pb-16 md:pb-24" />
            )}
        </article>
    );
}
