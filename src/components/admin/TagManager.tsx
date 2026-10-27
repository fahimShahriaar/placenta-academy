"use client";

import { useState } from "react";
import { Check, Hash, LoaderCircle, Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import {
    createPdfTag,
    updatePdfTag,
    deletePdfTag,
    createBlogTag,
    updateBlogTag,
    deleteBlogTag,
} from "@/actions/tags";
import { pluralize } from "@/lib/format";
import { CATEGORY_LABELS, CATEGORY_ORDER, CATEGORY_PLURALS, compareTagNames } from "@/lib/taxonomy";
import type { PdfTagCategory } from "@/generated/prisma/enums";

interface Tag {
    id: number;
    name: string;
    slug: string;
    category?: string;
    _count: { notes?: number; posts?: number };
}

interface TagManagerProps {
    tags: Tag[];
    type: "pdf" | "blog";
}

const CATEGORY_DESCRIPTIONS: Record<PdfTagCategory, string> = {
    PHASE: "Shown as the phase sequence on the homepage and in library filters.",
    SUBJECT: "Shown as subject shortcuts on the homepage and in library filters.",
    SYSTEM: "Organ systems, used as library filters.",
    TOPIC: "Finer-grained topics, used as library filters.",
    OTHER: "Anything that doesn't fit the categories above.",
};

function usageOf(tag: Tag, type: "pdf" | "blog") {
    const count = tag._count?.notes ?? tag._count?.posts ?? 0;
    return { count, label: count === 0 ? "Unused" : pluralize(count, type === "pdf" ? "note" : "article") };
}

function TagRow({ tag, type }: { tag: Tag; type: "pdf" | "blog" }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(tag.name);
    const [saving, setSaving] = useState(false);
    const usage = usageOf(tag, type);
    const inputId = `tag-${tag.id}-name`;

    async function save() {
        const name = value.trim();
        if (!name || name === tag.name) {
            setEditing(false);
            setValue(tag.name);
            return;
        }
        setSaving(true);
        const result = type === "pdf" ? await updatePdfTag(tag.id, name) : await updateBlogTag(tag.id, name);
        setSaving(false);
        if ("error" in result) {
            toast.error(result.error as string);
        } else {
            toast.success("Tag renamed.");
            setEditing(false);
        }
    }

    return (
        <li className="flex min-h-[3.75rem] items-center gap-3 border-b px-5 py-2.5 last:border-b-0">
            {editing ? (
                <form
                    className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        save();
                    }}
                >
                    <Label htmlFor={inputId} className="sr-only">
                        Tag name
                    </Label>
                    <Input
                        id={inputId}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="h-9 min-w-0 flex-1 basis-48"
                        maxLength={100}
                        autoFocus
                        disabled={saving}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") {
                                setEditing(false);
                                setValue(tag.name);
                            }
                        }}
                    />
                    <div className="flex gap-1">
                        <Button type="submit" size="sm" disabled={saving}>
                            {saving ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <Check data-icon="inline-start" />}
                            Save
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="quiet"
                            disabled={saving}
                            onClick={() => {
                                setEditing(false);
                                setValue(tag.name);
                            }}
                        >
                            <X data-icon="inline-start" />
                            Cancel
                        </Button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{tag.name}</p>
                        <p className="truncate font-mono text-xs text-muted-foreground">/{tag.slug}</p>
                    </div>
                    <span
                        className={
                            usage.count === 0
                                ? "shrink-0 text-meta text-muted-foreground"
                                : "shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                        }
                    >
                        {usage.label}
                    </span>
                    <div className="flex shrink-0 items-center gap-0.5">
                        <Button
                            variant="quiet"
                            size="icon-sm"
                            onClick={() => setEditing(true)}
                            aria-label={`Rename ${tag.name}`}
                        >
                            <Pencil />
                        </Button>
                        <ConfirmDialog
                            trigger={
                                <Button variant="destructive-ghost" size="icon-sm" aria-label={`Delete ${tag.name}`}>
                                    <Trash2 />
                                </Button>
                            }
                            title={`Delete the “${tag.name}” tag?`}
                            description={
                                usage.count > 0
                                    ? `It will be removed from ${usage.label}. The ${type === "pdf" ? "notes" : "articles"} themselves won't be deleted.`
                                    : "It isn't used anywhere yet. This can't be undone."
                            }
                            confirmLabel="Delete tag"
                            onConfirm={async () => {
                                const result = type === "pdf" ? await deletePdfTag(tag.id) : await deleteBlogTag(tag.id);
                                if ("error" in result) {
                                    toast.error(result.error as string);
                                    return false;
                                }
                                toast.success("Tag deleted.");
                                return true;
                            }}
                        />
                    </div>
                </>
            )}
        </li>
    );
}

