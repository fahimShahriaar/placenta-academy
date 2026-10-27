"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ErrorPanel } from "@/components/shared/ErrorPanel";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <>
            <header className="border-b bg-background">
                <div className="container-page flex h-16 items-center">
                    <Link href="/" aria-label="Placenta Academy home" className="-m-1 rounded-lg p-1">
                        <Logo />
                    </Link>
                </div>
            </header>
            <main id="main-content" className="flex-1">
                <ErrorPanel reset={reset} digest={error.digest} />
            </main>
        </>
    );
}
