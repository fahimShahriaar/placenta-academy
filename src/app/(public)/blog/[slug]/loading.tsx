import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="container-page pt-6 pb-16 md:pt-10" aria-busy="true" aria-label="Loading article">
            <div className="mx-auto max-w-[64rem]">
                <div className="mx-auto max-w-[44rem]">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-8 h-4 w-24" />
                    <Skeleton className="mt-3 h-11 w-full" />
                    <Skeleton className="mt-2 h-11 w-2/3" />
                    <Skeleton className="mt-5 h-6 w-full" />
                    <Skeleton className="mt-6 h-4 w-64" />
                </div>
                <Skeleton className="mt-8 aspect-[16/9] w-full rounded-3xl md:mt-10 md:aspect-[2/1]" />
                <div className="mx-auto mt-10 max-w-[44rem] space-y-4 md:mt-12">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton key={i} className="h-5 w-full" />
                    ))}
                    <Skeleton className="h-5 w-2/3" />
                </div>
            </div>
        </div>
    );
}
