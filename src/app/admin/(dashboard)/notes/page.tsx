import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ExternalLink, FilePlus2, FileText, Pencil } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NoteDeleteButton } from "@/components/admin/NoteDeleteButton";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate, formatFileSize, pluralize } from "@/lib/format";
import { summarizeNoteTags } from "@/lib/taxonomy";

export default async function AdminNotesPage() {
    const notes = await prisma.pdfNote.findMany({
        include: { tags: { include: { tag: true } } },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div>
            <AdminPageHeader
                title="PDF notes"
                description={`${pluralize(notes.length, "note")} in the library.`}
                actions={
                    <Link href="/admin/notes/new" className={buttonVariants()}>
                        <FilePlus2 data-icon="inline-start" />
                        Upload note
                    </Link>
                }
            />

            {notes.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No notes uploaded yet"
                    description="Upload a PDF, give it a title, and tag it so students can find it in the library."
                >
                    <Link href="/admin/notes/new" className={buttonVariants()}>
                        <FilePlus2 data-icon="inline-start" />
                        Upload note
                    </Link>
                </EmptyState>
            ) : (
                <AdminPanel>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Note</TableHead>
                                <TableHead className="hidden lg:table-cell">Classification</TableHead>
                                <TableHead className="hidden md:table-cell">Added</TableHead>
                                <TableHead className="hidden text-right sm:table-cell">Views</TableHead>
                                <TableHead className="text-right">
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {notes.map((note) => {
                                const { subject, phase, rest } = summarizeNoteTags(note.tags.map((t) => t.tag));
                                const classification = [subject?.name, phase?.name].filter(Boolean).join(" · ");
                                return (
                                    <TableRow key={note.id}>
                                        <TableCell className="w-full max-w-0">
                                            <Link
                                                href={`/admin/notes/${note.id}/edit`}
                                                className="block truncate font-medium text-foreground underline-offset-4 hover:underline"
                                            >
                                                {note.title}
                                            </Link>
                                            <p className="mt-0.5 truncate text-meta text-muted-foreground">
                                                {note.fileName} · {formatFileSize(note.fileSize)}
                                            </p>
                                            <p className="mt-0.5 truncate text-meta text-muted-foreground md:hidden">
                                                {formatDate(note.createdAt)} · {pluralize(note.viewCount, "view")}
                                                {classification && ` · ${classification}`}
                                            </p>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {classification ? (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm whitespace-nowrap text-foreground">{classification}</span>
                                                    {rest.length > 0 && (
                                                        <span className="text-meta whitespace-nowrap text-muted-foreground">
                                                            +{pluralize(rest.length, "more tag")}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    {rest.length > 0 ? pluralize(rest.length, "tag") : "Untagged"}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden whitespace-nowrap text-muted-foreground md:table-cell">
                                            {formatDate(note.createdAt)}
                                        </TableCell>
                                        <TableCell className="hidden text-right tabular-nums sm:table-cell">
                                            {note.viewCount.toLocaleString("en-US")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/admin/notes/${note.id}/edit`}
                                                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                                                    aria-label={`Edit “${note.title}”`}
                                                >
                                                    <Pencil />
                                                    <span className="hidden sm:inline">Edit</span>
                                                </Link>
                                                <Tooltip>
                                                    <TooltipTrigger
                                                        render={
                                                            <a
                                                                href={`/notes/${note.slug}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                aria-label={`View “${note.title}” on the website (opens in a new tab)`}
                                                                className={buttonVariants({ variant: "quiet", size: "icon-sm" })}
                                                            />
                                                        }
                                                    >
                                                        <ExternalLink />
                                                    </TooltipTrigger>
                                                    <TooltipContent>View on website</TooltipContent>
                                                </Tooltip>
                                                <NoteDeleteButton id={note.id} title={note.title} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </AdminPanel>
            )}
        </div>
    );
}
