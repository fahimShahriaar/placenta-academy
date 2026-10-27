"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteBlog } from "@/actions/blogs";
import { toast } from "sonner";

export function BlogDeleteButton({ id, title }: { id: string; title: string }) {
    async function handleDelete() {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        const result = await deleteBlog(id);
        if (result.success) {
            toast.success("Blog post deleted.");
        } else {
            toast.error(result.error);
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={handleDelete}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    );
}
