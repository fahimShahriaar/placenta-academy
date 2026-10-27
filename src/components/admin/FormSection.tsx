import { cn } from "@/lib/utils";

/** Settings-style form section: heading and guidance on the left, fields on the right. */
export function FormSection({
    title,
    description,
    children,
    className,
    id,
}: {
    title: string;
    description?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    id?: string;
}) {
    return (
        <section
            aria-labelledby={id}
            className={cn(
                "grid gap-5 border-b py-8 first:pt-0 last:border-b-0 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10",
                className
            )}
        >
            <div>
                <h2 id={id} className="text-base font-semibold">
                    {title}
                </h2>
                {description && (
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
                )}
            </div>
            <div className="min-w-0 space-y-5">{children}</div>
        </section>
    );
}

export function FieldError({ id, children }: { id: string; children?: React.ReactNode }) {
    if (!children) return null;
    return (
        <p id={id} role="alert" className="text-sm font-medium text-destructive">
            {children}
        </p>
    );
}

/** Toggleable chip used for tag selection in admin forms. */
export function TagToggle({
    selected,
    onToggle,
    children,
}: {
    selected: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onToggle}
            className={cn(
                "inline-flex h-9 max-w-full items-center gap-1.5 rounded-full border px-3.5 text-sm transition-[background-color,border-color,color] duration-150 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
                selected
                    ? "border-primary bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
                    : "border-border-strong bg-card text-foreground hover:border-foreground/35 hover:bg-sunken"
            )}
        >
            <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className={cn("-ml-1 size-3.5 shrink-0 transition-all", selected ? "opacity-100" : "w-0 opacity-0 -ml-1.5")}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M3.5 8.5l3 3 6-7" />
            </svg>
            <span className="truncate">{children}</span>
        </button>
    );
}
