"use client";

import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { EmptyState } from "@/components/shared/EmptyState";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <EmptyState
            icon={TriangleAlert}
            title="This page couldn't be loaded"
            description={
                <>
                    Nothing was changed. Try again, and if it keeps happening check the server logs.
                    {error.digest && <span className="mt-2 block font-mono text-meta">Reference: {error.digest}</span>}
                </>
            }
            className="mt-6"
        >
            <Button onClick={() => reset()}>
                <RotateCcw data-icon="inline-start" />
                Try again
            </Button>
            <Link href="/admin" className={buttonVariants({ variant: "outline" })}>
                Back to dashboard
            </Link>
        </EmptyState>
    );
}
