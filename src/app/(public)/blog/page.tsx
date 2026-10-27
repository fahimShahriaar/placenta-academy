import { Metadata } from "next";
import Link from "next/link";
import { Newspaper, SearchX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { searchBlogs } from "@/lib/search";
import { SITE_NAME } from "@/lib/constants";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogFilterBar, BlogSearch } from "@/components/blog/BlogFilterBar";
import { PendingRegion, QueryNavigationProvider } from "@/components/shared/QueryNavigation";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { buttonVariants } from "@/components/ui/button-variants";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Blog",
    description: `Medical articles and insights from ${SITE_NAME}`,
};

interface PageProps {
    searchParams: Promise<{
        q?: string;
        tag?: string | string[];
        page?: string;
    }>;
}

export default async function BlogListPage({ searchParams }: PageProps) {
    const sp = await searchParams;
    const query = (sp.q || "").trim();
    const tagParam = sp.tag;
    const tags = tagParam
        ? Array.isArray(tagParam)
            ? tagParam
            : [tagParam]
        : [];
    const page = Math.max(1, parseInt(sp.page || "1") || 1);

    const [result, allTags] = await Promise.all([
        searchBlogs({ query, tags, page }),
        prisma.blogTag.findMany({
            include: { _count: { select: { posts: { where: { post: { published: true } } } } } },
            orderBy: { name: "asc" },
        }),
    ]);

    const paginationParams: Record<string, string | string[]> = { tag: tags };
    if (query) paginationParams.q = query;

    const currentQuery = new URLSearchParams();
    if (query) currentQuery.set("q", query);
    tags.forEach((t) => currentQuery.append("tag", t));

    const filtering = Boolean(query) || tags.length > 0;
    // The newest article leads the unfiltered first page; it is never repeated in the grid.
    const showLead = !filtering && result.currentPage === 1 && result.posts.length > 0;
    const [lead, ...rest] = showLead ? result.posts : [undefined, ...result.posts];
    const activeTagNames = allTags.filter((t) => tags.includes(t.slug)).map((t) => t.name);

    return (
        <QueryNavigationProvider basePath="/blog" query={currentQuery.toString()}>
            <div className="container-page pt-10 md:pt-16">
                <div className="grid gap-8 border-b pb-10 md:pb-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end lg:gap-14">
                    <div className="max-w-2xl">
                        <p className="eyebrow">The blog</p>
                        <h1 className="mt-2 font-display text-title font-semibold text-balance">
                            Articles to read alongside your notes
                        </h1>
                        <p className="mt-3 text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
                            Longer reads on medicine and studying, organized by topic.
                        </p>
                    </div>
                    <BlogSearch query={query} tags={tags} />
                </div>
                <div className="py-6">
                    <BlogFilterBar tags={allTags} activeTags={tags} />
                </div>
            </div>

            <section aria-labelledby="articles-heading" className="container-page pb-16 md:pb-24">
                <h2 id="articles-heading" className={cn(filtering ? "mb-6 text-base font-semibold" : "sr-only")} aria-live="polite">
                    {filtering ? (
                        <>
                            {pluralize(result.total, "article")}
                            {query && <span className="font-normal text-muted-foreground"> for “{query}”</span>}
                            {activeTagNames.length > 0 && (
                                <span className="font-normal text-muted-foreground"> in {activeTagNames.join(", ")}</span>
                            )}
                        </>
                    ) : (
                        "All articles"
                    )}
                </h2>

                <PendingRegion>
                    {result.posts.length === 0 && result.total > 0 ? (
                        <EmptyState
                            icon={SearchX}
                            title={`There's no page ${result.currentPage}`}
                            description={`These results only run to ${pluralize(result.totalPages, "page")}.`}
                        >
                            <Link
                                href={`/blog${currentQuery.size > 0 ? `?${currentQuery.toString()}` : ""}`}
                                className={buttonVariants({ variant: "outline" })}
                            >
                                Go to the first page
                            </Link>
                        </EmptyState>
                    ) : result.posts.length === 0 ? (
                        filtering ? (
                            <EmptyState
                                icon={SearchX}
                                title="No articles match"
                                description="Search matches words in article titles. Try a shorter search or another topic."
                            >
                                <Link href="/blog" className={buttonVariants({ variant: "outline" })}>
                                    Show all articles
                                </Link>
                            </EmptyState>
                        ) : (
                            <EmptyState
                                icon={Newspaper}
                                title="No articles published yet"
                                description="Articles will appear here once they're published. The notes library is open in the meantime."
                            >
                                <Link href="/notes" className={buttonVariants({ variant: "outline" })}>
                                    Browse study notes
                                </Link>
                            </EmptyState>
                        )
                    ) : (
                        <>
                            {lead && (
                                <BlogCard
                                    title={lead.title}
                                    slug={lead.slug}
                                    excerpt={lead.excerpt}
                                    coverImage={lead.coverImage}
                                    createdAt={lead.createdAt}
                                    publishedAt={lead.publishedAt}
                                    content={lead.content}
                                    tags={lead.tags}
                                    layout="lead"
                                    eyebrow="Latest"
                                    headingLevel="h2"
                                    priority
                                />
                            )}
                            {rest.length > 0 && (
                                <ul
                                    className={cn(
                                        "grid gap-5",
                                        lead && "mt-10",
                                        rest.length === 2 && "md:grid-cols-2",
                                        rest.length >= 3 && "sm:grid-cols-2 lg:grid-cols-3"
                                    )}
                                >
                                    {rest.map((post) =>
                                        post ? (
                                            <li key={post.id}>
                                                <BlogCard
                                                    title={post.title}
                                                    slug={post.slug}
                                                    excerpt={post.excerpt}
                                                    coverImage={post.coverImage}
                                                    createdAt={post.createdAt}
                                                    publishedAt={post.publishedAt}
                                                    content={post.content}
                                                    tags={post.tags}
                                                    layout={rest.length === 1 ? "lead" : "card"}
                                                    headingLevel={lead ? "h3" : "h2"}
                                                />
                                            </li>
                                        ) : null
                                    )}
                                </ul>
                            )}
                            {result.totalPages > 1 && (
                                <div className="mt-12 border-t pt-6">
                                    <Pagination
                                        currentPage={result.currentPage}
                                        totalPages={result.totalPages}
                                        basePath="/blog"
                                        searchParams={paginationParams}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </PendingRegion>
            </section>
        </QueryNavigationProvider>
    );
}
