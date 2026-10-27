"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
    createPdfTag,
    updatePdfTag,
    deletePdfTag,
    createBlogTag,
    updateBlogTag,
    deleteBlogTag,
} from "@/actions/tags";

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

const CATEGORY_COLORS: Record<string, string> = {
    SUBJECT: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    PHASE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    TOPIC: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    SYSTEM: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    OTHER: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
};

export function TagManager({ tags, type }: TagManagerProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");

    async function handleCreate(formData: FormData) {
        const result =
            type === "pdf"
                ? await createPdfTag(formData)
                : await createBlogTag(formData);

        if ("error" in result) {
            toast.error(result.error as string);
        } else {
            toast.success("Tag created successfully.");
            setDialogOpen(false);
        }
    }

    async function handleUpdate(id: number) {
        if (!editValue.trim()) return;
        const result =
            type === "pdf"
                ? await updatePdfTag(id, editValue)
                : await updateBlogTag(id, editValue);

        if ("error" in result) {
            toast.error(result.error as string);
        } else {
            toast.success("Tag updated.");
            setEditingId(null);
        }
    }

    async function handleDelete(id: number, name: string) {
        if (!confirm(`Delete tag "${name}"? This cannot be undone.`)) return;
        const result =
            type === "pdf" ? await deletePdfTag(id) : await deleteBlogTag(id);

        if ("error" in result) {
            toast.error(result.error as string);
        } else {
            toast.success("Tag deleted.");
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    {type === "pdf" ? "PDF Tags" : "Blog Tags"}
                </h1>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger render={<Button />}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Tag
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Tag</DialogTitle>
                        </DialogHeader>
                        <form action={handleCreate} className="space-y-4">
                            <Input name="name" placeholder="Tag name" required />
                            {type === "pdf" && (
                                <Select name="category" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SUBJECT">Subject</SelectItem>
                                        <SelectItem value="PHASE">Phase</SelectItem>
                                        <SelectItem value="TOPIC">Topic</SelectItem>
                                        <SelectItem value="SYSTEM">System</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                            <Button type="submit" className="w-full">
                                Create
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            {type === "pdf" && <TableHead>Category</TableHead>}
                            <TableHead className="text-right">
                                {type === "pdf" ? "Notes" : "Posts"}
                            </TableHead>
                            <TableHead className="w-24">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tags.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={type === "pdf" ? 4 : 3}
                                    className="text-center text-muted-foreground"
                                >
                                    No tags yet. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tags.map((tag) => (
                                <TableRow key={tag.id}>
                                    <TableCell>
                                        {editingId === tag.id ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="h-8"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleUpdate(tag.id);
                                                        if (e.key === "Escape") setEditingId(null);
                                                    }}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleUpdate(tag.id)}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setEditingId(null)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="font-medium">{tag.name}</span>
                                        )}
                                    </TableCell>
                                    {type === "pdf" && (
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={CATEGORY_COLORS[tag.category || "OTHER"]}
                                            >
                                                {tag.category}
                                            </Badge>
                                        </TableCell>
                                    )}
                                    <TableCell className="text-right">
                                        {tag._count?.notes ?? tag._count?.posts ?? 0}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => {
                                                    setEditingId(tag.id);
                                                    setEditValue(tag.name);
                                                }}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive"
                                                onClick={() => handleDelete(tag.id, tag.name)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
