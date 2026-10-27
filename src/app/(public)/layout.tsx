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
            <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
                {children}
            </main>
            <Footer />
        </>
    );
}
