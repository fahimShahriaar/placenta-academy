"use client";

import { useState } from "react";
import { LoaderCircle, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogClose,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * Accessible replacement for window.confirm on destructive actions. The
 * dialog stays open (and can't be dismissed) while the action is pending,
 * and only closes once the action reports success.
 */
export function ConfirmDialog({
    trigger,
    title,
    description,
    confirmLabel,
    pendingLabel = "Deleting…",
    onConfirm,
}: {
    trigger: React.ReactElement;
    title: string;
    description: React.ReactNode;
    confirmLabel: string;
    pendingLabel?: string;
    /** Return true when the action succeeded. */
    onConfirm: () => Promise<boolean>;
}) {
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);

    async function confirm() {
        setPending(true);
        try {
            const ok = await onConfirm();
            if (ok) setOpen(false);
        } finally {
            setPending(false);
        }
    }

    return (
        <AlertDialog
            open={open}
            onOpenChange={(next) => {
                if (!pending) setOpen(next);
            }}
        >
            <AlertDialogTrigger render={trigger} />
            <AlertDialogContent>
                <AlertDialogHeader>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive-soft text-destructive">
                        <TriangleAlert className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <AlertDialogTitle>{title}</AlertDialogTitle>
                        <AlertDialogDescription>{description}</AlertDialogDescription>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogClose render={<Button variant="outline" disabled={pending} />}>
                        Cancel
                    </AlertDialogClose>
                    <Button variant="destructive" onClick={confirm} disabled={pending} aria-live="polite">
                        {pending && <LoaderCircle className="animate-spin" data-icon="inline-start" />}
                        {pending ? pendingLabel : confirmLabel}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
