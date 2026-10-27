import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const footerLinks = [
    { href: "/", label: "Home" },
    { href: "/notes", label: "Study notes" },
    { href: "/blog", label: "Blog" },
];

export function Footer() {
    return (
        <footer className="relative mt-auto overflow-hidden border-t bg-card">
            <div className="container-page grid gap-10 pt-12 pb-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:pt-16">
                <div className="max-w-md">
                    <Link href="/" aria-label="Placenta Academy home" className="-m-1 inline-block rounded-lg p-1">
                        <Logo />
                    </Link>
                    <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
                        Medical study notes and articles, organized by subject, phase,
                        and system — so you spend less time searching and more time
                        understanding.
                    </p>
                </div>
                <nav aria-label="Footer" className="md:justify-self-end">
                    <h2 className="text-meta font-semibold text-foreground">Explore</h2>
                    <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 md:flex-col">
                        {footerLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="text-[0.9375rem] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            <div className="container-page">
                <div className="flex flex-col gap-2 border-t py-5 text-meta text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p>© {new Date().getFullYear()} Placenta Academy. All rights reserved.</p>
                    <p>For education only — not a substitute for professional medical advice.</p>
                </div>
            </div>

            {/* Closing wordmark */}
            <div aria-hidden="true" className="pointer-events-none select-none">
                <div className="container-page">
                    <p className="-mb-[0.12em] font-display sm:-mb-[0.2em] text-[clamp(2.5rem,11.2vw,9.25rem)] leading-[0.9] font-semibold tracking-[-0.045em] whitespace-nowrap text-primary/[0.09] dark:text-primary/[0.12]">
                        Placenta Academy
                    </p>
                </div>
                <div className="h-1.5 bg-gradient-to-r from-primary via-primary to-coral" />
            </div>
        </footer>
    );
}
