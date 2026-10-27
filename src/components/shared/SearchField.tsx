"use client";

import { useRef } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import { useQueryNavigation } from "@/components/shared/QueryNavigation";
import { cn } from "@/lib/utils";

/**
 * Search form for listing pages. It is a real GET form (works without JS)
 * that, when hydrated, navigates through the shared transition and keeps
 * the active tag filters.
 */
export function SearchField({
    action,
    defaultValue,
    tags,
    label,
    placeholder,
    hint,
    size = "lg",
    className,
}: {
    action: string;
    defaultValue: string;
    tags: string[];
    label: string;
    placeholder: string;
    hint?: string;
    size?: "lg" | "xl";
    className?: string;
}) {
    const { update, isPending } = useQueryNavigation();
    const inputRef = useRef<HTMLInputElement>(null);
    const idBase = action.replace(/\W/g, "") || "site";
    const inputId = `${idBase}-search`;
    const hintId = hint ? `${idBase}-search-hint` : undefined;

    function submit(value: string) {
        update(
            (params) => {
                const q = value.trim();
                if (q) params.set("q", q);
                else params.delete("q");
            },
            { scroll: false }
        );
    }

    return (
        <form
            role="search"
            action={action}
            onSubmit={(e) => {
                e.preventDefault();
                submit(inputRef.current?.value ?? "");
            }}
            className={className}
        >
            {tags.map((t) => (
                <input key={t} type="hidden" name="tag" value={t} />
            ))}
            <label htmlFor={inputId} className="sr-only">
                {label}
            </label>
            <div
                className={cn(
                    "group/search relative flex items-center rounded-xl border border-input bg-card shadow-xs transition-[border-color,box-shadow] duration-150 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20 hover:border-border-strong dark:bg-sunken",
                    size === "xl" ? "h-14" : "h-12"
                )}
            >
                <Search className="pointer-events-none absolute left-4 size-[1.125rem] text-muted-foreground" aria-hidden="true" />
                <input
                    ref={inputRef}
                    id={inputId}
                    key={defaultValue}
                    name="q"
                    type="search"
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                    aria-describedby={hintId}
                    autoComplete="off"
                    enterKeyHint="search"
                    className="h-full min-w-0 flex-1 bg-transparent pr-2 pl-11 text-base text-foreground outline-none placeholder:text-muted-foreground/80 [&::-webkit-search-cancel-button]:hidden"
                />
                {defaultValue && (
                    <button
                        type="button"
                        onClick={() => {
                            if (inputRef.current) inputRef.current.value = "";
                            submit("");
                        }}
                        className="mr-1 flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Clear search"
                    >
                        <X className="size-4" />
                    </button>
                )}
                <button
                    type="submit"
                    className={cn(
                        "mr-1.5 inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
                        size === "xl" ? "h-11" : "h-9"
                    )}
                >
                    {isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
                    Search
                </button>
            </div>
            {hint && (
                <p id={hintId} className="mt-2 text-meta text-muted-foreground">
                    {hint}
                </p>
            )}
        </form>
    );
}
