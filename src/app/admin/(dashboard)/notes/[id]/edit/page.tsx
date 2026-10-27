import { prisma } from "@/lib/prisma";
import { MAX_PDF_SIZE } from "@/lib/constants";
import { PdfUploadForm } from "@/components/admin/PdfUploadForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { notFound } from "next/navigation";

export default async function EditNotePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) notFound();

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
        <div>
            <AdminPageHeader
                title="Edit note"
                description={note.title}
                back={{ href: "/admin/notes", label: "PDF notes" }}
            />
            <PdfUploadForm tags={tags} note={note} maxFileSize={MAX_PDF_SIZE} />
        </div>
    );
}
