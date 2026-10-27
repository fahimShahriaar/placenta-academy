"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import {
    ExternalLink,
    FileText,
    Hash,
    LayoutDashboard,
    LoaderCircle,
    LogOut,
    Menu,
    Newspaper,
    Tags,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { BrandMark } from "@/components/brand/Logo";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";

const navGroups = [
    {
        label: null,
        items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
        label: "Content",
        items: [
            { href: "/admin/notes", label: "PDF notes", icon: FileText },
            { href: "/admin/blogs", label: "Articles", icon: Newspaper },
        ],
    },
    {
        label: "Taxonomy",
        items: [
            { href: "/admin/tags/pdf-tags", label: "Note tags", icon: Tags },
            { href: "/admin/tags/blog-tags", label: "Article tags", icon: Hash },
        ],
    },
];

function isActive(pathname: string, href: string) {
    return pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
}

function AdminBrand() {
    return (
        <Link href="/admin" className="-m-1 flex items-center gap-2.5 rounded-lg p-1">
            <BrandMark className="size-8" />
            <span className="flex flex-col leading-none">
                <span className="font-display text-[1.0625rem] font-semibold tracking-[-0.01em]">Placenta Academy</span>
                <span className="mt-1 text-[0.6875rem] font-medium tracking-wide text-muted-foreground">Admin workspace</span>
            </span>
        </Link>
    );
}

function SignOutButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            variant="quiet"
            type="submit"
            disabled={pending}
            className="h-10 w-full justify-start gap-3 px-3"
        >
            {pending ? <LoaderCircle className="animate-spin" /> : <LogOut />}
            {pending ? "Signing out…" : "Sign out"}
        </Button>
    );
}

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();

    return (
        <>
            <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
                {navGroups.map((group) => (
                    <div key={group.label ?? "main"} className="mb-5 last:mb-0">
                        {group.label && (
                            <p className="mb-1.5 px-3 text-xs font-medium text-muted-foreground">{group.label}</p>
                        )}
                        <ul className="space-y-0.5">
                            {group.items.map((item) => {
                                const active = isActive(pathname, item.href);
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={onNavigate}
                                            aria-current={pathname === item.href ? "page" : active ? "true" : undefined}
                                            className={cn(
                                                "relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150",
                                                active
                                                    ? "bg-secondary text-secondary-foreground before:absolute before:top-2 before:bottom-2 before:-left-3 before:w-[3px] before:rounded-r-full before:bg-primary"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            <item.icon className={cn("size-[1.125rem]", active ? "text-primary-ink" : "")} aria-hidden="true" />
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="space-y-1 border-t p-3">
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <ExternalLink className="size-4" aria-hidden="true" />
                    View website
                    <span className="sr-only">(opens in a new tab)</span>
                </a>
                <div className="flex items-center justify-between rounded-lg pr-1 pl-3">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <ThemeToggle />
                </div>
                <form action={logoutAction}>
                    <SignOutButton />
                </form>
            </div>
        </>
    );
}

/** Desktop sidebar */
export function AdminSidebar() {
    return (
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-sidebar md:flex">
            <div className="flex h-16 items-center border-b px-5">
                <AdminBrand />
            </div>
            <NavContent />
        </aside>
    );
}

/** Mobile header with its own drawer, so the menu never overlaps page titles. */
export function AdminMobileHeader() {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/90 px-3 backdrop-blur-md md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open admin menu" />}>
                    <Menu className="size-5" />
                </SheetTrigger>
                <SheetContent side="left" className="w-[85%] max-w-xs gap-0 bg-sidebar">
                    <div className="flex h-14 items-center border-b px-5">
                        <SheetTitle className="sr-only">Admin menu</SheetTitle>
                        <SheetDescription className="sr-only">Navigate the admin workspace</SheetDescription>
                        <AdminBrand />
                    </div>
                    <NavContent onNavigate={() => setOpen(false)} />
                </SheetContent>
            </Sheet>
            <AdminBrand />
        </header>
    );
}