function CreateTagDialog({ type }: { type: "pdf" | "blog" }) {
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [category, setCategory] = useState<string | null>(null);

    async function handleCreate(formData: FormData) {
        if (type === "pdf" && !category) {
            setError("Choose a category for this tag.");
            return;
        }
        setPending(true);
        setError(null);
        const result = type === "pdf" ? await createPdfTag(formData) : await createBlogTag(formData);
        setPending(false);

        if ("error" in result) {
            setError(result.error as string);
        } else {
            toast.success("Tag created.");
            setOpen(false);
            setCategory(null);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (pending) return;
                setOpen(next);
                if (!next) setError(null);
            }}
        >
            <DialogTrigger render={<Button />}>
                <Plus data-icon="inline-start" />
                New tag
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New {type === "pdf" ? "note" : "article"} tag</DialogTitle>
                    <DialogDescription>
                        {type === "pdf"
                            ? "Note tags power the library filters and homepage shortcuts."
                            : "Article tags appear as topic filters on the blog."}
                    </DialogDescription>
                </DialogHeader>
                <form action={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-tag-name">Name</Label>
                        <Input
                            id="new-tag-name"
                            name="name"
                            placeholder={type === "pdf" ? "e.g. Cardiovascular" : "e.g. Exam prep"}
                            required
                            maxLength={100}
                            autoFocus
                        />
                    </div>
                    {type === "pdf" && (
                        <div className="space-y-2">
                            <Label id="new-tag-category-label">Category</Label>
                            <Select name="category" value={category} onValueChange={(v) => setCategory(v as string)}>
                                <SelectTrigger className="w-full" aria-labelledby="new-tag-category-label">
                                    <SelectValue placeholder="Choose a category">
                                        {(value: string | null) =>
                                            value ? CATEGORY_LABELS[value as PdfTagCategory] : "Choose a category"
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORY_ORDER.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {CATEGORY_LABELS[c]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {error && (
                        <p role="alert" className="text-sm font-medium text-destructive">
                            {error}
                        </p>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={pending}>
                            {pending && <LoaderCircle className="animate-spin" data-icon="inline-start" />}
                            {pending ? "Creating…" : "Create tag"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function TagManager({ tags, type }: TagManagerProps) {
    const groups =
        type === "pdf"
            ? CATEGORY_ORDER.map((category) => ({
                  key: category,
                  title: CATEGORY_PLURALS[category],
                  description: CATEGORY_DESCRIPTIONS[category],
                  tags: tags.filter((t) => t.category === category).sort(compareTagNames),
              })).filter((g) => g.tags.length > 0)
            : [{ key: "all", title: "All article tags", description: "Shown as topic filters on the blog.", tags }];

    return (
        <div>
            <AdminPageHeader
                title={type === "pdf" ? "Note tags" : "Article tags"}
                description={
                    type === "pdf"
                        ? `${pluralize(tags.length, "tag")} across ${pluralize(groups.length, "category", "categories")}. Phases and subjects also drive the homepage.`
                        : `${pluralize(tags.length, "tag")} used to organize the blog.`
                }
                actions={<CreateTagDialog type={type} />}
            />

            {tags.length === 0 ? (
                <EmptyState
                    icon={type === "pdf" ? Tags : Hash}
                    title="No tags yet"
                    description="Create a tag to start organizing content."
                />
            ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                    {groups.map((group) => (
                        <AdminPanel
                            key={group.key}
                            title={group.title}
                            description={group.description}
                            className={type === "blog" ? "lg:col-span-2" : undefined}
                            action={
                                <span className="shrink-0 text-meta text-muted-foreground tabular-nums">
                                    {group.tags.length}
                                </span>
                            }
                        >
                            <ul>
                                {group.tags.map((tag) => (
                                    <TagRow key={tag.id} tag={tag} type={type} />
                                ))}
                            </ul>
                        </AdminPanel>
                    ))}
                </div>
            )}
        </div>
    );
}
