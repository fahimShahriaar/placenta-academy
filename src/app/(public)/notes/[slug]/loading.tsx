import { Skeleton } from "@/components/ui/skeleton";
import { ReaderSkeleton } from "@/components/pdf/PdfReader";

export default function Loading() {
    return (
        <div aria-busy="true" aria-label="Loading note">
            <div className="container-page pt-6 md:pt-10">
                <Skeleton className="h-4 w-40" />
                <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end lg:gap-12">
                    <div>
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="mt-3 h-11 w-4/5" />
                        <Skeleton className="mt-4 h-5 w-full max-w-xl" />
                        <div className="mt-5 flex gap-2">
                            <Skeleton className="h-7 w-28 rounded-full" />
                            <Skeleton className="h-7 w-24 rounded-full" />
                        </div>
                    </div>
                    <div className="rounded-2xl border bg-card p-5">
                        <div className="grid grid-cols-3 gap-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-16 rounded-xl" />
                            ))}
                        </div>
                        <Skeleton className="mt-4 h-11 w-full rounded-lg" />
                        <Skeleton className="mx-auto mt-3 h-9 w-48" />
                    </div>
                </div>
            </div>
            <div className="container-page mt-8 pb-16 md:mt-10">
                <ReaderSkeleton />
            </div>
        </div>
    );
}
