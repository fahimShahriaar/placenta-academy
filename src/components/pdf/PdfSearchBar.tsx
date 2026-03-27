"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

export function PdfSearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [, startTransition] = useTransition();

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (query) {
                params.set("q", query);
            } else {
                params.delete("q");
            }
            params.delete("page");
            startTransition(() => {
                router.push(`/notes?${params.toString()}`);
            });
        }, 300);

        return () => clearTimeout(timeout);
    }, [query]);

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes by name, subject, topic..."
                className="pl-9"
            />
        </div>
    );
}
