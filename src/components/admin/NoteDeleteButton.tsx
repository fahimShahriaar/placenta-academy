"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { deleteNote } from "@/actions/notes";

export function NoteDeleteButton({ id, title }: { id: number; title: string }) {
    return (
        <ConfirmDialog
            trigger={
                <Button variant="destructive-ghost" size="icon-sm" aria-label={`Delete “${title}”`}>
                    <Trash2 />
                </Button>
            }
            title="Delete this note?"
            description={
                <>
                    <span className="font-medium text-foreground">“{title}”</span>{" "}and its PDF file will be
                    permanently removed from the library. This can&apos;t be undone.
                </>
            }
            confirmLabel="Delete note"
            onConfirm={async () => {
                const result = await deleteNote(id);
                if ("error" in result && result.error) {
                    toast.error(result.error);
                    return false;
                }
                toast.success("Note deleted.");
                return true;
            }}
        />
    );
}
