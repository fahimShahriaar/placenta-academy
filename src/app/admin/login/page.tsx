"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, LoaderCircle, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark, Logo } from "@/components/brand/Logo";
import { loginAction } from "@/actions/auth";

export default function AdminLoginPage() {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setPending(true);
        setError(null);
        try {
            const result = await loginAction(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                router.push("/admin");
            }
        } catch {
            // signIn redirects on success — this catch handles the redirect
            router.push("/admin");
        } finally {
            setPending(false);
        }
    }

    return (
        <div className="grid min-h-dvh w-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <aside className="relative hidden overflow-hidden bg-ink p-12 text-ink-foreground lg:flex lg:flex-col lg:justify-between xl:p-16">
                <Logo tone="inverted" />
                <svg
                    aria-hidden="true"
                    viewBox="0 0 480 420"
                    className="pointer-events-none absolute -right-20 bottom-24 w-[34rem] opacity-80"
                    fill="none"
                >
                    <g strokeWidth="2.5" strokeLinecap="round" className="stroke-primary/60">
                        <path d="M260 420V270" />
                        <path d="M260 270c0-50-50-76-120-96M260 270c0-50 50-76 120-96M260 270V120" />
                        <path d="M140 174l-26-60M140 174l-72-14M380 174l26-60M380 174l72-14" />
                        <path d="M196 230l-30 26M324 230l30 26" />
                    </g>
                    <g className="fill-ink stroke-primary/60" strokeWidth="2.5">
                        <circle cx="114" cy="114" r="8" />
                        <circle cx="68" cy="160" r="8" />
                        <circle cx="406" cy="114" r="8" />
                        <circle cx="452" cy="160" r="8" />
                    </g>
                    <circle cx="260" cy="112" r="13" className="fill-coral" />
                    <circle cx="260" cy="112" r="30" strokeWidth="1.5" className="stroke-coral/45" />
                    {[70, 110, 150].map((r) => (
                        <circle key={r} cx="260" cy="420" r={r} strokeWidth="1.2" className="stroke-ink-muted/25" />
                    ))}
                </svg>
                <div className="relative max-w-md">
                    <p className="font-display text-[2.5rem] leading-[1.08] font-semibold tracking-[-0.02em] text-balance">
                        Publishing tools for the Placenta Academy library.
                    </p>
                    <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-muted">
                        Upload study notes, write articles, and keep the catalogue organized.
                    </p>
                </div>
            </aside>

            <main id="main-content" className="flex flex-col px-5 py-8 sm:px-10">
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        Back to website
                    </Link>
                </div>

                <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
                    <BrandMark className="size-11 lg:hidden" />
                    <h1 className="mt-6 font-display text-[2rem] leading-tight font-semibold tracking-[-0.015em] lg:mt-0">
                        Sign in
                    </h1>
                    <p className="mt-2 text-[0.9375rem] text-muted-foreground">
                        For Placenta Academy administrators.
                    </p>

                    <form action={handleSubmit} className="mt-8 space-y-5">
                        {error && (
                            <div
                                role="alert"
                                className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm text-destructive"
                            >
                                <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                                <p>{error}</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                required
                                aria-invalid={error ? true : undefined}
                                className="h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    aria-invalid={error ? true : undefined}
                                    className="h-12 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                    className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" size="xl" className="w-full" disabled={pending}>
                            {pending && <LoaderCircle className="animate-spin" data-icon="inline-start" />}
                            {pending ? "Signing in…" : "Sign in"}
                        </Button>
                    </form>
                </div>
            </main>
        </div>
    );
}
