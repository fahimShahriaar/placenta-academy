import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div aria-busy="true" aria-label="Loading notes">
            <div className="border-b bg-card/70">
                <div className="container-page grid gap-8 pt-10 pb-10 md:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-end lg:gap-14 lg:pb-12">
                    <div>
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="mt-3 h-11 w-56" />
                        <Skeleton className="mt-4 h-5 w-full max-w-md" />
                        <Skeleton className="mt-2 h-5 w-3/4 max-w-sm" />
                    </div>
                    <div>
                        <Skeleton className="h-14 w-full rounded-xl" />
                        <Skeleton className="mt-2 h-4 w-72" />
                    </div>
                </div>
            </div>
            <div className="container-page pt-8 pb-16 md:pt-10 lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-10 xl:gap-12">
                <div className="hidden rounded-2xl border bg-card lg:block">
                    <div className="border-b px-5 py-4">
                        <Skeleton className="h-5 w-16" />
                    </div>
                    <div className="space-y-3 p-5">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <Skeleton key={i} className="h-6 w-full" />
                        ))}
                    </div>
                </div>
                <div className="min-w-0">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-28 rounded-lg lg:hidden" />
                    </div>
                    <div className="mt-6 grid gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex gap-5 rounded-2xl border bg-card p-5">
                                <Skeleton className="hidden h-12 w-10 rounded-md sm:block" />
                                <div className="flex-1 space-y-2.5">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-6 w-2/3" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
