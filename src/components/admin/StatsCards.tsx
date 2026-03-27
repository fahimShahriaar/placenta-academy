import { FileText, BookOpen, Eye, Tags } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    description?: string;
}

export function StatsCard({ title, value, icon: Icon, description }: StatsCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value.toLocaleString()}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}

export function StatsCards({
    stats,
}: {
    stats: {
        totalNotes: number;
        totalBlogs: number;
        totalViews: number;
        totalTags: number;
    };
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Total PDFs" value={stats.totalNotes} icon={FileText} />
            <StatsCard title="Total Blogs" value={stats.totalBlogs} icon={BookOpen} />
            <StatsCard title="Total Views" value={stats.totalViews} icon={Eye} />
            <StatsCard title="Total Tags" value={stats.totalTags} icon={Tags} />
        </div>
    );
}
