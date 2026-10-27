"use client";

import { createContext, useContext, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface QueryNavigationValue {
    isPending: boolean;
    /** Current query string as rendered by the server (no leading "?"). */
    query: string;
    /** Navigate to basePath with the mutated params; always resets pagination. */
    update: (mutate: (params: URLSearchParams) => void, options?: { scroll?: boolean }) => void;
    hrefFor: (mutate: (params: URLSearchParams) => void) => string;
}

const QueryNavigationContext = createContext<QueryNavigationValue | null>(null);

/**
 * Shared URL-state for listing pages (search, filters, chips). Every change
 * goes through one transition so the results can show a pending state, and
 * the URL stays the single, shareable source of truth.
 */
export function QueryNavigationProvider({
    basePath,
    query,
    children,
}: {
    basePath: string;
    query: string;
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    function hrefFor(mutate: (params: URLSearchParams) => void) {
        const params = new URLSearchParams(query);
        mutate(params);
        params.delete("page");
        const qs = params.toString();
        return qs ? `${basePath}?${qs}` : basePath;
    }

    function update(mutate: (params: URLSearchParams) => void, options?: { scroll?: boolean }) {
        const href = hrefFor(mutate);
        startTransition(() => {
            router.push(href, { scroll: options?.scroll ?? false });
        });
    }

    return (
        <QueryNavigationContext.Provider value={{ isPending, query, update, hrefFor }}>
            {children}
        </QueryNavigationContext.Provider>
    );
}

export function useQueryNavigation() {
    const ctx = useContext(QueryNavigationContext);
    if (!ctx) throw new Error("useQueryNavigation must be used inside QueryNavigationProvider");
    return ctx;
}

/** Dims results and marks them busy while a filter/search navigation is in flight. */
export function PendingRegion({ children, className }: { children: React.ReactNode; className?: string }) {
    const { isPending } = useQueryNavigation();
    return (
        <div
            aria-busy={isPending}
            data-pending={isPending || undefined}
            className={cn(
                "transition-opacity duration-200 data-pending:pointer-events-none data-pending:opacity-55",
                className
            )}
        >
            {children}
        </div>
    );
}

/** Toggle a repeated `tag` param on or off. */
export function toggleTagParam(params: URLSearchParams, slug: string) {
    const tags = params.getAll("tag");
    params.delete("tag");
    const next = tags.includes(slug) ? tags.filter((t) => t !== slug) : [...tags, slug];
    next.forEach((t) => params.append("tag", t));
}
