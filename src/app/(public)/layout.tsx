import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NavigationProgress } from "@/components/layout/NavigationProgress";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Suspense>
                <NavigationProgress />
            </Suspense>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </>
    );
}
