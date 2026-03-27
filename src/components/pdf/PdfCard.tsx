import Link from "next/link";
import { FileText, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TagBadge } from "@/components/shared/TagBadge";

interface PdfCardProps {
    title: string;
    slug: string;
    description: string | null;
    createdAt: Date;
    tags: {
        tag: {
            id: string;
            name: string;
            slug: string;
            category: string;
        };
    }[];
}

export function PdfCard({ title, slug, description, createdAt, tags }: PdfCardProps) {
    return (
        <Link href={`/notes/${slug}`}>
            <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-5 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-red-500/10 rounded-lg shrink-0">
                            <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                {title}
                            </h3>
                            {description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {tags.slice(0, 4).map((nt) => (
                                <TagBadge
                                    key={nt.tag.id}
                                    name={nt.tag.name}
                                    category={nt.tag.category}
                                />
                            ))}
                            {tags.length > 4 && (
                                <span className="text-xs text-muted-foreground">
                                    +{tags.length - 4}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {createdAt.toLocaleDateString()}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
