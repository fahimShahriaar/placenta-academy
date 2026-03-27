import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <article className="container mx-auto px-4 py-8 max-w-4xl">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="aspect-video w-full rounded-xl mb-8" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <div className="flex gap-4 mb-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
            </div>
            <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                ))}
                <Skeleton className="h-5 w-2/3" />
            </div>
        </article>
    );
}
