"use client";

import { ErrorPanel } from "@/components/shared/ErrorPanel";

export default function PublicError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return <ErrorPanel reset={reset} digest={error.digest} />;
}
