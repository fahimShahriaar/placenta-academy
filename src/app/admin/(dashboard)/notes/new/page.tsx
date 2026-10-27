import { prisma } from "@/lib/prisma";
import { MAX_PDF_SIZE } from "@/lib/constants";
import { PdfUploadForm } from "@/components/admin/PdfUploadForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function NewNotePage() {
    const tags = await prisma.pdfTag.findMany({
        orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return (
        <div>
            <AdminPageHeader
                title="Upload a note"
                description="Add a PDF to the library and tag it so students can find it."
                back={{ href: "/admin/notes", label: "PDF notes" }}
            />
            <PdfUploadForm tags={tags} maxFileSize={MAX_PDF_SIZE} />
        </div>
    );
}
