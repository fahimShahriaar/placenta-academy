import { cn } from "@/lib/utils";

export function StatusBadge({ published, className }: { published: boolean; className?: string }) {
    return (
        <span
            className={cn(
                "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
                published ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
                className
            )}
        >
            <span
                aria-hidden="true"
                className={cn("size-1.5 rounded-full", published ? "bg-success" : "bg-warning")}
            />
            {published ? "Published" : "Draft"}
        </span>
    );
}
