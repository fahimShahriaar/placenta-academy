import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { isAdmin } from "@/lib/auth";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    if (!(await isAdmin())) redirect("/admin/login");

    return (
        <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="flex-1 overflow-auto">
                <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
            </main>
        </div>
    );
}
