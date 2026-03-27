import Link from "next/link";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BlogCardProps {
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    createdAt: Date;
    tags: {
        tag: {
            id: string;
            name: string;
            slug: string;
        };
    }[];
}

export function BlogCard({
    title,
    slug,
    excerpt,
    coverImage,
    createdAt,
    tags,
}: BlogCardProps) {
    return (
        <Link href={`/blog/${slug}`}>
            <Card className="group h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                    {coverImage ? (
                        <img
                            src={`/api/uploads/${coverImage}`}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl font-bold text-primary/20">PA</span>
                        </div>
                    )}
                </div>
                <CardContent className="p-5 space-y-3">
                    <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {title}
                    </h3>
                    {excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {excerpt}
                        </p>
                    )}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {tags.map((bt) => (
                                <Badge key={bt.tag.id} variant="secondary" className="text-xs">
                                    {bt.tag.name}
                                </Badge>
                            ))}
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
