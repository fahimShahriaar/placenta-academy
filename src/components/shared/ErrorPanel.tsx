"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { StatusPanel } from "@/components/shared/StatusPages";

export function ErrorPanel({
    reset,
    digest,
    homeHref = "/",
    homeLabel = "Back to home",
}: {
    reset: () => void;
    digest?: string;
    homeHref?: string;
    homeLabel?: string;
}) {
    return (
        <StatusPanel
            code="Something went wrong"
            title="We couldn't load this page."
            description={
                <>
                    <p>This is usually temporary. Try again, and if it keeps happening, come back a little later.</p>
                    {digest && (
                        <p className="mt-3 font-mono text-meta text-muted-foreground/80">Reference: {digest}</p>
                    )}
                </>
            }
            actions={
                <>
                    <Button size="lg" onClick={() => reset()}>
                        <RotateCcw data-icon="inline-start" />
                        Try again
                    </Button>
                    <Link href={homeHref} className={buttonVariants({ variant: "outline", size: "lg" })}>
                        {homeLabel}
                    </Link>
                </>
            }
        />
    );
}
