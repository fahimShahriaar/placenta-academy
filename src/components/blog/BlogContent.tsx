import sanitizeHtml from "sanitize-html";
import { cn } from "@/lib/utils";

export interface TocItem {
    id: string;
    text: string;
    level: 1 | 2;
}

function sanitize(html: string) {
    return sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
            "img",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "figure",
            "figcaption",
            "mark",
            "u",
            "s",
            "sub",
            "sup",
            "table",
            "thead",
            "tbody",
            "tr",
            "td",
            "th",
        ]),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ["src", "alt", "title", "width", "height", "loading"],
            a: ["href", "name", "target", "rel"],
            td: ["colspan", "rowspan"],
            th: ["colspan", "rowspan"],
            "*": ["class", "style"],
        },
        allowedStyles: {
            "*": {
                "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
            },
        },
    });
}

function headingText(inner: string) {
    return inner
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&[a-z#0-9]+;/gi, "")
        .replace(/\s+/g, " ")
        .trim();
}

function headingSlug(text: string, index: number) {
    const slug = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 60);
    return slug || `section-${index + 1}`;
}

/**
 * Sanitizes article HTML, then adds our own trusted markup: ids on h1–h3
 * (for the table of contents) and scroll wrappers around tables.
 */
export function prepareArticle(html: string) {
    const toc: TocItem[] = [];
    const used = new Set<string>();

    const withIds = sanitize(html).replace(
        /<h([1-3])([^>]*)>([\s\S]*?)<\/h\1>/g,
        (_match, level: string, attrs: string, inner: string) => {
            const text = headingText(inner);
            let id = headingSlug(text, toc.length);
            while (used.has(id)) id = `${id}-${toc.length + 1}`;
            used.add(id);
            if (text) toc.push({ id, text, level: level === "3" ? 2 : 1 });
            return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
        }
    );

    const content = withIds
        .replace(/<table/g, '<div class="table-scroll" role="region" aria-label="Table" tabindex="0"><table')
        .replace(/<\/table>/g, "</table></div>");

    return { content, toc };
}

interface BlogContentProps {
    html: string;
    className?: string;
}

/** Renders prepared (already sanitized) article HTML with the brand prose styles. */
export function BlogContent({ html, className }: BlogContentProps) {
    return (
        <div
            className={cn(
                "prose prose-lg prose-brand max-w-none prose-headings:scroll-mt-28",
                className
            )}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
