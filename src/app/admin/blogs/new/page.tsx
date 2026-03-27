import { prisma } from "@/lib/prisma";
import { BlogForm } from "@/components/admin/BlogForm";

export default async function NewBlogPage() {
    const tags = await prisma.blogTag.findMany({ orderBy: { name: "asc" } });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Create New Blog Post</h1>
            <BlogForm tags={tags} />
        </div>
    );
}
