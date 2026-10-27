"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        variant="quiet"
                        size="icon"
                        aria-label="Toggle dark mode"
                        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                        className={cn("shrink-0", className)}
                    />
                }
            >
                <Sun className="size-[1.125rem] dark:hidden" />
                <Moon className="hidden size-[1.125rem] dark:block" />
            </TooltipTrigger>
            <TooltipContent>Toggle dark mode</TooltipContent>
        </Tooltip>
    );
}
