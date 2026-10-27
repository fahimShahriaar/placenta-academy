import { prisma } from "@/lib/prisma";
import { TagManager } from "@/components/admin/TagManager";

export default async function BlogTagsPage() {
    const tags = await prisma.blogTag.findMany({
        include: { _count: { select: { posts: true } } },
        orderBy: { name: "asc" },
    });

    return <TagManager tags={tags} type="blog" />;
}
