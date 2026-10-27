"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/** Matches the reader's toolbar and first-page footprint to avoid layout shift. */
export function ReaderSkeleton() {
    return (
        <div className="overflow-clip rounded-2xl border bg-card shadow-sm" aria-busy="true" aria-label="Loading document reader">
            <div className="flex h-[3.5625rem] items-center justify-between gap-2 border-b px-2 sm:px-3">
                <div className="flex items-center gap-1">
                    <Skeleton className="size-10 rounded-lg" />
                    <Skeleton className="h-9 w-20 rounded-md" />
                    <Skeleton className="size-10 rounded-lg" />
                </div>
                <div className="flex items-center gap-1">
                    <Skeleton className="size-10 rounded-lg" />
                    <Skeleton className="size-10 rounded-lg" />
                    <Skeleton className="size-10 rounded-lg" />
                </div>
            </div>
            <div className="bg-canvas p-3 sm:p-6">
                <div className="mx-auto aspect-[1/1.414] w-full max-w-[1000px] animate-pulse rounded-sm bg-white/70 shadow-sm dark:bg-white/10" />
            </div>
        </div>
    );
}

// react-pdf touches browser-only APIs (DOMMatrix) at import time, so the
// viewer must never render on the server.
const PdfViewer = dynamic(() => import("./PdfViewer").then((m) => m.PdfViewer), {
    ssr: false,
    loading: () => <ReaderSkeleton />,
});

export function PdfReader(props: { filePath: string; fileName: string }) {
    return <PdfViewer {...props} />;
}
