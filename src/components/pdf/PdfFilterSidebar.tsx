"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter, X } from "lucide-react";
import { useState } from "react";

interface TagGroup {
    category: string;
    label: string;
    tags: {
        id: string;
        name: string;
        slug: string;
        _count: { notes: number };
    }[];
}

interface PdfFilterSidebarProps {
    tagGroups: TagGroup[];
}

const CATEGORY_LABELS: Record<string, string> = {
    PHASE: "Phase",
    SUBJECT: "Subject",
    SYSTEM: "System",
    TOPIC: "Topic",
    OTHER: "Other",
};

function FilterContent({ tagGroups }: { tagGroups: TagGroup[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const activeTags = searchParams.getAll("tag");

    function toggleTag(slug: string) {
        const params = new URLSearchParams(searchParams.toString());
        const tags = params.getAll("tag");
        params.delete("tag");
        params.delete("page");

        if (tags.includes(slug)) {
            tags
                .filter((t) => t !== slug)
                .forEach((t) => params.append("tag", t));
        } else {
            tags.forEach((t) => params.append("tag", t));
            params.append("tag", slug);
        }

        router.push(`/notes?${params.toString()}`);
    }

    function clearAll() {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("tag");
        params.delete("page");
        router.push(`/notes?${params.toString()}`);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                {activeTags.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs gap-1">
                        <X className="h-3 w-3" />
                        Clear all
                    </Button>
                )}
            </div>

            {tagGroups.map((group) => {
                if (group.tags.length === 0) return null;
                return (
                    <div key={group.category}>
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                            {group.label}
                        </h4>
                        <div className="space-y-2">
                            {group.tags.map((tag) => (
                                <label
                                    key={tag.id}
                                    className="flex items-center gap-2 cursor-pointer text-sm"
                                >
                                    <Checkbox
                                        checked={activeTags.includes(tag.slug)}
                                        onCheckedChange={() => toggleTag(tag.slug)}
                                    />
                                    <span className="flex-1">{tag.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        ({tag._count.notes})
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function PdfFilterSidebar({ tagGroups }: PdfFilterSidebarProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Mobile: Sheet trigger */}
            <div className="lg:hidden mb-4">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger render={<Button variant="outline" className="gap-2" />}>
                        <Filter className="h-4 w-4" />
                        Filters
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 overflow-y-auto">
                        <FilterContent tagGroups={tagGroups} />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop: sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-20 space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto pr-4">
                    <FilterContent tagGroups={tagGroups} />
                </div>
            </aside>
        </>
    );
}
