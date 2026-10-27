import { prisma } from "@/lib/prisma";
import { MAX_IMAGE_SIZE } from "@/lib/constants";
import { BlogForm } from "@/components/admin/BlogForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
        <div>
            <AdminPageHeader title="Edit article" back={{ href: "/admin/blogs", label: "Articles" }} />
            <BlogForm tags={tags} blog={blog} maxImageSize={MAX_IMAGE_SIZE} />
        </div>
    );
}
