import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath: string;
    searchParams?: Record<string, string>;
}

export function Pagination({
    currentPage,
    totalPages,
    basePath,
    searchParams = {},
}: PaginationProps) {
    if (totalPages <= 1) return null;

    function buildHref(page: number) {
        const params = new URLSearchParams(searchParams);
        params.set("page", page.toString());
        return `${basePath}?${params.toString()}`;
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

    return (
        <div className="flex items-center justify-center gap-1">
            <Link href={buildHref(Math.max(1, currentPage - 1))}>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            </Link>

            {pages.map((page, i) =>
                page === "..." ? (
                    <span key={`dots-${i}`} className="px-2 text-muted-foreground">
                        ...
                    </span>
                ) : (
                    <Link key={page} href={buildHref(page)}>
                        <Button
                            variant={currentPage === page ? "default" : "ghost"}
                            size="icon"
                            className="h-9 w-9"
                        >
                            {page}
                        </Button>
                    </Link>
                )
            )}

            <Link href={buildHref(Math.min(totalPages, currentPage + 1))}>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </Link>
        </div>
    );
}
