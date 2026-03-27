import { PdfTagCategory } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const CATEGORY_COLORS: Record<string, string> = {
    SUBJECT: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    PHASE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    TOPIC: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    SYSTEM: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    OTHER: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
};

export function TagBadge({
    name,
    category,
    className,
}: {
    name: string;
    category?: PdfTagCategory | string;
    className?: string;
}) {
    return (
        <Badge
            variant="outline"
            className={cn(
                "text-xs font-medium",
                category ? CATEGORY_COLORS[category] : "",
                className
            )}
        >
            {name}
        </Badge>
    );
}
