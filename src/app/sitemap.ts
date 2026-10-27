import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants";

// Otherwise generated once at build time and never updated
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [notes, posts] = await Promise.all([
        prisma.pdfNote.findMany({ select: { slug: true, updatedAt: true } }),
        prisma.blogPost.findMany({
            where: { published: true },
            select: { slug: true, updatedAt: true },
        }),
    ]);

    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${SITE_URL}/notes`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/blog`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
    ];

    const notePages: MetadataRoute.Sitemap = notes.map((n) => ({
        url: `${SITE_URL}/notes/${n.slug}`,
        lastModified: n.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    const blogPages: MetadataRoute.Sitemap = posts.map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    return [...staticPages, ...notePages, ...blogPages];
}
