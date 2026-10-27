import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ExternalLink, Newspaper, PenLine, Pencil } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BlogDeleteButton } from "@/components/admin/BlogDeleteButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate, pluralize } from "@/lib/format";

export default async function AdminBlogsPage() {
    const blogs = await prisma.blogPost.findMany({
        include: { tags: { include: { tag: true } } },
        orderBy: { createdAt: "desc" },
    });
    const published = blogs.filter((b) => b.published).length;

    return (
        <div>
            <AdminPageHeader
                title="Articles"
                description={`${published} published · ${pluralize(blogs.length - published, "draft")}`}
                actions={
                    <Link href="/admin/blogs/new" className={buttonVariants()}>
                        <PenLine data-icon="inline-start" />
                        Write article
                    </Link>
                }
            />

            {blogs.length === 0 ? (
                <EmptyState
                    icon={Newspaper}
                    title="No articles yet"
                    description="Write an article, save it as a draft, and publish it when it's ready."
                >
                    <Link href="/admin/blogs/new" className={buttonVariants()}>
                        <PenLine data-icon="inline-start" />
                        Write article
                    </Link>
                </EmptyState>
            ) : (
                <AdminPanel>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Article</TableHead>
                                <TableHead className="hidden sm:table-cell">Status</TableHead>
                                <TableHead className="hidden lg:table-cell">Topics</TableHead>
                                <TableHead className="hidden md:table-cell">Date</TableHead>
                                <TableHead className="hidden text-right sm:table-cell">Views</TableHead>
                                <TableHead className="text-right">
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {blogs.map((blog) => {
                                const date = blog.publishedAt ?? blog.createdAt;
                                const topics = blog.tags.map((t) => t.tag.name);
                                return (
                                    <TableRow key={blog.id}>
                                        <TableCell className="w-full max-w-0">
                                            <Link
                                                href={`/admin/blogs/${blog.id}/edit`}
                                                className="block truncate font-medium text-foreground underline-offset-4 hover:underline"
                                            >
                                                {blog.title}
                                            </Link>
                                            {blog.excerpt && (
                                                <p className="mt-0.5 truncate text-meta text-muted-foreground">{blog.excerpt}</p>
                                            )}
                                            <div className="mt-1.5 flex items-center gap-2 sm:hidden">
                                                <StatusBadge published={blog.published} />
                                                <span className="truncate text-meta text-muted-foreground">
                                                    {formatDate(date)} · {pluralize(blog.viewCount, "view")}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <StatusBadge published={blog.published} />
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            <span className="block max-w-[12rem] truncate text-sm text-muted-foreground">
                                                {topics.length > 0 ? topics.join(", ") : "—"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="hidden whitespace-nowrap text-muted-foreground md:table-cell">
                                            {formatDate(date)}
                                        </TableCell>
                                        <TableCell className="hidden text-right tabular-nums sm:table-cell">
                                            {blog.viewCount.toLocaleString("en-US")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/admin/blogs/${blog.id}/edit`}
                                                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                                                    aria-label={`Edit “${blog.title}”`}
                                                >
                                                    <Pencil />
                                                    <span className="hidden sm:inline">Edit</span>
                                                </Link>
                                                {blog.published && (
                                                    <Tooltip>
                                                        <TooltipTrigger
                                                            render={
                                                                <a
                                                                    href={`/blog/${blog.slug}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    aria-label={`View “${blog.title}” on the website (opens in a new tab)`}
                                                                    className={buttonVariants({ variant: "quiet", size: "icon-sm" })}
                                                                />
                                                            }
                                                        >
                                                            <ExternalLink />
                                                        </TooltipTrigger>
                                                        <TooltipContent>View on website</TooltipContent>
                                                    </Tooltip>
                                                )}
                                                <BlogDeleteButton id={blog.id} title={blog.title} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </AdminPanel>
            )}
        </div>
    );
}
