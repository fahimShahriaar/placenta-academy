import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { searchBlogs } from "@/lib/search";
import { SITE_NAME } from "@/lib/constants";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogFilterBar } from "@/components/blog/BlogFilterBar";
import { Pagination } from "@/components/shared/Pagination";

export const metadata: Metadata = {
    title: `Blog | ${SITE_NAME}`,
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
    const query = sp.q || "";
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
            include: { _count: { select: { posts: true } } },
            orderBy: { name: "asc" },
        }),
    ]);

    const paginationParams: Record<string, string | string[]> = { tag: tags };
    if (query) paginationParams.q = query;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Blog</h1>
                <p className="text-muted-foreground">
                    Medical articles and educational insights
                </p>
            </div>

            <BlogFilterBar tags={allTags} />

            {result.posts.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {result.posts.map((post) => (
                            <BlogCard
                                key={post.id}
                                title={post.title}
                                slug={post.slug}
                                excerpt={post.excerpt}
                                coverImage={post.coverImage}
                                createdAt={post.createdAt}
                                tags={post.tags}
                            />
                        ))}
                    </div>
                    {result.totalPages > 1 && (
                        <div className="mt-8">
                            <Pagination
                                currentPage={result.currentPage}
                                totalPages={result.totalPages}
                                basePath="/blog"
                                searchParams={paginationParams}
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-16 text-muted-foreground">
                    <p className="text-lg">No articles found</p>
                    {(query || tags.length > 0) && (
                        <p className="text-sm mt-1">
                            Try adjusting your search or filters
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
