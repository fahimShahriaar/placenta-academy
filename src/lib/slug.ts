import { prisma } from "./prisma";

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export async function generateUniqueSlug(
    text: string,
    model: "pdfNote" | "blogPost",
    excludeId?: string
): Promise<string> {
    const base = slugify(text);
    let slug = base;
    let counter = 1;

    while (true) {
        const where: Record<string, unknown> = { slug };
        if (excludeId) {
            where.id = { not: excludeId };
        }

        let existing: unknown;
        if (model === "pdfNote") {
            existing = await prisma.pdfNote.findFirst({ where: where as any });
        } else {
            existing = await prisma.blogPost.findFirst({ where: where as any });
        }

        if (!existing) return slug;
        counter++;
        slug = `${base}-${counter}`;
    }
}
