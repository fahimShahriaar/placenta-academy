import { redirect } from "next/navigation";
import { AdminMobileHeader, AdminSidebar } from "@/components/admin/Sidebar";
import { isAdmin } from "@/lib/auth";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    if (!(await isAdmin())) redirect("/admin/login");

    return (
        <div className="flex min-h-dvh w-full">
            <AdminSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <AdminMobileHeader />
                <main id="main-content" className="flex-1 px-4 pt-6 pb-12 sm:px-6 md:px-8 md:pt-8 lg:px-10">
                    <div className="mx-auto max-w-6xl">{children}</div>
                </main>
            </div>
        </div>
    );
}
