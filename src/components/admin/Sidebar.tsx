"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    BookOpen,
    Tags,
    LogOut,
    Menu,
    X,
    GraduationCap,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/notes", label: "PDF Notes", icon: FileText },
    { href: "/admin/blogs", label: "Blogs", icon: BookOpen },
    { href: "/admin/tags/pdf-tags", label: "PDF Tags", icon: Tags },
    { href: "/admin/tags/blog-tags", label: "Blog Tags", icon: Tags },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Mobile toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden"
                onClick={() => setOpen(!open)}
            >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r flex flex-col transition-transform duration-300 md:translate-x-0 md:static",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-6 border-b">
                    <Link
                        href="/admin"
                        className="flex items-center gap-2 font-bold text-lg"
                    >
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <span>Placenta Admin</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t space-y-2">
                    <div className="flex items-center justify-between px-3">
                        <span className="text-sm text-muted-foreground">Theme</span>
                        <ThemeToggle />
                    </div>
                    <form action={logoutAction}>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-muted-foreground"
                            type="submit"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </form>
                </div>
            </aside>
        </>
    );
}
