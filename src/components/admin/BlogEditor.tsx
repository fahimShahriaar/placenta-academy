"use client";

import { useState } from "react";
import { useEditor, useEditorState, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
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
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Code,
    Link as LinkIcon,
    Image as ImageIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Highlighter,
    Minus,
    Table as TableIcon,
    Undo2,
    Redo2,
} from "lucide-react";

interface BlogEditorProps {
    content: string;
    onChange: (html: string) => void;
    labelledBy?: string;
}

function ToolbarButton({
    onClick,
    active,
    disabled,
    children,
    label,
}: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    label: string;
}) {
    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={onClick}
                        disabled={disabled}
                        aria-label={label}
                        aria-pressed={active === undefined ? undefined : active}
                        className={cn(
                            "text-muted-foreground hover:text-foreground",
                            active && "bg-secondary text-secondary-foreground hover:bg-mint-strong hover:text-secondary-foreground"
                        )}
                    />
                }
            >
                {children}
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}

function ToolbarGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div role="group" aria-label={label} className="flex items-center gap-0.5 border-r pr-1.5 mr-1.5 last:mr-0 last:border-r-0 last:pr-0">
            {children}
        </div>
    );
}

type UrlDialogState = { kind: "link" | "image"; url: string; alt: string } | null;

function EditorToolbar({ editor, onRequestUrl }: { editor: Editor; onRequestUrl: (state: UrlDialogState) => void }) {
    // Subscribe to selection/transaction changes so active states stay accurate
    const state = useEditorState({
        editor,
        selector: ({ editor: e }) => ({
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            highlight: e.isActive("highlight"),
            h1: e.isActive("heading", { level: 1 }),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bulletList: e.isActive("bulletList"),
            orderedList: e.isActive("orderedList"),
            blockquote: e.isActive("blockquote"),
            codeBlock: e.isActive("codeBlock"),
            alignLeft: e.isActive({ textAlign: "left" }),
            alignCenter: e.isActive({ textAlign: "center" }),
            alignRight: e.isActive({ textAlign: "right" }),
            link: e.isActive("link"),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
        }),
    });

    const chain = () => editor.chain().focus();

    return (
        <div
            role="toolbar"
            aria-label="Formatting"
            className="sticky top-14 z-10 flex flex-wrap items-center gap-y-1 border-b bg-card/95 px-2 py-1.5 backdrop-blur md:top-0"
        >
            <ToolbarGroup label="History">
                <ToolbarButton label="Undo" onClick={() => chain().undo().run()} disabled={!state.canUndo}>
                    <Undo2 />
                </ToolbarButton>
                <ToolbarButton label="Redo" onClick={() => chain().redo().run()} disabled={!state.canRedo}>
                    <Redo2 />
                </ToolbarButton>
            </ToolbarGroup>
            <ToolbarGroup label="Text style">
                <ToolbarButton label="Bold" onClick={() => chain().toggleBold().run()} active={state.bold}>
                    <Bold />
                </ToolbarButton>
                <ToolbarButton label="Italic" onClick={() => chain().toggleItalic().run()} active={state.italic}>
                    <Italic />
                </ToolbarButton>
                <ToolbarButton label="Underline" onClick={() => chain().toggleUnderline().run()} active={state.underline}>
                    <UnderlineIcon />
                </ToolbarButton>
                <ToolbarButton label="Highlight" onClick={() => chain().toggleHighlight().run()} active={state.highlight}>
                    <Highlighter />
                </ToolbarButton>
            </ToolbarGroup>
            <ToolbarGroup label="Headings">
                <ToolbarButton label="Heading 1" onClick={() => chain().toggleHeading({ level: 1 }).run()} active={state.h1}>
                    <Heading1 />
                </ToolbarButton>
                <ToolbarButton label="Heading 2" onClick={() => chain().toggleHeading({ level: 2 }).run()} active={state.h2}>
                    <Heading2 />
                </ToolbarButton>
                <ToolbarButton label="Heading 3" onClick={() => chain().toggleHeading({ level: 3 }).run()} active={state.h3}>
                    <Heading3 />
                </ToolbarButton>
            </ToolbarGroup>
            <ToolbarGroup label="Blocks">
                <ToolbarButton label="Bullet list" onClick={() => chain().toggleBulletList().run()} active={state.bulletList}>
                    <List />
                </ToolbarButton>
                <ToolbarButton label="Numbered list" onClick={() => chain().toggleOrderedList().run()} active={state.orderedList}>
                    <ListOrdered />
                </ToolbarButton>
                <ToolbarButton label="Quote" onClick={() => chain().toggleBlockquote().run()} active={state.blockquote}>
                    <Quote />
                </ToolbarButton>
                <ToolbarButton label="Code block" onClick={() => chain().toggleCodeBlock().run()} active={state.codeBlock}>
                    <Code />
                </ToolbarButton>
                <ToolbarButton label="Divider" onClick={() => chain().setHorizontalRule().run()}>
                    <Minus />
                </ToolbarButton>
            </ToolbarGroup>
            <ToolbarGroup label="Alignment">
                <ToolbarButton label="Align left" onClick={() => chain().setTextAlign("left").run()} active={state.alignLeft}>
                    <AlignLeft />
                </ToolbarButton>
                <ToolbarButton label="Align center" onClick={() => chain().setTextAlign("center").run()} active={state.alignCenter}>
                    <AlignCenter />
                </ToolbarButton>
                <ToolbarButton label="Align right" onClick={() => chain().setTextAlign("right").run()} active={state.alignRight}>
                    <AlignRight />
                </ToolbarButton>
            </ToolbarGroup>
            <ToolbarGroup label="Insert">
                <ToolbarButton
                    label={state.link ? "Edit link" : "Add link"}
                    active={state.link}
                    onClick={() =>
                        onRequestUrl({ kind: "link", url: (editor.getAttributes("link").href as string) ?? "", alt: "" })
                    }
                >
                    <LinkIcon />
                </ToolbarButton>
                <ToolbarButton label="Insert image" onClick={() => onRequestUrl({ kind: "image", url: "", alt: "" })}>
                    <ImageIcon />
                </ToolbarButton>
                <ToolbarButton
                    label="Insert table"
                    onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                >
                    <TableIcon />
                </ToolbarButton>
            </ToolbarGroup>
        </div>
    );
}

