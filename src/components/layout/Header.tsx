"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/notes", label: "Notes" },
    { href: "/blog", label: "Blog" },
];

// Section links stay highlighted on their detail routes (/notes/[slug] etc.)
function linkState(pathname: string, href: string) {
    const exact = pathname === href;
    const inSection = href !== "/" && pathname.startsWith(`${href}/`);
    return {
        active: exact || inSection,
        ariaCurrent: exact ? ("page" as const) : inSection ? ("true" as const) : undefined,
    };
}

export function Header() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const onLibrary = pathname === "/notes";

    return (
        <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
            <a
                href="#main-content"
                className="sr-only rounded-md bg-card px-4 py-2 text-sm font-medium shadow-md focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
            >
                Skip to content
            </a>
            <div className="container-page flex h-16 items-center gap-4 md:h-[4.5rem]">
                <Link
                    href="/"
                    aria-label="Placenta Academy home"
                    className="-m-1 rounded-lg p-1"
                >
                    <Logo />
                </Link>

                <nav aria-label="Main" className="ml-auto hidden md:block">
                    <ul className="flex items-center gap-1">
                        {navLinks.map((link) => {
                            const { active, ariaCurrent } = linkState(pathname, link.href);
                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        aria-current={ariaCurrent}
                                        className={cn(
                                            "relative inline-flex h-10 items-center rounded-lg px-3.5 text-[0.9375rem] font-medium transition-colors duration-150",
                                            active
                                                ? "text-foreground after:absolute after:inset-x-3.5 after:-bottom-[0.95rem] after:h-0.5 after:rounded-full after:bg-primary"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="ml-auto flex items-center gap-1.5 md:ml-2">
                    <ThemeToggle />
                    {!onLibrary && (
                        <Link
                            href="/notes"
                            className={cn(buttonVariants({ size: "default" }), "ml-1.5 hidden lg:inline-flex")}
                        >
                            Explore notes
                            <ArrowRight data-icon="inline-end" />
                        </Link>
                    )}

                    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                        <SheetTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden"
                                    aria-label="Open menu"
                                />
                            }
                        >
                            <Menu className="size-5" />
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[88%] max-w-sm">
                            <SheetHeader>
                                <SheetTitle>Menu</SheetTitle>
                                <SheetDescription className="sr-only">
                                    Site navigation
                                </SheetDescription>
                            </SheetHeader>
                            <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
                                <ul className="space-y-1">
                                    {navLinks.map((link) => {
                                        const { active, ariaCurrent } = linkState(pathname, link.href);
                                        return (
                                            <li key={link.href}>
                                                <Link
                                                    href={link.href}
                                                    aria-current={ariaCurrent}
                                                    onClick={() => setMenuOpen(false)}
                                                    className={cn(
                                                        "flex h-12 items-center rounded-xl px-4 text-base font-medium transition-colors",
                                                        active
                                                            ? "bg-secondary text-secondary-foreground"
                                                            : "text-foreground hover:bg-muted"
                                                    )}
                                                >
                                                    {link.label}
                                                    {active && (
                                                        <span className="ml-auto size-1.5 rounded-full bg-primary" aria-hidden="true" />
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>
                            <SheetFooter>
                                <Link
                                    href="/notes"
                                    onClick={() => setMenuOpen(false)}
                                    className={cn(buttonVariants({ size: "xl" }), "w-full")}
                                >
                                    Explore notes
                                    <ArrowRight data-icon="inline-end" />
                                </Link>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
