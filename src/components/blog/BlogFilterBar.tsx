"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface BlogTag {
    id: string;
    name: string;
    slug: string;
    _count: { posts: number };
}

interface BlogFilterBarProps {
    tags: BlogTag[];
}

export function BlogFilterBar({ tags }: BlogFilterBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentQuery = searchParams.get("q") || "";
    const currentTags = searchParams.getAll("tag");

    const [query, setQuery] = useState(currentQuery);

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (query) {
                params.set("q", query);
            } else {
                params.delete("q");
            }
            params.delete("page");
            router.push(`${pathname}?${params.toString()}`);
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    function toggleTag(slug: string) {
        const params = new URLSearchParams(searchParams.toString());
        const existing = params.getAll("tag");
        params.delete("tag");
        params.delete("page");

        if (existing.includes(slug)) {
            existing
                .filter((t) => t !== slug)
                .forEach((t) => params.append("tag", t));
        } else {
            existing.forEach((t) => params.append("tag", t));
            params.append("tag", slug);
        }
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="space-y-4">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search articles..."
                    className="pl-10"
                />
            </div>

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                        const active = currentTags.includes(tag.slug);
                        return (
                            <button key={tag.id} onClick={() => toggleTag(tag.slug)}>
                                <Badge
                                    variant={active ? "default" : "outline"}
                                    className="cursor-pointer text-sm"
                                >
                                    {tag.name}
                                    <span className="ml-1 opacity-60">({tag._count.posts})</span>
                                </Badge>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
