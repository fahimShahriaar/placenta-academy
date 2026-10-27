"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, LoaderCircle, Plus, RefreshCw, TriangleAlert, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError, FormSection, TagToggle } from "@/components/admin/FormSection";
import { createNote, updateNote } from "@/actions/notes";
import { formatFileSize, pluralize } from "@/lib/format";
import { CATEGORY_ORDER, CATEGORY_PLURALS, compareTagNames } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

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
    fileSize: number;
    searchNames: string[];
    tags: { tag: Tag }[];
}

interface PdfUploadFormProps {
    tags: Tag[];
    note?: NoteData;
    maxFileSize: number;
}

function isPdf(file: File) {
    return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function PdfUploadForm({ tags, note, maxFileSize }: PdfUploadFormProps) {
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);
    const [pending, setPending] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<number[]>(
        note?.tags.map((t) => t.tag.id) || []
    );
    const [searchNames, setSearchNames] = useState<string[]>(
        note?.searchNames || []
    );
    const [searchInput, setSearchInput] = useState("");
    const [file, setFile] = useState<{ name: string; size: number } | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);

    const tagsByCategory = CATEGORY_ORDER.map((category) => ({
        category,
        tags: tags.filter((t) => t.category === category).sort(compareTagNames),
    }));

    function toggleTag(tagId: number) {
        setSelectedTags((prev) =>
            prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId]
        );
    }

    function addSearchName() {
        // Commas separate aliases when they're submitted, so split on them here too
        const names = searchInput
            .split(",")
            .map((n) => n.trim())
            .filter((n) => n && !searchNames.includes(n));
        if (names.length > 0) setSearchNames([...searchNames, ...new Set(names)]);
        setSearchInput("");
    }

    function acceptFile(candidate: File | undefined, fromDrop = false) {
        const input = fileRef.current;
        if (!candidate || !input) return;
        if (!isPdf(candidate)) {
            setFileError(`“${candidate.name}” isn't a PDF. Choose a .pdf file.`);
            if (!fromDrop) input.value = "";
            return;
        }
        if (candidate.size > maxFileSize) {
            setFileError(`That file is ${formatFileSize(candidate.size)}. The limit is ${formatFileSize(maxFileSize)}.`);
            if (!fromDrop) input.value = "";
            return;
        }
        if (fromDrop) {
            const transfer = new DataTransfer();
            transfer.items.add(candidate);
            input.files = transfer.files;
        }
        setFileError(null);
        setFile({ name: candidate.name, size: candidate.size });
    }

    function clearFile() {
        if (fileRef.current) fileRef.current.value = "";
        setFile(null);
        setFileError(null);
    }

    async function handleSubmit(formData: FormData) {
        if (!note && !file) {
            setFileError("Choose a PDF to upload.");
            return;
        }
        setPending(true);
        setFormError(null);
        formData.set("searchNames", searchNames.join(","));
        formData.set("tagIds", selectedTags.join(","));

        try {
            const result = note
                ? await updateNote(note.id, formData)
                : await createNote(formData);

            if (result.error) {
                setFormError(result.error);
                toast.error(result.error);
            } else {
                toast.success(note ? "Note updated." : "Note uploaded.");
                router.push("/admin/notes");
            }
        } catch {
            setFormError("Something went wrong while saving. Please try again.");
            toast.error("Something went wrong.");
        } finally {
            setPending(false);
        }
    }

    const fileDetails = file ?? (note ? { name: note.fileName, size: note.fileSize } : null);

    return (
        <form action={handleSubmit}>
            {formError && (
                <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm text-destructive">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <p>{formError}</p>
                </div>
            )}

            <div className="rounded-2xl border bg-card px-5 py-8 sm:px-8">
                <FormSection id="section-details" title="Details" description="What students see in the library and on the note's page.">
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Title <span className="text-destructive" aria-hidden="true">*</span>
                        </Label>
                        <Input
                            id="title"
                            name="title"
                            defaultValue={note?.title}
                            placeholder="e.g. Anatomy of the heart"
                            required
                            maxLength={255}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={note?.description || ""}
                            placeholder="A sentence or two on what the note covers"
                            rows={3}
                            maxLength={1000}
                            aria-describedby="description-hint"
                        />
                        <p id="description-hint" className="text-meta text-muted-foreground">
                            Shown on note cards and searched by the library. Up to 1,000 characters.
                        </p>
                    </div>
                </FormSection>

                <FormSection
                    id="section-file"
                    title="File"
                    description={note ? "Replace the PDF only if you have an updated version." : "The PDF students will read and download."}
                >
                    <input
                        ref={fileRef}
                        id="file"
                        type="file"
                        name="file"
                        accept="application/pdf,.pdf"
                        className="sr-only"
                        tabIndex={-1}
                        aria-describedby="file-hint file-error"
                        onChange={(e) => acceptFile(e.target.files?.[0])}
                    />
                    <div
                        onDragEnter={(e) => {
                            e.preventDefault();
                            setDragging(true);
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDragLeave={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragging(false);
                            acceptFile(e.dataTransfer.files?.[0], true);
                        }}
                        className={cn(
                            "rounded-xl border-2 border-dashed p-5 transition-colors duration-150",
                            dragging ? "border-primary bg-secondary" : fileError ? "border-destructive/60 bg-destructive-soft/40" : "border-border-strong bg-sunken/60"
                        )}
                    >
                        {fileDetails ? (
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary-ink">
                                    <FileText className="size-6" aria-hidden="true" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium" title={fileDetails.name}>
                                        {fileDetails.name}
                                    </p>
                                    <p className="text-meta text-muted-foreground">
                                        {formatFileSize(fileDetails.size)} ·{" "}
                                        {file ? (note ? "Will replace the current file when you save" : "Ready to upload") : "Current file"}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                                        <RefreshCw data-icon="inline-start" />
                                        {file ? "Choose another" : "Replace file"}
                                    </Button>
                                    {file && (
                                        <Button type="button" variant="quiet" size="sm" onClick={clearFile}>
                                            <X data-icon="inline-start" />
                                            {note ? "Keep current" : "Remove"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-6 text-center">
                                <span className="flex size-12 items-center justify-center rounded-full bg-card text-primary-ink shadow-xs">
                                    <Upload className="size-5" aria-hidden="true" />
                                </span>
                                <p className="mt-3 font-medium">Drag a PDF here, or choose one</p>
                                <Button type="button" variant="outline" className="mt-4" onClick={() => fileRef.current?.click()}>
                                    Choose PDF
                                </Button>
                            </div>
                        )}
                    </div>
                    <p id="file-hint" className="text-meta text-muted-foreground">
                        PDF only, up to {formatFileSize(maxFileSize)}.
                    </p>
                    <FieldError id="file-error">{fileError}</FieldError>
                </FormSection>

                <FormSection
                    id="section-aliases"
                    title="Search aliases"
                    description="Extra words that should find this note, such as abbreviations or alternate spellings. Each alias is matched against whole search words."
                >
                    <div className="space-y-2">
                        <Label htmlFor="alias-input">Add an alias</Label>
                        <div className="flex gap-2">
                            <Input
                                id="alias-input"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="e.g. CVS"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addSearchName();
                                    }
                                }}
                            />
                            <Button type="button" variant="outline" className="h-11 shrink-0" onClick={addSearchName} disabled={!searchInput.trim()}>
                                <Plus data-icon="inline-start" />
                                Add
                            </Button>
                        </div>
                    </div>
                    {searchNames.length > 0 ? (
                        <ul className="flex flex-wrap gap-2" aria-label="Search aliases">
                            {searchNames.map((name) => (
                                <li key={name} className="inline-flex h-8 max-w-full items-center gap-1 rounded-full bg-muted pr-1 pl-3 text-sm">
                                    <span className="truncate">{name}</span>
                                    <button
                                        type="button"
                                        onClick={() => setSearchNames(searchNames.filter((n) => n !== name))}
                                        className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                                        aria-label={`Remove alias ${name}`}
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No aliases yet.</p>
                    )}
                </FormSection>

                <FormSection
                    id="section-classification"
                    title="Classification"
                    description={
                        <>
                            Tags place the note in the library filters.{" "}
                            <span className="font-medium text-foreground">{pluralize(selectedTags.length, "tag")} selected.</span>
                        </>
                    }
                >
                    {tagsByCategory.map(({ category, tags: catTags }) => {
                        const selectedCount = catTags.filter((t) => selectedTags.includes(t.id)).length;
                        return (
                            <div key={category} role="group" aria-labelledby={`tags-${category}`}>
                                <div className="mb-2.5 flex items-center gap-2">
                                    <h3 id={`tags-${category}`} className="text-sm font-medium">
                                        {CATEGORY_PLURALS[category]}
                                    </h3>
                                    {selectedCount > 0 && (
                                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                                            {selectedCount} selected
                                        </span>
                                    )}
                                </div>
                                {catTags.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {catTags.map((tag) => (
                                            <TagToggle key={tag.id} selected={selectedTags.includes(tag.id)} onToggle={() => toggleTag(tag.id)}>
                                                {tag.name}
                                            </TagToggle>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No {CATEGORY_PLURALS[category].toLowerCase()} yet.{" "}
                                        <Link href="/admin/tags/pdf-tags" className="font-medium text-primary-ink underline-offset-4 hover:underline">
                                            Manage note tags
                                        </Link>
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </FormSection>
            </div>

            <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t bg-background/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10">
                <div className="flex items-center justify-end gap-2">
                    <Link href="/admin/notes" className={buttonVariants({ variant: "outline" })} aria-disabled={pending}>
                        Cancel
                    </Link>
                    <Button type="submit" disabled={pending} className="min-w-32">
                        {pending && <LoaderCircle className="animate-spin" data-icon="inline-start" />}
                        {pending ? (file ? "Uploading…" : "Saving…") : note ? "Save changes" : "Upload note"}
                    </Button>
                </div>
            </div>
        </form>
    );
}
