import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div aria-busy="true" aria-label="Loading articles">
            <div className="container-page pt-10 md:pt-16">
                <div className="grid gap-8 border-b pb-10 md:pb-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end lg:gap-14">
                    <div>
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="mt-3 h-11 w-full max-w-lg" />
                        <Skeleton className="mt-4 h-5 w-80 max-w-full" />
                    </div>
                    <div>
                        <Skeleton className="h-14 w-full rounded-xl" />
                        <Skeleton className="mt-2 h-4 w-48" />
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 py-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-28 rounded-full" />
                    ))}
                </div>
            </div>
            <div className="container-page pb-16">
                <div className="grid overflow-hidden rounded-2xl border bg-card md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                    <Skeleton className="aspect-[16/10] rounded-none md:aspect-auto md:min-h-[22rem]" />
                    <div className="space-y-4 p-6 sm:p-8 lg:p-10">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-9 w-2/3" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-4/5" />
                    </div>
                </div>
            </div>
        </div>
    );
}
