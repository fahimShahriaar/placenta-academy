const dateFormat = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
});

const longDateFormat = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
});

export function formatDate(date: Date | string, style: "short" | "long" = "short") {
    const d = typeof date === "string" ? new Date(date) : date;
    return (style === "long" ? longDateFormat : dateFormat).format(d);
}

export function formatFileSize(bytes: number) {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
    return `${count.toLocaleString("en-US")} ${count === 1 ? singular : plural}`;
}

export function stripHtml(html: string) {
    return html
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&[a-z]+;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function countWords(html: string) {
    const text = stripHtml(html);
    return text ? text.split(" ").length : 0;
}

/** Estimated reading time at ~200 words per minute (never below one minute). */
export function readingMinutes(html: string) {
    return Math.max(1, Math.round(countWords(html) / 200));
}
