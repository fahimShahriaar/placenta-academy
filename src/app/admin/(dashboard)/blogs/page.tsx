import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { BlogDeleteButton } from "@/components/admin/BlogDeleteButton";

export default async function AdminBlogsPage() {
    const blogs = await prisma.blogPost.findMany({
        include: { tags: { include: { tag: true } } },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Blog Posts</h1>
                <Link href="/admin/blogs/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Post
                    </Button>
                </Link>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Views</TableHead>
                            <TableHead className="w-32">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {blogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    No blog posts yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            blogs.map((blog) => (
                                <TableRow key={blog.id}>
                                    <TableCell className="font-medium max-w-xs truncate">
                                        {blog.title}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={blog.published ? "default" : "secondary"}>
                                            {blog.published ? "Published" : "Draft"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {blog.tags.slice(0, 3).map((bt) => (
                                                <Badge key={bt.tag.id} variant="secondary" className="text-xs">
                                                    {bt.tag.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {blog.createdAt.toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">{blog.viewCount}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/blogs/${blog.id}/edit`}>
                                                <Button variant="ghost" size="sm">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <BlogDeleteButton id={blog.id} title={blog.title} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
