import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { NoteDeleteButton } from "@/components/admin/NoteDeleteButton";

export default async function AdminNotesPage() {
    const notes = await prisma.pdfNote.findMany({
        include: { tags: { include: { tag: true } } },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">PDF Notes</h1>
                <Link href="/admin/notes/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Note
                    </Button>
                </Link>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Views</TableHead>
                            <TableHead className="w-32">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {notes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    No notes uploaded yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            notes.map((note) => (
                                <TableRow key={note.id}>
                                    <TableCell className="font-medium max-w-xs truncate">
                                        {note.title}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {note.tags.slice(0, 3).map((nt) => (
                                                <Badge key={nt.tag.id} variant="secondary" className="text-xs">
                                                    {nt.tag.name}
                                                </Badge>
                                            ))}
                                            {note.tags.length > 3 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    +{note.tags.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {note.createdAt.toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">{note.viewCount}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/notes/${note.id}/edit`}>
                                                <Button variant="ghost" size="sm">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <NoteDeleteButton id={note.id} title={note.title} />
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
