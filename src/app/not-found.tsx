import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NotFoundContent } from "@/components/shared/StatusPages";

// Rendered for unmatched URLs, outside the public layout, so it brings its own chrome.
export default function NotFound() {
    return (
        <>
            <Header />
            <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
                <NotFoundContent />
            </main>
            <Footer />
        </>
    );
}
