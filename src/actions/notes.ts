"use server";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { savePdf, deleteUploadedFile } from "@/lib/upload";
import { generateUniqueSlug } from "@/lib/slug";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

const noteSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    searchNames: z.string().optional(), // comma-separated or JSON
    tagIds: z.string().optional(), // comma-separated
});

export async function createNote(formData: FormData) {
    if (!(await isAdmin())) return { error: "Unauthorized." };

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
        return { error: "PDF file is required." };
    }

    const parsed = noteSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description") || undefined,
        searchNames: formData.get("searchNames") || undefined,
        tagIds: formData.get("tagIds") || undefined,
    });

    if (!parsed.success) {
        return { error: "Invalid input." };
    }

    let uploadResult;
    try {
        uploadResult = await savePdf(file);
    } catch (err: any) {
        return { error: err.message };
    }

    const slug = await generateUniqueSlug(parsed.data.title, "pdfNote");

    const searchNames = parsed.data.searchNames
        ? parsed.data.searchNames
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    const tagIds = parsed.data.tagIds
        ? parsed.data.tagIds.split(",").filter(Boolean)
        : [];

    await prisma.pdfNote.create({
        data: {
            title: parsed.data.title,
            slug,
            description: parsed.data.description || null,
            fileName: uploadResult.fileName,
            filePath: uploadResult.filePath,
            fileSize: uploadResult.fileSize,
            searchNames,
            tags: {
                create: tagIds.map((tagId) => ({ tagId })),
            },
        },
    });

    revalidatePath("/admin/notes");
    revalidatePath("/notes");
    return { success: true };
}

export async function updateNote(id: string, formData: FormData) {
    if (!(await isAdmin())) return { error: "Unauthorized." };

    const file = formData.get("file") as File | null;

    const parsed = noteSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description") || undefined,
        searchNames: formData.get("searchNames") || undefined,
        tagIds: formData.get("tagIds") || undefined,
    });

    if (!parsed.success) {
        return { error: "Invalid input." };
    }

    const existing = await prisma.pdfNote.findUnique({ where: { id } });
    if (!existing) return { error: "Note not found." };

    let fileData = {};
    if (file && file.size > 0) {
        try {
            const uploadResult = await savePdf(file);
            // Delete old file
            await deleteUploadedFile(existing.filePath);
            fileData = {
                fileName: uploadResult.fileName,
                filePath: uploadResult.filePath,
                fileSize: uploadResult.fileSize,
            };
        } catch (err: any) {
            return { error: err.message };
        }
    }

    const slug = await generateUniqueSlug(parsed.data.title, "pdfNote", id);

    const searchNames = parsed.data.searchNames
        ? parsed.data.searchNames
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    const tagIds = parsed.data.tagIds
        ? parsed.data.tagIds.split(",").filter(Boolean)
        : [];

    // Delete existing tags and re-create
    await prisma.pdfNoteTag.deleteMany({ where: { noteId: id } });

    await prisma.pdfNote.update({
        where: { id },
        data: {
            title: parsed.data.title,
            slug,
            description: parsed.data.description || null,
            searchNames,
            ...fileData,
            tags: {
                create: tagIds.map((tagId) => ({ tagId })),
            },
        },
    });

    revalidatePath("/admin/notes");
    revalidatePath("/notes");
    return { success: true };
}

export async function deleteNote(id: string) {
    if (!(await isAdmin())) return { error: "Unauthorized." };

    const note = await prisma.pdfNote.findUnique({ where: { id } });
    if (note) {
        await deleteUploadedFile(note.filePath);
        await prisma.pdfNote.delete({ where: { id } });
    }
    revalidatePath("/admin/notes");
    revalidatePath("/notes");
    return { success: true };
}
