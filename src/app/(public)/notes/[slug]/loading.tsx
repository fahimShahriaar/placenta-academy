import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-10 w-3/4 mb-3" />
            <Skeleton className="h-5 w-full max-w-lg mb-4" />
            <div className="flex gap-2 mb-6">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            <Skeleton className="h-[60vh] w-full rounded-lg" />
        </div>
    );
}
