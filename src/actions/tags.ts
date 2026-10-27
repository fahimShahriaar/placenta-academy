"use server";

import { prisma } from "@/lib/prisma";
import { PdfTagCategory } from "@/generated/prisma/client";
import { slugify } from "@/lib/slug";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

// ─── PDF Tags ────────────────────────────────────────────────────────

const createPdfTagSchema = z.object({
    name: z.string().min(1).max(100),
    category: z.enum(["SUBJECT", "PHASE", "TOPIC", "SYSTEM", "OTHER"]),
});

export async function createPdfTag(formData: FormData) {
    const parsed = createPdfTagSchema.safeParse({
        name: formData.get("name"),
        category: formData.get("category"),
    });

    if (!parsed.success) {
        return { error: "Invalid input." };
    }

    const slug = slugify(parsed.data.name);

    try {
        await prisma.pdfTag.create({
            data: {
                name: parsed.data.name,
                slug,
                category: parsed.data.category as PdfTagCategory,
            },
        });
    } catch {
        return { error: "Tag with this name already exists." };
    }

    revalidatePath("/admin/tags/pdf-tags");
    return { success: true };
}

export async function updatePdfTag(id: string, name: string) {
    const slug = slugify(name);
    try {
        await prisma.pdfTag.update({
            where: { id },
            data: { name, slug },
        });
    } catch {
        return { error: "Tag name already exists." };
    }
    revalidatePath("/admin/tags/pdf-tags");
    return { success: true };
}

export async function deletePdfTag(id: string) {
    await prisma.pdfTag.delete({ where: { id } });
    revalidatePath("/admin/tags/pdf-tags");
    return { success: true };
}

// ─── Blog Tags ───────────────────────────────────────────────────────

const createBlogTagSchema = z.object({
    name: z.string().min(1).max(100),
});

export async function createBlogTag(formData: FormData) {
    const parsed = createBlogTagSchema.safeParse({
        name: formData.get("name"),
    });

    if (!parsed.success) {
        return { error: "Invalid input." };
    }

    const slug = slugify(parsed.data.name);

    try {
        await prisma.blogTag.create({
            data: { name: parsed.data.name, slug },
        });
    } catch {
        return { error: "Tag with this name already exists." };
    }

    revalidatePath("/admin/tags/blog-tags");
    return { success: true };
}

export async function updateBlogTag(id: string, name: string) {
    const slug = slugify(name);
    try {
        await prisma.blogTag.update({
            where: { id },
            data: { name, slug },
        });
    } catch {
        return { error: "Tag name already exists." };
    }
    revalidatePath("/admin/tags/blog-tags");
    return { success: true };
}

export async function deleteBlogTag(id: string) {
    await prisma.blogTag.delete({ where: { id } });
    revalidatePath("/admin/tags/blog-tags");
    return { success: true };
}
