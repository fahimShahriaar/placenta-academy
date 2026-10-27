import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { EmptyState } from "@/components/shared/EmptyState";

export default function AdminNotFound() {
    return (
        <EmptyState
            icon={FileQuestion}
            title="We couldn't find that item"
            description="It may have been deleted, or the link is out of date."
            className="mt-6"
        >
            <Link href="/admin/notes" className={buttonVariants({ variant: "outline" })}>
                PDF notes
            </Link>
            <Link href="/admin/blogs" className={buttonVariants({ variant: "outline" })}>
                Articles
            </Link>
        </EmptyState>
    );
}
