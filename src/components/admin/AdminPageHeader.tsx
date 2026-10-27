import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
    title,
    description,
    actions,
    back,
}: {
    title: string;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    back?: { href: string; label: string };
}) {
    return (
        <div className="mb-6 flex flex-col gap-4 md:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                {back && (
                    <Link
                        href={back.href}
                        className="mb-3 inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        {back.label}
                    </Link>
                )}
                <h1 className="font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.015em] text-balance md:text-[2rem]">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1.5 max-w-2xl text-[0.9375rem] leading-relaxed text-muted-foreground">{description}</p>
                )}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
    );
}

export function AdminPanel({
    title,
    description,
    action,
    children,
    className,
}: {
    title?: string;
    description?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={cn("overflow-clip rounded-2xl border bg-card", className)}>
            {title && (
                <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold">{title}</h2>
                        {description && <p className="mt-0.5 text-meta text-muted-foreground">{description}</p>}
                    </div>
                    {action}
                </div>
            )}
            {children}
        </section>
    );
}
