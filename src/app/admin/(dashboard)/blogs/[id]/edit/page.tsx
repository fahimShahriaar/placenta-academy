import { prisma } from "@/lib/prisma";
import { BlogForm } from "@/components/admin/BlogForm";
import { notFound } from "next/navigation";

export default async function EditBlogPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) notFound();

    const [blog, tags] = await Promise.all([
        prisma.blogPost.findUnique({
            where: { id },
            include: { tags: { include: { tag: true } } },
        }),
        prisma.blogTag.findMany({ orderBy: { name: "asc" } }),
    ]);

    if (!blog) notFound();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Edit Blog Post</h1>
            <BlogForm tags={tags} blog={blog} />
        </div>
    );
}
