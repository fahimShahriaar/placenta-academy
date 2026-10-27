import Link from "next/link";
import type { PdfTagCategory } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { CATEGORY_BADGE, categoryLabel } from "@/lib/taxonomy";

const BASE =
    "inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border border-transparent px-3 text-meta font-medium whitespace-nowrap";

export function TagBadge({
    name,
    category,
    href,
    showCategory = false,
    className,
}: {
    name: string;
    category?: PdfTagCategory | string;
    href?: string;
    showCategory?: boolean;
    className?: string;
}) {
    const tone = category
        ? CATEGORY_BADGE[category as PdfTagCategory] ?? CATEGORY_BADGE.OTHER
        : "bg-muted text-foreground";
    const content = (
        <>
            {showCategory && category && (
                <span className="font-normal opacity-75">{categoryLabel(category)}</span>
            )}
            <span className="truncate">{name}</span>
        </>
    );

    if (href) {
        return (
            <Link
                href={href}
                className={cn(
                    BASE,
                    tone,
                    "transition-[filter,border-color] duration-150 hover:border-foreground/20 hover:brightness-[0.97] dark:hover:brightness-110",
                    className
                )}
            >
                {content}
            </Link>
        );
    }

    return <span className={cn(BASE, tone, className)}>{content}</span>;
}
