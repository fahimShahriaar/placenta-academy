import { prisma } from "@/lib/prisma";
import { PdfUploadForm } from "@/components/admin/PdfUploadForm";
import { notFound } from "next/navigation";

export default async function EditNotePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [note, tags] = await Promise.all([
        prisma.pdfNote.findUnique({
            where: { id },
            include: { tags: { include: { tag: true } } },
        }),
        prisma.pdfTag.findMany({
            orderBy: [{ category: "asc" }, { name: "asc" }],
        }),
    ]);

    if (!note) notFound();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Edit PDF Note</h1>
            <PdfUploadForm tags={tags} note={note} />
        </div>
    );
}
