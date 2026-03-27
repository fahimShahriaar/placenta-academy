"use server";

import { prisma } from "@/lib/prisma";
import { saveImage, deleteUploadedFile } from "@/lib/upload";
import { generateUniqueSlug } from "@/lib/slug";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import sanitizeHtml from "sanitize-html";

const blogSchema = z.object({
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    excerpt: z.string().max(500).optional(),
    tagIds: z.string().optional(),
    published: z.string().optional(),
});

function sanitize(html: string) {
    return sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
            "img",
            "h1",
            "h2",
            "h3",
            "h4",
            "u",
            "mark",
            "table",
            "thead",
            "tbody",
            "tr",
            "th",
            "td",
        ]),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ["src", "alt", "width", "height"],
            a: ["href", "target", "rel"],
            td: ["colspan", "rowspan"],
            th: ["colspan", "rowspan"],
            "*": ["style", "class"],
        },
        allowedStyles: {
            "*": {
                "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
            },
        },
    });
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export async function createBlog(formData: FormData) {
    const parsed = blogSchema.safeParse({
        title: formData.get("title"),
        content: formData.get("content"),
        excerpt: formData.get("excerpt") || undefined,
        tagIds: formData.get("tagIds") || undefined,
        published: formData.get("published") || undefined,
    });

    if (!parsed.success) {
        return { error: "Invalid input." };
    }

    const coverFile = formData.get("coverImage") as File | null;
    let coverImage: string | null = null;

    if (coverFile && coverFile.size > 0) {
        try {
            coverImage = await saveImage(coverFile);
        } catch (err: any) {
            return { error: err.message };
        }
    }

    const content = sanitize(parsed.data.content);
    const slug = await generateUniqueSlug(parsed.data.title, "blogPost");
    const published = parsed.data.published === "true";

    const excerpt =
        parsed.data.excerpt?.trim() || stripHtml(content).substring(0, 160);

    const tagIds = parsed.data.tagIds
        ? parsed.data.tagIds.split(",").filter(Boolean)
        : [];

    await prisma.blogPost.create({
        data: {
            title: parsed.data.title,
            slug,
            content,
            excerpt,
            coverImage,
            published,
            publishedAt: published ? new Date() : null,
            tags: {
                create: tagIds.map((tagId) => ({ tagId })),
            },
        },
    });

    revalidatePath("/admin/blogs");
    revalidatePath("/blog");
    return { success: true };
}

export async function updateBlog(id: string, formData: FormData) {
    const parsed = blogSchema.safeParse({
        title: formData.get("title"),
        content: formData.get("content"),
        excerpt: formData.get("excerpt") || undefined,
        tagIds: formData.get("tagIds") || undefined,
        published: formData.get("published") || undefined,
    });

    if (!parsed.success) {
        return { error: "Invalid input." };
    }

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return { error: "Blog post not found." };

    const coverFile = formData.get("coverImage") as File | null;
    let coverImage = existing.coverImage;

    if (coverFile && coverFile.size > 0) {
        try {
            if (existing.coverImage) {
                await deleteUploadedFile(existing.coverImage);
            }
            coverImage = await saveImage(coverFile);
        } catch (err: any) {
            return { error: err.message };
        }
    }

    const content = sanitize(parsed.data.content);
    const slug = await generateUniqueSlug(parsed.data.title, "blogPost", id);
    const published = parsed.data.published === "true";

    const excerpt =
        parsed.data.excerpt?.trim() || stripHtml(content).substring(0, 160);

    await prisma.blogPostTag.deleteMany({ where: { postId: id } });

    const tagIds = parsed.data.tagIds
        ? parsed.data.tagIds.split(",").filter(Boolean)
        : [];

    await prisma.blogPost.update({
        where: { id },
        data: {
            title: parsed.data.title,
            slug,
            content,
            excerpt,
            coverImage,
            published,
            publishedAt: published && !existing.publishedAt ? new Date() : existing.publishedAt,
            tags: {
                create: tagIds.map((tagId) => ({ tagId })),
            },
        },
    });

    revalidatePath("/admin/blogs");
    revalidatePath("/blog");
    return { success: true };
}

export async function deleteBlog(id: string) {
    const blog = await prisma.blogPost.findUnique({ where: { id } });
    if (blog?.coverImage) {
        await deleteUploadedFile(blog.coverImage);
    }
    await prisma.blogPost.delete({ where: { id } });
    revalidatePath("/admin/blogs");
    revalidatePath("/blog");
    return { success: true };
}
