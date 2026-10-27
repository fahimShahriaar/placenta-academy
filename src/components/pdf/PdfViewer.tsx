"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
    ChevronLeft,
    ChevronRight,
    Download,
    FileWarning,
    Maximize,
    Minimize,
    RotateCcw,
    ZoomIn,
    ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
// Fit-to-width, capped so text stays a comfortable size on very wide screens
const MAX_FIT_WIDTH = 1000;
const A4_RATIO = 1.414;

interface PdfViewerProps {
    filePath: string;
    fileName: string;
}

function ToolButton({
    label,
    onClick,
    disabled,
    children,
    className,
}: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        variant="quiet"
                        size="icon"
                        onClick={onClick}
                        disabled={disabled}
                        aria-label={label}
                        className={cn("text-foreground", className)}
                    />
                }
            >
                {children}
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}

function PagePlaceholder({ width, ratio, label }: { width: number; ratio: number; label?: string }) {
    return (
        <div
            className="flex max-w-full animate-pulse items-center justify-center rounded-sm bg-white/70 shadow-sm dark:bg-white/10"
            style={{ width, height: Math.round(width * ratio) }}
        >
            {label && <span className="text-sm text-muted-foreground">{label}</span>}
        </div>
    );
}

export function PdfViewer({ filePath, fileName }: PdfViewerProps) {
    const workspaceRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageInput, setPageInput] = useState("1");
    const [zoom, setZoom] = useState(1);
    const [canvasWidth, setCanvasWidth] = useState(0);
    const [pageRatio, setPageRatio] = useState(A4_RATIO);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [canFullscreen, setCanFullscreen] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [attempt, setAttempt] = useState(0);

    const fileUrl = `/api/uploads/${filePath}`;
    const downloadUrl = `${fileUrl}?download=1`;

    useEffect(() => {
        const el = canvasRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            setCanvasWidth(Math.floor(entry.contentRect.width));
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const sync = () => setIsFullscreen(document.fullscreenElement === workspaceRef.current);
        const check = setTimeout(() => setCanFullscreen(Boolean(document.fullscreenEnabled)), 0);
        document.addEventListener("fullscreenchange", sync);
        return () => {
            clearTimeout(check);
            document.removeEventListener("fullscreenchange", sync);
        };
    }, []);

    const fitWidth = canvasWidth > 0 ? Math.min(canvasWidth, isFullscreen ? 1400 : MAX_FIT_WIDTH) : 0;
    const pageWidth = Math.round(fitWidth * zoom);

    const goToPage = useCallback(
        (page: number) => {
            if (!numPages) return;
            const p = Math.max(1, Math.min(page, numPages));
            setPageNumber(p);
            setPageInput(p.toString());
            canvasRef.current?.scrollTo({ top: 0, left: 0 });
        },
        [numPages]
    );

    const zoomIn = () => setZoom((z) => ZOOM_STEPS.find((s) => s > z + 0.001) ?? z);
    const zoomOut = () => setZoom((z) => [...ZOOM_STEPS].reverse().find((s) => s < z - 0.001) ?? z);

    function commitPageInput() {
        const num = parseInt(pageInput);
        if (!isNaN(num)) goToPage(num);
        else setPageInput(pageNumber.toString());
    }

    function toggleFullscreen() {
        const el = workspaceRef.current;
        if (!el) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            el.requestFullscreen().catch(() => setCanFullscreen(false));
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.target instanceof HTMLInputElement) return;
        if (e.key === "ArrowRight") {
            e.preventDefault();
            goToPage(pageNumber + 1);
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            goToPage(pageNumber - 1);
        } else if (e.key === "+" || e.key === "=") {
            zoomIn();
        } else if (e.key === "-") {
            zoomOut();
        } else if (e.key === "0") {
            setZoom(1);
        }
    }

    const ready = numPages > 0 && !loadError;
    const placeholderWidth = pageWidth || 600;

    return (
        <div
            ref={workspaceRef}
            onKeyDown={handleKeyDown}
            className={cn(
                "overflow-clip border bg-card",
                isFullscreen ? "flex h-dvh flex-col" : "rounded-2xl shadow-sm"
            )}
        >
            {/* Toolbar */}
            <div
                role="toolbar"
                aria-label="Document controls"
                className={cn(
                    "z-20 flex items-center justify-between gap-2 border-b bg-card/95 px-2 py-2 backdrop-blur sm:px-3",
                    !isFullscreen && "sticky top-16 md:top-[4.5rem]"
                )}
            >
                <div className="flex items-center gap-1" role="group" aria-label="Pages">
                    <ToolButton label="Previous page" onClick={() => goToPage(pageNumber - 1)} disabled={!ready || pageNumber <= 1}>
                        <ChevronLeft className="size-5" />
                    </ToolButton>
                    <div className="flex items-center gap-1.5 text-sm">
                        <input
                            value={pageInput}
                            onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ""))}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") commitPageInput();
                            }}
                            onBlur={commitPageInput}
                            inputMode="numeric"
                            aria-label={`Page number, ${numPages || "loading"} pages total`}
                            disabled={!ready}
                            className="h-9 w-11 rounded-md border border-input bg-background text-center text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 disabled:opacity-60"
                        />
                        <span className="whitespace-nowrap text-muted-foreground tabular-nums" aria-hidden="true">
                            / {numPages || "–"}
                        </span>
                    </div>
                    <ToolButton label="Next page" onClick={() => goToPage(pageNumber + 1)} disabled={!ready || pageNumber >= numPages}>
                        <ChevronRight className="size-5" />
                    </ToolButton>
                </div>

                <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1" role="group" aria-label="Zoom">
                        <ToolButton label="Zoom out" onClick={zoomOut} disabled={!ready || zoom <= ZOOM_STEPS[0]}>
                            <ZoomOut className="size-[1.125rem]" />
                        </ToolButton>
                        <Tooltip>
                            <TooltipTrigger
                                render={
                                    <button
                                        type="button"
                                        onClick={() => setZoom(1)}
                                        disabled={!ready}
                                        aria-label={`Zoom ${Math.round(zoom * 100)}%. Reset to fit width`}
                                        className="hidden h-9 min-w-14 items-center justify-center rounded-md px-1.5 text-sm font-medium text-foreground tabular-nums transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none disabled:opacity-50 sm:inline-flex"
                                    />
                                }
                            >
                                {zoom === 1 ? "Fit" : `${Math.round(zoom * 100)}%`}
                            </TooltipTrigger>
                            <TooltipContent>Reset to fit width</TooltipContent>
                        </Tooltip>
                        <ToolButton label="Zoom in" onClick={zoomIn} disabled={!ready || zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}>
                            <ZoomIn className="size-[1.125rem]" />
                        </ToolButton>
                    </div>
                    <span className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
                    <div className="flex items-center gap-1" role="group" aria-label="View">
                        {canFullscreen && (
                            <ToolButton label={isFullscreen ? "Exit full screen" : "Full screen"} onClick={toggleFullscreen}>
                                {isFullscreen ? <Minimize className="size-[1.125rem]" /> : <Maximize className="size-[1.125rem]" />}
                            </ToolButton>
                        )}
                        <Tooltip>
                            <TooltipTrigger
                                render={
                                    <a
                                        href={downloadUrl}
                                        download={fileName}
                                        aria-label="Download PDF"
                                        className={cn(buttonVariants({ variant: "quiet", size: "icon" }), "text-foreground")}
                                    />
                                }
                            >
                                <Download className="size-[1.125rem]" />
                            </TooltipTrigger>
                            <TooltipContent>Download PDF</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Reading canvas */}
            <div
                ref={canvasRef}
                tabIndex={0}
                role="region"
                aria-label={ready ? `Page ${pageNumber} of ${numPages}. Use the arrow keys to turn pages.` : "Document"}
                className={cn(
                    "relative overflow-x-auto bg-canvas p-3 outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/30 sm:p-6",
                    isFullscreen && "flex-1 overflow-y-auto"
                )}
            >
                {loadError ? (
                    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center" role="alert">
                        <span className="flex size-14 items-center justify-center rounded-full bg-coral-soft text-coral-ink">
                            <FileWarning className="size-6" aria-hidden="true" />
                        </span>
                        <h3 className="mt-5 text-lg font-semibold">This PDF couldn&apos;t be displayed</h3>
                        <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
                            It may still be loading slowly, or your connection dropped. Try again, or
                            download the file to read it offline.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            <Button
                                onClick={() => {
                                    setLoadError(false);
                                    setAttempt((a) => a + 1);
                                }}
                            >
                                <RotateCcw data-icon="inline-start" />
                                Try again
                            </Button>
                            <a href={downloadUrl} download={fileName} className={buttonVariants({ variant: "outline" })}>
                                <Download data-icon="inline-start" />
                                Download instead
                            </a>
                        </div>
                    </div>
                ) : (
                    <Document
                        key={attempt}
                        file={fileUrl}
                        onLoadSuccess={({ numPages }) => {
                            setNumPages(numPages);
                            setPageNumber((p) => Math.min(p, numPages));
                        }}
                        onLoadError={() => setLoadError(true)}
                        onItemClick={({ pageNumber }) => goToPage(pageNumber)}
                        externalLinkTarget="_blank"
                        externalLinkRel="noopener noreferrer"
                        className="mx-auto w-fit"
                        loading={<PagePlaceholder width={placeholderWidth} ratio={pageRatio} label="Loading document…" />}
                        error={<span />}
                    >
                        {fitWidth > 0 && (
                            <Page
                                pageNumber={pageNumber}
                                width={pageWidth}
                                onLoadSuccess={(page) => {
                                    if (page.originalWidth) setPageRatio(page.originalHeight / page.originalWidth);
                                }}
                                className="overflow-hidden rounded-sm shadow-[0_1px_3px_rgb(0_0_0/0.08),0_12px_32px_-12px_rgb(0_0_0/0.28)]"
                                loading={<PagePlaceholder width={pageWidth} ratio={pageRatio} />}
                            />
                        )}
                    </Document>
                )}
            </div>
        </div>
    );
}
