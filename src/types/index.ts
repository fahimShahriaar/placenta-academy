import { PdfTagCategory } from "@/generated/prisma/enums";

export interface PdfNoteWithTags {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    fileName: string;
    filePath: string;
    fileSize: number;
    searchNames: string[];
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
    tags: {
        tag: {
            id: number;
            name: string;
            slug: string;
            category: PdfTagCategory;
        };
    }[];
}

export interface BlogPostWithTags {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    coverImage: string | null;
    published: boolean;
    viewCount: number;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    tags: {
        tag: {
            id: number;
            name: string;
            slug: string;
        };
    }[];
}

export interface PdfTagWithCount {
    id: number;
    name: string;
    slug: string;
    category: PdfTagCategory;
    _count: { notes: number };
}

export interface BlogTagWithCount {
    id: number;
    name: string;
    slug: string;
    _count: { posts: number };
}
