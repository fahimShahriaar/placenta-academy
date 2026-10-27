import { PdfTagCategory } from "@/generated/prisma/enums";

export interface PdfNoteWithTags {
    id: string;
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
            id: string;
            name: string;
            slug: string;
            category: PdfTagCategory;
        };
    }[];
}

export interface BlogPostWithTags {
    id: string;
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
            id: string;
            name: string;
            slug: string;
        };
    }[];
}

export interface PdfTagWithCount {
    id: string;
    name: string;
    slug: string;
    category: PdfTagCategory;
    _count: { notes: number };
}

export interface BlogTagWithCount {
    id: string;
    name: string;
    slug: string;
    _count: { posts: number };
}
