import { FileText, Newspaper, Eye, Tags } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    description?: string;
    className?: string;
}

export function StatsCard({ title, value, icon: Icon, description, className }: StatsCardProps) {
    return (
        <div className={cn("flex flex-col gap-3 p-5", className)}>
            <dt className="flex items-center justify-between gap-2 text-sm font-medium text-muted-foreground">
                {title}
                <Icon className="size-4" aria-hidden="true" />
            </dt>
            <dd className="font-display text-[2rem] leading-none font-semibold tracking-tight tabular-nums">
                {value.toLocaleString("en-US")}
            </dd>
            {description && <dd className="text-meta text-muted-foreground">{description}</dd>}
        </div>
    );
}

export function StatsCards({
    stats,
}: {
    stats: {
        totalNotes: number;
        totalBlogs: number;
        publishedBlogs: number;
        totalViews: number;
        totalPdfTags: number;
        totalBlogTags: number;
    };
}) {
    const drafts = stats.totalBlogs - stats.publishedBlogs;
    return (
        <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border bg-card lg:grid-cols-4 [&>div]:border-border [&>div:nth-child(even)]:border-l [&>div:nth-child(n+3)]:border-t lg:[&>div:nth-child(n+2)]:border-l lg:[&>div:nth-child(n+3)]:border-t-0">
            <StatsCard title="PDF notes" value={stats.totalNotes} icon={FileText} description="In the public library" />
            <StatsCard
                title="Articles"
                value={stats.totalBlogs}
                icon={Newspaper}
                description={`${stats.publishedBlogs} published · ${drafts} ${drafts === 1 ? "draft" : "drafts"}`}
            />
            <StatsCard title="Total views" value={stats.totalViews} icon={Eye} description="Notes and articles combined" />
            <StatsCard
                title="Tags"
                value={stats.totalPdfTags + stats.totalBlogTags}
                icon={Tags}
                description={`${stats.totalPdfTags} note · ${stats.totalBlogTags} article`}
            />
        </dl>
    );
}
