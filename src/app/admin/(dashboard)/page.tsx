import { prisma } from "@/lib/prisma";
import { StatsCards } from "@/components/admin/StatsCards";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default async function AdminDashboardPage() {
    const [totalNotes, totalBlogs, totalPdfTags, totalBlogTags, noteViews, blogViews, recentNotes, recentBlogs] =
        await Promise.all([
            prisma.pdfNote.count(),
            prisma.blogPost.count(),
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
        totalViews: (noteViews._sum.viewCount || 0) + (blogViews._sum.viewCount || 0),
        totalTags: totalPdfTags + totalBlogTags,
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Overview of Placenta Academy content
                </p>
            </div>

            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Notes */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Recent PDF Notes</h2>
                        <Link
                            href="/admin/notes"
                            className="text-sm text-primary hover:underline"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Views</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentNotes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                                            No notes yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentNotes.map((note) => (
                                        <TableRow key={note.id}>
                                            <TableCell className="font-medium">{note.title}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {note.createdAt.toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">{note.viewCount}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Recent Blogs */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Recent Blog Posts</h2>
                        <Link
                            href="/admin/blogs"
                            className="text-sm text-primary hover:underline"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Views</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentBlogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                                            No blog posts yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentBlogs.map((post) => (
                                        <TableRow key={post.id}>
                                            <TableCell className="font-medium">{post.title}</TableCell>
                                            <TableCell>
                                                <Badge variant={post.published ? "default" : "secondary"}>
                                                    {post.published ? "Published" : "Draft"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{post.viewCount}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}
