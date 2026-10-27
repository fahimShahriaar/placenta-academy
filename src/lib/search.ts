import { prisma } from "./prisma";
import { Prisma } from "@/generated/prisma/client";
import { ITEMS_PER_PAGE } from "./constants";

interface SearchNotesParams {
    query?: string;
    tags?: string[]; // tag slugs
    page?: number;
}

export async function searchNotes({ query, tags, page = 1 }: SearchNotesParams) {
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const conditions: Prisma.PdfNoteWhereInput[] = [];

    if (query && query.trim()) {
        const searchTerms = query.trim().split(/\s+/).filter(Boolean);
        conditions.push({
            OR: [
                { title: { contains: query.trim(), mode: "insensitive" } },
                { description: { contains: query.trim(), mode: "insensitive" } },
                { searchNames: { hasSome: searchTerms } },
                ...searchTerms.map((term) => ({
                    title: { contains: term, mode: "insensitive" as const },
                })),
                ...searchTerms.map((term) => ({
                    description: { contains: term, mode: "insensitive" as const },
                })),
                ...searchTerms.map((term) => ({
                    searchNames: { has: term },
                })),
            ],
        });
    }

    if (tags && tags.length > 0) {
        conditions.push({
            tags: {
                some: {
                    tag: { slug: { in: tags } },
                },
            },
        });
    }

    const where: Prisma.PdfNoteWhereInput =
        conditions.length > 0 ? { AND: conditions } : {};

    const [notes, total] = await Promise.all([
        prisma.pdfNote.findMany({
            where,
            include: {
                tags: {
                    include: { tag: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: offset,
            take: ITEMS_PER_PAGE,
        }),
        prisma.pdfNote.count({ where }),
    ]);

    return {
        notes,
        total,
        totalPages: Math.ceil(total / ITEMS_PER_PAGE),
        currentPage: page,
    };
}

interface SearchBlogsParams {
    query?: string;
    tags?: string[];
    page?: number;
    publishedOnly?: boolean;
}

export async function searchBlogs({
    query,
    tags,
    page = 1,
    publishedOnly = true,
}: SearchBlogsParams) {
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const conditions: Prisma.BlogPostWhereInput[] = [];

    if (publishedOnly) {
        conditions.push({ published: true });
    }

    if (query && query.trim()) {
        conditions.push({
            title: { contains: query.trim(), mode: "insensitive" },
        });
    }

    if (tags && tags.length > 0) {
        conditions.push({
            tags: {
                some: {
                    tag: { slug: { in: tags } },
                },
            },
        });
    }

    const where: Prisma.BlogPostWhereInput =
        conditions.length > 0 ? { AND: conditions } : {};

    const [posts, total] = await Promise.all([
        prisma.blogPost.findMany({
            where,
            include: {
                tags: {
                    include: { tag: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: offset,
            take: ITEMS_PER_PAGE,
        }),
        prisma.blogPost.count({ where }),
    ]);

    return {
        posts,
        total,
        totalPages: Math.ceil(total / ITEMS_PER_PAGE),
        currentPage: page,
    };
}
