"use client";

import { SearchField } from "@/components/shared/SearchField";

export function PdfSearchBar({ query, tags }: { query: string; tags: string[] }) {
    return (
        <SearchField
            action="/notes"
            defaultValue={query}
            tags={tags}
            size="xl"
            label="Search study notes"
            placeholder="Search study notes"
            hint="Searches note titles, descriptions, and alternate names. Active filters are kept."
        />
    );
}
