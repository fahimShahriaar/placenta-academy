"use client";

import sanitizeHtml from "sanitize-html";

interface BlogContentProps {
    html: string;
}

export function BlogContent({ html }: BlogContentProps) {
    const clean = sanitizeHtml(html, {
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

    return (
        <div
            className="prose prose-lg dark:prose-invert max-w-none
        prose-headings:scroll-mt-20
        prose-a:text-primary prose-a:underline-offset-4
        prose-img:rounded-lg prose-img:shadow-md
        prose-pre:bg-muted prose-pre:border
        prose-blockquote:border-l-primary
        prose-table:border prose-th:bg-muted/50 prose-th:p-3 prose-td:p-3"
            dangerouslySetInnerHTML={{ __html: clean }}
        />
    );
}
