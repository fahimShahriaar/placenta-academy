import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="space-y-8" aria-busy="true" aria-label="Loading">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="mt-2.5 h-5 w-72 max-w-full" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32 rounded-lg" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-3 bg-card p-5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3.5 w-28" />
                    </div>
                ))}
            </div>
            <div className="overflow-hidden rounded-2xl border bg-card">
                <div className="border-b px-5 py-4">
                    <Skeleton className="h-5 w-40" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 border-b px-5 py-4 last:border-b-0">
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-3.5 w-1/3" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}
