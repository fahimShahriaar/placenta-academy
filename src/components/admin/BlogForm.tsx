"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus, LoaderCircle, RefreshCw, TriangleAlert, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { FieldError, TagToggle } from "@/components/admin/FormSection";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { createBlog, updateBlog } from "@/actions/blogs";
import { formatFileSize } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Tag {
    id: number;
    name: string;
    slug: string;
}

interface BlogData {
    id: number;
    title: string;
    content: string;
    excerpt: string | null;
    coverImage: string | null;
    published: boolean;
    tags: { tag: Tag }[];
}

interface BlogFormProps {
    tags: Tag[];
    blog?: BlogData;
    maxImageSize: number;
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const EXCERPT_LIMIT = 500;

function SidePanel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <section className={cn("rounded-2xl border bg-card p-5", className)}>
            <h2 className="mb-3 text-sm font-semibold">{title}</h2>
            {children}
        </section>
    );
}

export function BlogForm({ tags, blog, maxImageSize }: BlogFormProps) {
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);
    const [pending, setPending] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [content, setContent] = useState(blog?.content || "");
    const [contentError, setContentError] = useState<string | null>(null);
    const [published, setPublished] = useState(blog?.published || false);
    const [selectedTags, setSelectedTags] = useState<number[]>(
        blog?.tags.map((t) => t.tag.id) || []
    );
    const [excerpt, setExcerpt] = useState(blog?.excerpt || "");
    const [cover, setCover] = useState<{ name: string; size: number; url: string } | null>(null);
    const [coverError, setCoverError] = useState<string | null>(null);

    // Release object URLs for replaced or abandoned previews
    useEffect(() => {
        return () => {
            if (cover) URL.revokeObjectURL(cover.url);
        };
    }, [cover]);

    function toggleTag(tagId: number) {
        setSelectedTags((prev) =>
            prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId]
        );
    }

    function chooseCover(file: File | undefined) {
        if (!file) return;
        if (!IMAGE_TYPES.includes(file.type)) {
            setCoverError("Use a JPG, PNG, or WebP image.");
            if (fileRef.current) fileRef.current.value = "";
            return;
        }
        if (file.size > maxImageSize) {
            setCoverError(`That image is ${formatFileSize(file.size)}. The limit is ${formatFileSize(maxImageSize)}.`);
            if (fileRef.current) fileRef.current.value = "";
            return;
        }
        setCoverError(null);
        setCover({ name: file.name, size: file.size, url: URL.createObjectURL(file) });
    }

    function clearCover() {
        if (fileRef.current) fileRef.current.value = "";
        setCover(null);
        setCoverError(null);
    }

    async function handleSubmit(formData: FormData) {
        const text = content.replace(/<[^>]*>/g, "").trim();
        if (!text && !/<(img|table|hr)/.test(content)) {
            setContentError("Write something before saving — the article body can't be empty.");
            toast.error("Article content is required.");
            return;
        }

        setPending(true);
        setFormError(null);
        setContentError(null);
        formData.set("content", content);
        formData.set("published", published.toString());
        formData.set("tagIds", selectedTags.join(","));

        try {
            const result = blog
                ? await updateBlog(blog.id, formData)
                : await createBlog(formData);

            if (result.error) {
                setFormError(result.error);
                toast.error(result.error);
            } else {
                toast.success(
                    blog
                        ? published && !blog.published
                            ? "Article published."
                            : "Changes saved."
                        : published
                          ? "Article published."
                          : "Draft saved."
                );
                router.push("/admin/blogs");
            }
        } catch {
            setFormError("Something went wrong while saving. Please try again.");
            toast.error("Something went wrong.");
        } finally {
            setPending(false);
        }
    }

    const submitLabel = blog
        ? published && !blog.published
            ? "Publish article"
            : "Save changes"
        : published
          ? "Publish article"
          : "Save draft";

    const existingCover = blog?.coverImage ? `/api/uploads/${blog.coverImage}` : null;
    const previewSrc = cover?.url ?? existingCover;

    const actions = (
        <>
            <Link href="/admin/blogs" className={buttonVariants({ variant: "outline" })} aria-disabled={pending}>
                Cancel
            </Link>
            <Button type="submit" disabled={pending} className="flex-1 xl:flex-none">
                {pending && <LoaderCircle className="animate-spin" data-icon="inline-start" />}
                {pending ? "Saving…" : submitLabel}
            </Button>
        </>
    );

    return (
        <form action={handleSubmit} className="xl:grid xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-8">
            <div className="min-w-0 space-y-5">
                {formError && (
                    <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm text-destructive">
                        <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                        <p>{formError}</p>
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-muted-foreground">
                        Title <span className="text-destructive" aria-hidden="true">*</span>
                    </Label>
                    <textarea
                        id="title"
                        name="title"
                        defaultValue={blog?.title}
                        placeholder="Article title"
                        required
                        maxLength={255}
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") e.preventDefault();
                        }}
                        className="field-sizing-content block w-full resize-none rounded-xl border border-transparent bg-transparent px-0 py-1 font-display text-[1.875rem] leading-tight font-semibold tracking-[-0.015em] text-foreground outline-none placeholder:text-muted-foreground/60 hover:border-transparent focus-visible:border-transparent sm:text-[2.25rem]"
                    />
                </div>
                <div className="space-y-2">
                    <p id="content-label" className="text-sm font-medium text-muted-foreground">
                        Content <span className="text-destructive" aria-hidden="true">*</span>
                    </p>
                    <BlogEditor
                        content={content}
                        onChange={(html) => {
                            setContent(html);
                            if (contentError) setContentError(null);
                        }}
                        labelledBy="content-label"
                    />
                    <FieldError id="content-error">{contentError}</FieldError>
                </div>
            </div>

            <aside className="mt-8 space-y-4 xl:sticky xl:top-8 xl:mt-0 xl:self-start" aria-label="Article settings">
                <SidePanel title="Publishing">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <StatusBadge published={published} />
                            <p className="mt-2 text-meta text-muted-foreground" id="publish-hint">
                                {published
                                    ? "Visible on the public blog once saved."
                                    : "Drafts are only visible here in the admin."}
                            </p>
                        </div>
                        <Switch
                            checked={published}
                            onCheckedChange={setPublished}
                            aria-label="Published"
                            aria-describedby="publish-hint"
                        />
                    </div>
                    <div className="mt-5 hidden gap-2 border-t pt-4 xl:flex">{actions}</div>
                </SidePanel>

                <SidePanel title="Cover image">
                    <input
                        ref={fileRef}
                        type="file"
                        name="coverImage"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        tabIndex={-1}
                        aria-describedby="cover-hint cover-error"
                        onChange={(e) => chooseCover(e.target.files?.[0])}
                    />
                    {previewSrc ? (
                        <div className="relative aspect-[16/9] overflow-hidden rounded-xl border bg-muted">
                            <Image src={previewSrc} alt="Cover preview" fill sizes="320px" className="object-cover" />
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-strong bg-sunken/60 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                        >
                            <ImagePlus className="size-5" aria-hidden="true" />
                            Choose a cover image
                        </button>
                    )}
                    {cover && (
                        <p className="mt-2 truncate text-meta text-muted-foreground" title={cover.name}>
                            {cover.name} · {formatFileSize(cover.size)}
                            {existingCover && " · replaces the current cover when saved"}
                        </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                        {previewSrc && (
                            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                                <RefreshCw data-icon="inline-start" />
                                {cover ? "Choose another" : "Replace"}
                            </Button>
                        )}
                        {cover && (
                            <Button type="button" variant="quiet" size="sm" onClick={clearCover}>
                                <X data-icon="inline-start" />
                                {existingCover ? "Keep current" : "Remove"}
                            </Button>
                        )}
                    </div>
                    <p id="cover-hint" className="mt-2 text-meta text-muted-foreground">
                        JPG, PNG, or WebP, up to {formatFileSize(maxImageSize)}. Without one, the blog shows a typographic cover.
                    </p>
                    <div className="mt-2">
                        <FieldError id="cover-error">{coverError}</FieldError>
                    </div>
                </SidePanel>

                <SidePanel title="Excerpt">
                    <Label htmlFor="excerpt" className="sr-only">
                        Excerpt
                    </Label>
                    <Textarea
                        id="excerpt"
                        name="excerpt"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="A one- or two-sentence summary"
                        rows={3}
                        maxLength={EXCERPT_LIMIT}
                        aria-describedby="excerpt-hint"
                    />
                    <p id="excerpt-hint" className="mt-2 flex justify-between gap-3 text-meta text-muted-foreground">
                        <span>Shown on article cards. Leave blank to use the opening lines.</span>
                        <span className="shrink-0 tabular-nums">
                            {excerpt.length}/{EXCERPT_LIMIT}
                        </span>
                    </p>
                </SidePanel>

                <SidePanel title="Topics">
                    {tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2" role="group" aria-label="Topics">
                            {tags.map((tag) => (
                                <TagToggle key={tag.id} selected={selectedTags.includes(tag.id)} onToggle={() => toggleTag(tag.id)}>
                                    {tag.name}
                                </TagToggle>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No article tags yet.{" "}
                            <Link href="/admin/tags/blog-tags" className="font-medium text-primary-ink underline-offset-4 hover:underline">
                                Create tags
                            </Link>
                        </p>
                    )}
                </SidePanel>
            </aside>

            {/* Save/publish stay reachable while scrolling a long article on smaller screens */}
            <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t bg-background/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 xl:hidden">
                <div className="flex items-center justify-end gap-2">{actions}</div>
            </div>
        </form>
    );
}
