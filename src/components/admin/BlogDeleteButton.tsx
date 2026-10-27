"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { deleteBlog } from "@/actions/blogs";

export function BlogDeleteButton({ id, title }: { id: number; title: string }) {
    return (
        <ConfirmDialog
            trigger={
                <Button variant="destructive-ghost" size="icon-sm" aria-label={`Delete “${title}”`}>
                    <Trash2 />
                </Button>
            }
            title="Delete this article?"
            description={
                <>
                    <span className="font-medium text-foreground">“{title}”</span>{" "}and its cover image will be
                    permanently deleted. This can&apos;t be undone.
                </>
            }
            confirmLabel="Delete article"
            onConfirm={async () => {
                const result = await deleteBlog(id);
                if ("error" in result && result.error) {
                    toast.error(result.error);
                    return false;
                }
                toast.success("Article deleted.");
                return true;
            }}
        />
    );
}
