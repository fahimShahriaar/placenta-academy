"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { createBlog, updateBlog } from "@/actions/blogs";

interface Tag {
    id: string;
    name: string;
    slug: string;
}

interface BlogData {
    id: string;
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
}

export function BlogForm({ tags, blog }: BlogFormProps) {
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);
    const [pending, setPending] = useState(false);
    const [content, setContent] = useState(blog?.content || "");
    const [published, setPublished] = useState(blog?.published || false);
    const [selectedTags, setSelectedTags] = useState<string[]>(
        blog?.tags.map((t) => t.tag.id) || []
    );
    const [coverName, setCoverName] = useState("");

    function toggleTag(tagId: string) {
        setSelectedTags((prev) =>
            prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId]
        );
    }

    async function handleSubmit(formData: FormData) {
        if (!content.trim()) {
            toast.error("Blog content is required.");
            return;
        }

        setPending(true);
        formData.set("content", content);
        formData.set("published", published.toString());
        formData.set("tagIds", selectedTags.join(","));

        try {
            const result = blog
                ? await updateBlog(blog.id, formData)
                : await createBlog(formData);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(blog ? "Blog updated!" : "Blog created!");
                router.push("/admin/blogs");
            }
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setPending(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 max-w-4xl">
            <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                    id="title"
                    name="title"
                    defaultValue={blog?.title}
                    placeholder="Blog post title"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                    id="excerpt"
                    name="excerpt"
                    defaultValue={blog?.excerpt || ""}
                    placeholder="Brief summary (auto-generated if empty)"
                    rows={2}
                />
            </div>

            <div className="space-y-2">
                <Label>Cover Image</Label>
                <div
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileRef.current?.click()}
                >
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                    {coverName ? (
                        <p className="text-sm">{coverName}</p>
                    ) : blog?.coverImage ? (
                        <p className="text-sm text-muted-foreground">
                            Current: {blog.coverImage.split("/").pop()} — click to replace
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Click to upload (JPG, PNG, WebP — max 5MB)
                        </p>
                    )}
                    <input
                        ref={fileRef}
                        type="file"
                        name="coverImage"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setCoverName(f.name);
                        }}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Content *</Label>
                <BlogEditor content={content} onChange={setContent} />
            </div>

            <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-4">
                    {tags.map((tag) => (
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
            </div>

            <div className="flex items-center gap-3">
                <Switch checked={published} onCheckedChange={setPublished} />
                <Label>{published ? "Published" : "Draft"}</Label>
            </div>

            <div className="flex gap-4">
                <Button type="submit" disabled={pending}>
                    {pending ? "Saving..." : blog ? "Update Post" : "Create Post"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/blogs")}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}
