"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { createNote, updateNote } from "@/actions/notes";

interface Tag {
    id: number;
    name: string;
    slug: string;
    category: string;
}

interface NoteData {
    id: number;
    title: string;
    description: string | null;
    fileName: string;
    searchNames: string[];
    tags: { tag: Tag }[];
}

interface PdfUploadFormProps {
    tags: Tag[];
    note?: NoteData;
}

const CATEGORIES = ["PHASE", "SUBJECT", "SYSTEM", "TOPIC", "OTHER"];
const CATEGORY_LABELS: Record<string, string> = {
    PHASE: "Phase",
    SUBJECT: "Subject",
    SYSTEM: "System",
    TOPIC: "Topic",
    OTHER: "Other",
};

export function PdfUploadForm({ tags, note }: PdfUploadFormProps) {
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);
    const [pending, setPending] = useState(false);
    const [selectedTags, setSelectedTags] = useState<number[]>(
        note?.tags.map((t) => t.tag.id) || []
    );
    const [searchNames, setSearchNames] = useState<string[]>(
        note?.searchNames || []
    );
    const [searchInput, setSearchInput] = useState("");
    const [fileName, setFileName] = useState(note?.fileName || "");

    const tagsByCategory = CATEGORIES.reduce((acc, cat) => {
        acc[cat] = tags.filter((t) => t.category === cat);
        return acc;
    }, {} as Record<string, Tag[]>);

    function toggleTag(tagId: number) {
        setSelectedTags((prev) =>
            prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId]
        );
    }

    function addSearchName() {
        const name = searchInput.trim();
        if (name && !searchNames.includes(name)) {
            setSearchNames([...searchNames, name]);
            setSearchInput("");
        }
    }

    async function handleSubmit(formData: FormData) {
        setPending(true);
        formData.set("searchNames", searchNames.join(","));
        formData.set("tagIds", selectedTags.join(","));

        try {
            const result = note
                ? await updateNote(note.id, formData)
                : await createNote(formData);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(note ? "Note updated!" : "Note created!");
                router.push("/admin/notes");
            }
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setPending(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 max-w-3xl">
            <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                    id="title"
                    name="title"
                    defaultValue={note?.title}
                    placeholder="e.g., Anatomy of the Heart"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    defaultValue={note?.description || ""}
                    placeholder="Brief summary of the content..."
                    rows={3}
                />
            </div>

            <div className="space-y-2">
                <Label>PDF File {!note && "*"}</Label>
                <div
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileRef.current?.click()}
                >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    {fileName ? (
                        <p className="text-sm font-medium">{fileName}</p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Click to upload PDF (max 50MB)
                        </p>
                    )}
                    <input
                        ref={fileRef}
                        type="file"
                        name="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setFileName(f.name);
                        }}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Search Name Suggestions</Label>
                <p className="text-xs text-muted-foreground">
                    Add alternative names to help users find this note via search.
                </p>
                <div className="flex gap-2">
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Type a name and press Enter"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addSearchName();
                            }
                        }}
                    />
                    <Button type="button" variant="outline" onClick={addSearchName}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                {searchNames.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {searchNames.map((name) => (
                            <Badge key={name} variant="secondary" className="gap-1">
                                {name}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearchNames(searchNames.filter((n) => n !== name))
                                    }
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <Label>Tags</Label>
                {CATEGORIES.map((category) => {
                    const catTags = tagsByCategory[category];
                    if (!catTags || catTags.length === 0) return null;
                    return (
                        <Card key={category}>
                            <CardContent className="pt-4">
                                <p className="text-sm font-medium mb-3">
                                    {CATEGORY_LABELS[category]}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {catTags.map((tag) => (
                                        <label
                                            key={tag.id}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <Checkbox
                                                checked={selectedTags.includes(tag.id)}
                                                onCheckedChange={() => toggleTag(tag.id)}
                                            />
                                            <span className="text-sm">{tag.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="flex gap-4">
                <Button type="submit" disabled={pending}>
                    {pending
                        ? "Saving..."
                        : note
                            ? "Update Note"
                            : "Upload Note"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/notes")}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}
