import { prisma } from "@/lib/prisma";
import { PdfUploadForm } from "@/components/admin/PdfUploadForm";

export default async function NewNotePage() {
    const tags = await prisma.pdfTag.findMany({
        orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Upload New PDF Note</h1>
            <PdfUploadForm tags={tags} />
        </div>
    );
}
