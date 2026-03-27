import { prisma } from "@/lib/prisma";
import { TagManager } from "@/components/admin/TagManager";

export default async function PdfTagsPage() {
    const tags = await prisma.pdfTag.findMany({
        include: { _count: { select: { notes: true } } },
        orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return <TagManager tags={tags} type="pdf" />;
}
