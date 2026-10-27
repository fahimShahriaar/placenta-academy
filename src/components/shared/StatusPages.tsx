import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

/** Branded composition shared by the 404 and error pages. */
export function StatusPanel({
    code,
    title,
    description,
    actions,
    className,
}: {
    code: string;
    title: string;
    description: React.ReactNode;
    actions: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={cn("container-page flex min-h-[62vh] items-center py-16", className)}>
            <div className="grid w-full items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
                <div className="max-w-xl">
                    <p className="eyebrow">{code}</p>
                    <h1 className="mt-3 font-display text-title font-semibold text-balance">{title}</h1>
                    <div className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">
                        {description}
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
                </div>
                <svg
                    viewBox="0 0 320 240"
                    aria-hidden="true"
                    className="hidden w-full max-w-sm justify-self-center md:block"
                    fill="none"
                >
                    <rect x="8" y="8" width="304" height="224" rx="28" className="fill-mint" />
                    <g className="stroke-primary" strokeWidth="3" strokeLinecap="round">
                        <path d="M160 196v-56" />
                        <path d="M160 140c0-22-24-34-52-42" />
                        <path d="M160 140c0-22 24-34 52-42" />
                        <path d="M160 140V86" strokeDasharray="2 9" />
                    </g>
                    <circle cx="108" cy="98" r="8" strokeWidth="3" className="fill-card stroke-primary" />
                    <circle cx="212" cy="98" r="8" strokeWidth="3" className="fill-card stroke-primary" />
                    <circle cx="160" cy="66" r="13" strokeWidth="2.5" strokeDasharray="4 5" className="stroke-coral" />
                    <path d="M112 196h96" strokeWidth="3" strokeLinecap="round" className="stroke-foreground" />
                </svg>
            </div>
        </section>
    );
}

export function NotFoundContent() {
    return (
        <StatusPanel
            code="404 · Page not found"
            title="This page isn't in the library."
            description="The link may be out of date, or the page may have moved. Try the notes library or head back home."
            actions={
                <>
                    <Link href="/notes" className={buttonVariants({ size: "lg" })}>
                        <Search data-icon="inline-start" />
                        Browse notes
                    </Link>
                    <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                        <ArrowLeft data-icon="inline-start" />
                        Back to home
                    </Link>
                </>
            }
        />
    );
}
