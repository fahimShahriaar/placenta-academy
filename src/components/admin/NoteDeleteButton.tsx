"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteNote } from "@/actions/notes";
import { toast } from "sonner";

export function NoteDeleteButton({ id, title }: { id: string; title: string }) {
    async function handleDelete() {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        const result = await deleteNote(id);
        if (result.success) {
            toast.success("Note deleted.");
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
