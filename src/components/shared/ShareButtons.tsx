"use client";

import { useEffect, useState } from "react";
import { Check, Link2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function XIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function FacebookIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
            <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396z" />
        </svg>
    );
}

interface ShareButtonsProps {
    url: string;
    title: string;
    label?: string;
    className?: string;
}

export function ShareButtons({ url, title, label = "Share", className }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const t = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(t);
    }, [copied]);

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Link copied to clipboard");
        } catch {
            toast.error("Couldn't copy the link. Copy it from the address bar instead.");
        }
    }

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const iconLink = cn(buttonVariants({ variant: "quiet", size: "icon-sm" }));

    const targets = [
        {
            label: "Share on X",
            href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            icon: <XIcon className="size-[0.9375rem]" />,
        },
        {
            label: "Share on Facebook",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            icon: <FacebookIcon className="size-4" />,
        },
        {
            label: "Share on WhatsApp",
            href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
            icon: <MessageCircle className="size-4" />,
        },
    ];

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {label && <span className="mr-1.5 text-meta font-medium text-muted-foreground">{label}</span>}
            <Tooltip>
                <TooltipTrigger
                    render={
                        <Button
                            variant="quiet"
                            size="icon-sm"
                            onClick={copyLink}
                            aria-label={copied ? "Link copied" : "Copy link"}
                        />
                    }
                >
                    {copied ? <Check className="text-success" /> : <Link2 />}
                </TooltipTrigger>
                <TooltipContent>{copied ? "Copied" : "Copy link"}</TooltipContent>
            </Tooltip>
            {targets.map((t) => (
                <Tooltip key={t.label}>
                    <TooltipTrigger
                        render={
                            <a
                                href={t.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${t.label} (opens in a new tab)`}
                                className={iconLink}
                            />
                        }
                    >
                        {t.icon}
                    </TooltipTrigger>
                    <TooltipContent>{t.label}</TooltipContent>
                </Tooltip>
            ))}
        </div>
    );
}
