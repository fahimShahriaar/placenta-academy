"use client";

import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Maximize,
    Download,
} from "lucide-react";

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
    filePath: string;
    fileName: string;
}

export function PdfViewer({ filePath, fileName }: PdfViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [pageInput, setPageInput] = useState("1");

    const fileUrl = `/api/uploads/${filePath}`;

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    function goToPage(page: number) {
        const p = Math.max(1, Math.min(page, numPages));
        setPageNumber(p);
        setPageInput(p.toString());
    }

    function handlePageInput(e: React.KeyboardEvent) {
        if (e.key === "Enter") {
            const num = parseInt(pageInput);
            if (!isNaN(num)) goToPage(num);
        }
    }

    const toggleFullscreen = useCallback(() => {
        const el = document.getElementById("pdf-container");
        if (!el) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            el.requestFullscreen();
        }
    }, []);

    return (
        <div id="pdf-container" className="border rounded-lg overflow-hidden bg-muted/30">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2 p-3 border-b bg-card flex-wrap">
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => goToPage(pageNumber - 1)}
                        disabled={pageNumber <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1 text-sm">
                        <Input
                            value={pageInput}
                            onChange={(e) => setPageInput(e.target.value)}
                            onKeyDown={handlePageInput}
                            className="w-14 h-8 text-center text-xs"
                        />
                        <span className="text-muted-foreground">/ {numPages}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => goToPage(pageNumber + 1)}
                        disabled={pageNumber >= numPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground w-12 text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setScale((s) => Math.min(3, s + 0.25))}
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={toggleFullscreen}
                    >
                        <Maximize className="h-4 w-4" />
                    </Button>
                    <a href={`${fileUrl}?download=1`} download={fileName}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                        </Button>
                    </a>
                </div>
            </div>

            {/* Document */}
            <div className="overflow-auto max-h-[80vh] flex justify-center p-4 bg-muted/50">
                <Document
                    file={fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="flex items-center justify-center h-96">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                        </div>
                    }
                    error={
                        <div className="flex items-center justify-center h-96 text-muted-foreground">
                            Failed to load PDF. Please try again.
                        </div>
                    }
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        className="shadow-lg"
                        loading={
                            <div className="h-96 w-full animate-pulse bg-muted rounded" />
                        }
                    />
                </Document>
            </div>
        </div>
    );
}
