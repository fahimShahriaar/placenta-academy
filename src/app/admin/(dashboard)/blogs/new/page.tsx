import { prisma } from "@/lib/prisma";
import { MAX_IMAGE_SIZE } from "@/lib/constants";
import { BlogForm } from "@/components/admin/BlogForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function NewBlogPage() {
    const tags = await prisma.blogTag.findMany({ orderBy: { name: "asc" } });

    return (
        <div>
            <AdminPageHeader title="Write an article" back={{ href: "/admin/blogs", label: "Articles" }} />
            <BlogForm tags={tags} maxImageSize={MAX_IMAGE_SIZE} />
        </div>
    );
}
