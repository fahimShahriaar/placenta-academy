"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval>>(null);
    const prevPathRef = useRef(pathname + searchParams.toString());

    const reset = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setProgress(100);
        setTimeout(() => {
            setVisible(false);
            setProgress(0);
        }, 200);
    }, []);

    useEffect(() => {
        const current = pathname + searchParams.toString();
        if (current === prevPathRef.current) return;
        prevPathRef.current = current;
        reset();
    }, [pathname, searchParams, reset]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement).closest("a");
            if (!anchor) return;
            const href = anchor.getAttribute("href");
            if (
                !href ||
                href.startsWith("#") ||
                href.startsWith("http") ||
                anchor.hasAttribute("download") ||
                anchor.target === "_blank"
            )
                return;

            // Starting navigation
            setVisible(true);
            setProgress(15);
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setProgress((p) => {
                    if (p >= 90) return p;
                    return p + (90 - p) * 0.1;
                });
            }, 200);
        };

        document.addEventListener("click", handleClick, true);
        return () => {
            document.removeEventListener("click", handleClick, true);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-0.5">
            <div
                className="h-full bg-primary transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
