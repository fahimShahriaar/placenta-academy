import Link from "next/link";
import { FilePlus2, PenLine } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatsCards } from "@/components/admin/StatsCards";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageHeader";
import { buttonVariants } from "@/components/ui/button-variants";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { summarizeNoteTags } from "@/lib/taxonomy";

function ViewAll({ href, label }: { href: string; label: string }) {
    return (
        <Link href={href} className="shrink-0 text-sm font-medium text-primary-ink underline-offset-4 hover:underline">
            {label}
        </Link>
    );
}

export default async function AdminDashboardPage() {
    const [totalNotes, totalBlogs, publishedBlogs, totalPdfTags, totalBlogTags, noteViews, blogViews, recentNotes, recentBlogs] =
        await Promise.all([
            prisma.pdfNote.count(),
            prisma.blogPost.count(),
            prisma.blogPost.count({ where: { published: true } }),
            prisma.pdfTag.count(),
            prisma.blogTag.count(),
            prisma.pdfNote.aggregate({ _sum: { viewCount: true } }),
            prisma.blogPost.aggregate({ _sum: { viewCount: true } }),
            prisma.pdfNote.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { tags: { include: { tag: true } } },
            }),
            prisma.blogPost.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { tags: { include: { tag: true } } },
            }),
        ]);

    const stats = {
        totalNotes,
        totalBlogs,
        publishedBlogs,
        totalViews: (noteViews._sum.viewCount || 0) + (blogViews._sum.viewCount || 0),
        totalPdfTags,
        totalBlogTags,
    };

    return (
        <div className="space-y-8">
            <AdminPageHeader
                title="Dashboard"
                description="An overview of what's in the Placenta Academy library."
                actions={
                    <>
                        <Link href="/admin/blogs/new" className={buttonVariants({ variant: "outline" })}>
                            <PenLine data-icon="inline-start" />
                            Write article
                        </Link>
                        <Link href="/admin/notes/new" className={buttonVariants()}>
                            <FilePlus2 data-icon="inline-start" />
                            Upload note
                        </Link>
                    </>
                }
            />

            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <AdminPanel title="Recent PDF notes" action={<ViewAll href="/admin/notes" label="View all" />}>
                    {recentNotes.length === 0 ? (
                        <div className="px-5 py-10 text-center">
                            <p className="text-sm text-muted-foreground">No notes uploaded yet.</p>
                            <Link href="/admin/notes/new" className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4" })}>
                                Upload the first note
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>Note</TableHead>
                                    <TableHead className="hidden sm:table-cell">Added</TableHead>
                                    <TableHead className="text-right">Views</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentNotes.map((note) => {
                                    const { subject, phase } = summarizeNoteTags(note.tags.map((t) => t.tag));
                                    return (
                                        <TableRow key={note.id}>
                                            <TableCell className="max-w-0 w-full">
                                                <Link
                                                    href={`/admin/notes/${note.id}/edit`}
                                                    className="block truncate font-medium text-foreground underline-offset-4 hover:underline"
                                                >
                                                    {note.title}
                                                </Link>
                                                <p className="mt-0.5 truncate text-meta text-muted-foreground">
                                                    {[subject?.name, phase?.name].filter(Boolean).join(" · ") || "Unclassified"}
                                                </p>
                                            </TableCell>
                                            <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                                                {formatDate(note.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">{note.viewCount.toLocaleString("en-US")}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </AdminPanel>

                <AdminPanel title="Recent articles" action={<ViewAll href="/admin/blogs" label="View all" />}>
                    {recentBlogs.length === 0 ? (
                        <div className="px-5 py-10 text-center">
                            <p className="text-sm text-muted-foreground">No articles written yet.</p>
                            <Link href="/admin/blogs/new" className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4" })}>
                                Write the first article
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>Article</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Views</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentBlogs.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell className="max-w-0 w-full">
                                            <Link
                                                href={`/admin/blogs/${post.id}/edit`}
                                                className="block truncate font-medium text-foreground underline-offset-4 hover:underline"
                                            >
                                                {post.title}
                                            </Link>
                                            <p className="mt-0.5 truncate text-meta text-muted-foreground">
                                                {formatDate(post.publishedAt ?? post.createdAt)}
                                                {post.tags[0] && ` · ${post.tags[0].tag.name}`}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge published={post.published} />
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">{post.viewCount.toLocaleString("en-US")}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </AdminPanel>
            </div>
        </div>
    );
}
