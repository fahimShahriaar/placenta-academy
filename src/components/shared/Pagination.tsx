import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath: string;
    searchParams?: Record<string, string | string[]>;
}

export function Pagination({
    currentPage,
    totalPages,
    basePath,
    searchParams = {},
}: PaginationProps) {
    if (totalPages <= 1) return null;

    function buildHref(page: number) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(searchParams)) {
            for (const v of Array.isArray(value) ? value : [value]) {
                params.append(key, v);
            }
        }
        if (page > 1) params.set("page", page.toString());
        const qs = params.toString();
        return qs ? `${basePath}?${qs}` : basePath;
    }

    const pages: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== "...") {
            pages.push("...");
        }
    }

    const stepClass = cn(buttonVariants({ variant: "outline", size: "default" }), "gap-1.5 px-3 sm:px-4");
    const disabledStep = cn(stepClass, "pointer-events-none opacity-45 shadow-none");

    return (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-3 sm:justify-center">
            {currentPage > 1 ? (
                <Link href={buildHref(currentPage - 1)} className={stepClass} rel="prev">
                    <ChevronLeft />
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sr-only sm:hidden">Previous page</span>
                </Link>
            ) : (
                <span className={disabledStep} aria-disabled="true">
                    <ChevronLeft />
                    <span className="hidden sm:inline">Previous</span>
                </span>
            )}

            <p className="text-sm text-muted-foreground sm:hidden">
                Page <span className="font-medium text-foreground">{currentPage}</span>{" "}of {totalPages}
            </p>

            <ol className="hidden items-center gap-1 sm:flex">
                {pages.map((page, i) =>
                    page === "..." ? (
                        <li key={`dots-${i}`} className="px-1.5 text-muted-foreground" aria-hidden="true">
                            …
                        </li>
                    ) : (
                        <li key={page}>
                            <Link
                                href={buildHref(page)}
                                aria-label={`Page ${page}`}
                                aria-current={currentPage === page ? "page" : undefined}
                                className={cn(
                                    buttonVariants({
                                        variant: currentPage === page ? "default" : "ghost",
                                        size: "icon",
                                    }),
                                    "tabular-nums"
                                )}
                            >
                                {page}
                            </Link>
                        </li>
                    )
                )}
            </ol>

            {currentPage < totalPages ? (
                <Link href={buildHref(currentPage + 1)} className={stepClass} rel="next">
                    <span className="hidden sm:inline">Next</span>
                    <span className="sr-only sm:hidden">Next page</span>
                    <ChevronRight />
                </Link>
            ) : (
                <span className={disabledStep} aria-disabled="true">
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight />
                </span>
            )}
        </nav>
    );
}
