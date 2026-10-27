"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const routeKey = `${pathname}?${searchParams.toString()}`;
    // null = hidden; 100 = finishing
    const [progress, setProgress] = useState<number | null>(null);
    const [lastRouteKey, setLastRouteKey] = useState(routeKey);
    const timerRef = useRef<ReturnType<typeof setInterval>>(null);

    // Route changed: finish the bar (adjusting state during render, not in an effect)
    if (routeKey !== lastRouteKey) {
        setLastRouteKey(routeKey);
        if (progress !== null) setProgress(100);
    }

    useEffect(() => {
        if (progress !== 100) return;
        if (timerRef.current) clearInterval(timerRef.current);
        const hide = setTimeout(() => setProgress(null), 250);
        return () => clearTimeout(hide);
    }, [progress]);

    useEffect(() => {
        let safety: ReturnType<typeof setTimeout> | undefined;

        const handleClick = (e: MouseEvent) => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                return;
            }
            const anchor = (e.target as HTMLElement).closest("a");
            if (!anchor) return;
            const href = anchor.getAttribute("href");
            if (
                !href ||
                href.startsWith("#") ||
                anchor.hasAttribute("download") ||
                (anchor.target && anchor.target !== "_self")
            )
                return;

            const url = new URL(anchor.href, window.location.href);
            const current = window.location;
            // External links and links to the current URL never change the route
            if (url.origin !== current.origin) return;
            if (url.pathname === current.pathname && url.search === current.search) return;

            setProgress(15);
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setProgress((p) => (p === null || p >= 90 ? p : p + (90 - p) * 0.1));
            }, 200);
            clearTimeout(safety);
            safety = setTimeout(() => setProgress((p) => (p === null ? p : 100)), 10000);
        };

        document.addEventListener("click", handleClick, true);
        return () => {
            document.removeEventListener("click", handleClick, true);
            clearTimeout(safety);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    if (progress === null) return null;

    return (
        <div className="fixed inset-x-0 top-0 z-[100] h-0.5" role="presentation">
            <div
                className="h-full bg-primary transition-[width] duration-200 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
