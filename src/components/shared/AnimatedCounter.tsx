"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({ end, label }: { end: number; label: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const duration = 1500;
                    const step = Math.max(1, Math.floor(end / (duration / 16)));
                    let current = 0;

                    const timer = setInterval(() => {
                        current += step;
                        if (current >= end) {
                            setCount(end);
                            clearInterval(timer);
                        } else {
                            setCount(current);
                        }
                    }, 16);
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end]);

    return (
        <div ref={ref} className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary">
                {count.toLocaleString()}+
            </div>
            <div className="text-sm text-muted-foreground mt-1">{label}</div>
        </div>
    );
}
