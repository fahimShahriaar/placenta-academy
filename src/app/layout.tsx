import type { Metadata, Viewport } from "next";
import {
    Geist,
    Geist_Mono,
    Newsreader,
    Noto_Sans_Bengali,
    Noto_Serif_Bengali,
} from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// Display serif for page and section headings
const newsreader = Newsreader({
    variable: "--font-newsreader",
    subsets: ["latin"],
    axes: ["opsz"],
});

// Bengali fallbacks: only fetched when Bengali glyphs are rendered
const bengaliSans = Noto_Sans_Bengali({
    variable: "--font-bengali-sans",
    subsets: ["bengali"],
    preload: false,
    adjustFontFallback: false,
});

const bengaliSerif = Noto_Serif_Bengali({
    variable: "--font-bengali-serif",
    subsets: ["bengali"],
    preload: false,
    adjustFontFallback: false,
});

export const metadata: Metadata = {
    title: {
        default: "Placenta Academy — Medical Education Platform",
        template: "%s | Placenta Academy",
    },
    description:
        "Access curated medical education notes and blogs. Browse by subject, phase, system, and topic.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    openGraph: {
        type: "website",
        siteName: "Placenta Academy",
        images: ["/api/og?title=Placenta+Academy"],
    },
    twitter: {
        card: "summary_large_image",
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#f7f8f4" },
        { media: "(prefers-color-scheme: dark)", color: "#0c1a20" },
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            data-scroll-behavior="smooth"
            className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} ${bengaliSans.variable} ${bengaliSerif.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <TooltipProvider delay={250}>
                        {children}
                        <Toaster />
                    </TooltipProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
