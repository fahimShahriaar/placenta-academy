"use client";

import { AnimatedCounter } from "@/components/shared/AnimatedCounter";

export function AnimatedCounterSection({
    noteCount,
    blogCount,
    subjectCount,
}: {
    noteCount: number;
    blogCount: number;
    subjectCount: number;
}) {
    return (
        <section className="border-y bg-card">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-3 gap-8">
                    <AnimatedCounter end={noteCount} label="Study Notes" />
                    <AnimatedCounter end={blogCount} label="Blog Posts" />
                    <AnimatedCounter end={subjectCount} label="Subjects Covered" />
                </div>
            </div>
        </section>
    );
}
