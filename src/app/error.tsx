"use client";

import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-5xl font-bold text-destructive mb-4">Oops</h1>
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
                An unexpected error occurred. Please try again.
            </p>
            <Button onClick={() => reset()}>Try Again</Button>
        </div>
    );
}