function UrlDialog({
    editor,
    state,
    onClose,
}: {
    editor: Editor;
    state: NonNullable<UrlDialogState>;
    onClose: () => void;
}) {
    const [url, setUrl] = useState(state.url);
    const [alt, setAlt] = useState(state.alt);
    const isLink = state.kind === "link";

    function apply() {
        const value = url.trim();
        if (isLink) {
            if (value) editor.chain().focus().extendMarkRange("link").setLink({ href: value }).run();
            else editor.chain().focus().extendMarkRange("link").unsetLink().run();
        } else if (value) {
            editor.chain().focus().setImage({ src: value, alt: alt.trim() || undefined }).run();
        }
        onClose();
    }

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isLink ? (state.url ? "Edit link" : "Add link") : "Insert image"}</DialogTitle>
                    <DialogDescription>
                        {isLink
                            ? "Links apply to the selected text. Leave the URL empty to remove a link."
                            : "Paste the address of an image that's already online."}
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        apply();
                    }}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="editor-url">{isLink ? "URL" : "Image URL"}</Label>
                        <Input
                            id="editor-url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://"
                            autoFocus
                            required={!isLink}
                        />
                    </div>
                    {!isLink && (
                        <div className="space-y-2">
                            <Label htmlFor="editor-alt">Alt text</Label>
                            <Input
                                id="editor-alt"
                                value={alt}
                                onChange={(e) => setAlt(e.target.value)}
                                placeholder="Describe the image for screen readers"
                            />
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">{isLink ? (url.trim() || !state.url ? "Apply link" : "Remove link") : "Insert image"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function BlogEditor({ content, onChange, labelledBy }: BlogEditorProps) {
    const [urlDialog, setUrlDialog] = useState<UrlDialogState>(null);
    const editor = useEditor({
        // Required under SSR — otherwise Tiptap throws in dev and risks hydration mismatches
        immediatelyRender: false,
        extensions: [
            // StarterKit v3 already bundles Link and Underline
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4] },
                link: { openOnClick: false },
            }),
            Image,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Highlight,
            Table.configure({ resizable: true }),
            TableRow,
            TableCell,
            TableHeader,
            Placeholder.configure({ placeholder: "Start writing your article…" }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class:
                    "prose prose-brand max-w-none min-h-[28rem] px-5 py-6 focus:outline-none sm:px-8 sm:py-8 md:prose-lg",
                ...(labelledBy ? { "aria-labelledby": labelledBy } : { "aria-label": "Article content" }),
                "aria-multiline": "true",
                role: "textbox",
            },
        },
    });

    if (!editor) {
        return (
            <div className="overflow-clip rounded-2xl border bg-card" aria-busy="true">
                <div className="h-[3.25rem] border-b bg-sunken/60" />
                <div className="min-h-[28rem] animate-pulse bg-card" />
            </div>
        );
    }

    return (
        <div className="overflow-clip rounded-2xl border bg-card transition-[border-color,box-shadow] focus-within:border-ring/60 focus-within:ring-3 focus-within:ring-ring/15">
            <EditorToolbar editor={editor} onRequestUrl={setUrlDialog} />
            <EditorContent editor={editor} />
            {urlDialog && <UrlDialog editor={editor} state={urlDialog} onClose={() => setUrlDialog(null)} />}
        </div>
    );
}
