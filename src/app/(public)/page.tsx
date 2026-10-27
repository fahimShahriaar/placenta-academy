import Link from "next/link";
import Form from "next/form";
import {
    ArrowRight,
    ArrowUpRight,
    BookOpen,
    Bone,
    FlaskConical,
    HeartPulse,
    Microscope,
    Pill,
    Scale,
    Search,
    Users,
    Biohazard,
    type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button-variants";
import { PdfCard } from "@/components/pdf/PdfCard";
import { BlogCard } from "@/components/blog/BlogCard";
import { HeroIllustration } from "@/components/brand/HeroIllustration";
import { BrandMark } from "@/components/brand/Logo";
import { pluralize } from "@/lib/format";
import { ACCENT_SURFACE, accentFor, compareTagNames } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

// Prisma queries aren't tracked by Next's cache, so without this the page is
// prerendered once at build time and never reflects new content.
export const dynamic = "force-dynamic";

const SUBJECT_ICONS: [RegExp, LucideIcon][] = [
    [/anatom/, Bone],
    [/physiol/, HeartPulse],
    [/biochem/, FlaskConical],
    [/patholog/, Microscope],
    [/pharmac/, Pill],
    [/microbio/, Biohazard],
    [/forensic/, Scale],
    [/community|public-health/, Users],
];

function subjectIcon(slug: string): LucideIcon {
    return SUBJECT_ICONS.find(([re]) => re.test(slug))?.[1] ?? BookOpen;
}

function SectionHeader({
    eyebrow,
    title,
    description,
    action,
    id,
}: {
    eyebrow: string;
    title: string;
    description?: string;
    action?: React.ReactNode;
    id: string;
}) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
                <p className="eyebrow">{eyebrow}</p>
                <h2 id={id} className="mt-2 font-display text-section font-semibold text-balance">
                    {title}
                </h2>
                {description && (
                    <p className="mt-3 text-base leading-relaxed text-pretty text-muted-foreground md:text-[1.0625rem]">
                        {description}
                    </p>
                )}
            </div>
            {action}
        </div>
    );
}

function ViewAllLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="group inline-flex shrink-0 items-center gap-1.5 self-start rounded-md text-[0.9375rem] font-medium text-primary-ink underline-offset-4 hover:underline sm:self-auto"
        >
            {children}
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
    );
}

export default async function HomePage() {
    const [latestNotes, latestBlogs, noteCount, blogCount, catalogTags] = await Promise.all([
        prisma.pdfNote.findMany({
            take: 6,
            orderBy: { createdAt: "desc" },
            include: { tags: { include: { tag: true } } },
        }),
        prisma.blogPost.findMany({
            where: { published: true },
            take: 4,
            orderBy: { createdAt: "desc" },
            include: { tags: { include: { tag: true } } },
        }),
        prisma.pdfNote.count(),
        prisma.blogPost.count({ where: { published: true } }),
        prisma.pdfTag.findMany({
            where: { category: { in: ["SUBJECT", "PHASE"] } },
            include: { _count: { select: { notes: true } } },
        }),
    ]);

    const subjects = catalogTags
        .filter((t) => t.category === "SUBJECT")
        .sort((a, b) => b._count.notes - a._count.notes || compareTagNames(a, b));
    const phases = catalogTags.filter((t) => t.category === "PHASE").sort(compareTagNames);
    const stockedSubjects = subjects.filter((s) => s._count.notes > 0);

    const [leadPost, ...morePosts] = latestBlogs;

    const overview = [
        noteCount > 0 && { value: noteCount, label: noteCount === 1 ? "study note" : "study notes" },
        blogCount > 0 && {
            value: blogCount,
            label: blogCount === 1 ? "published article" : "published articles",
        },
        subjects.length > 0 && {
            value: stockedSubjects.length,
            label: stockedSubjects.length === 1 ? "subject with notes" : "subjects with notes",
            detail: `of ${subjects.length} listed`,
        },
        phases.length > 0 && {
            value: phases.length,
            label: phases.length === 1 ? "phase to browse" : "phases to browse",
        },
    ].filter(Boolean) as { value: number; label: string; detail?: string }[];

    return (
        <>
            {/* A. Hero */}
            <section aria-labelledby="hero-title" className="relative overflow-hidden">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(60rem_28rem_at_85%_-10%,var(--mint),transparent_70%)]"
                />
                <div className="container-page grid items-center gap-10 pt-10 pb-12 md:pt-16 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-14 lg:pt-20 lg:pb-16">
                    <div className="max-w-2xl">
                        <p className="inline-flex animate-rise items-center gap-2 rounded-full border border-primary/20 bg-card/70 py-1 pr-3.5 pl-1.5 text-meta font-medium text-secondary-foreground shadow-xs">
                            <span className="flex size-5 items-center justify-center rounded-full bg-secondary">
                                <span className="size-1.5 rounded-full bg-coral" />
                            </span>
                            Medical learning, thoughtfully organized
                        </p>
                        <h1
                            id="hero-title"
                            className="mt-6 animate-rise font-display text-display font-semibold text-balance [animation-delay:60ms]"
                        >
                            Make complex medicine{" "}
                            <span className="relative whitespace-nowrap text-primary-ink">
                                easier
                                <svg
                                    viewBox="0 0 200 14"
                                    preserveAspectRatio="none"
                                    aria-hidden="true"
                                    className="absolute bottom-[0.02em] left-0 h-[0.16em] w-full"
                                >
                                    <path
                                        d="M2 10C40 4 120 2 198 7"
                                        fill="none"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        pathLength={1}
                                        className="draw-path animate-draw stroke-coral [animation-delay:700ms]"
                                    />
                                </svg>
                            </span>{" "}
                            to understand.
                        </h1>
                        <p className="mt-6 max-w-xl animate-rise text-lg leading-relaxed text-pretty text-muted-foreground [animation-delay:120ms] md:text-xl">
                            Explore study notes and medical articles, organized by subject,
                            phase, and system.
                        </p>

                        <Form
                            action="/notes"
                            role="search"
                            className="mt-8 max-w-xl animate-rise [animation-delay:180ms]"
                        >
                            <label htmlFor="hero-search" className="sr-only">
                                Search study notes
                            </label>
                            <div className="relative flex h-14 items-center rounded-2xl border border-input bg-card shadow-sm transition-[border-color,box-shadow] duration-150 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20 hover:border-border-strong dark:bg-sunken">
                                <Search className="pointer-events-none absolute left-4 size-5 text-muted-foreground" aria-hidden="true" />
                                <input
                                    id="hero-search"
                                    name="q"
                                    type="search"
                                    placeholder="Search study notes"
                                    autoComplete="off"
                                    enterKeyHint="search"
                                    className="h-full min-w-0 flex-1 bg-transparent pr-2 pl-12 text-base text-foreground outline-none placeholder:text-muted-foreground/80"
                                />
                                <button
                                    type="submit"
                                    className={cn(buttonVariants({ size: "lg" }), "mr-1.5 h-11 rounded-xl")}
                                >
                                    Search
                                </button>
                            </div>
                        </Form>

                        <div className="mt-6 flex animate-rise flex-wrap items-center gap-x-6 gap-y-4 [animation-delay:240ms]">
                            <Link href="/notes" className={buttonVariants({ size: "xl" })}>
                                Browse notes
                                <ArrowRight data-icon="inline-end" />
                            </Link>
                            <Link
                                href="/blog"
                                className="group inline-flex items-center gap-1.5 rounded-md text-base font-medium text-foreground underline-offset-4 hover:underline"
                            >
                                Read articles
                                <ArrowUpRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                            </Link>
                        </div>

                        {stockedSubjects.length > 0 && (
                            <p className="mt-6 flex animate-rise flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground [animation-delay:300ms]">
                                <span>Jump to</span>
                                {stockedSubjects.slice(0, 3).map((s, i) => (
                                    <span key={s.id} className="inline-flex items-center gap-2">
                                        {i > 0 && <span aria-hidden="true">·</span>}
                                        <Link
                                            href={`/notes?tag=${s.slug}`}
                                            className="font-medium text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-primary"
                                        >
                                            {s.name}
                                        </Link>
                                    </span>
                                ))}
                            </p>
                        )}
                    </div>

                    <HeroIllustration
                        labels={subjects.slice(0, 4).map((s) => s.name)}
                        className="mx-auto max-w-[34rem] animate-rise [animation-delay:150ms] lg:max-w-none"
                    />
                </div>

                {/* B. Library overview */}
                {overview.length > 0 && (
                    <div className="container-page pb-4">
                        <dl className="grid grid-cols-2 border-y border-border-strong/70 md:grid-cols-4">
                            {overview.map((item, i) => (
                                <div
                                    key={item.label}
                                    className={cn(
                                        "flex flex-col gap-1 py-5 md:px-6 md:py-6 md:first:pl-0",
                                        i % 2 === 1 && "pl-5 md:pl-6",
                                        i >= 2 && "border-t border-border md:border-t-0",
                                        "md:border-l md:first:border-l-0",
                                        i % 2 === 1 && "border-l"
                                    )}
                                >
                                    <dt className="order-2 text-sm text-muted-foreground">
                                        {item.label}
                                        {item.detail && (
                                            <span className="text-muted-foreground/75"> {item.detail}</span>
                                        )}
                                    </dt>
                                    <dd className="order-1 font-display text-[2.25rem] leading-none font-semibold tracking-tight tabular-nums">
                                        {item.value.toLocaleString("en-US")}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                )}
            </section>

            {/* C. Explore by subject */}
            {subjects.length > 0 && (
                <section aria-labelledby="subjects-title" className="section-y">
                    <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.6fr)] lg:gap-16">
                        <div className="lg:sticky lg:top-28 lg:self-start">
                            <SectionHeader
                                id="subjects-title"
                                eyebrow="Subjects"
                                title="Explore by subject"
                                description="Every subject opens the notes library already filtered to it, so you land on the right material straight away."
                            />
                            <div className="mt-6">
                                <ViewAllLink href="/notes">Browse all notes</ViewAllLink>
                            </div>
                        </div>
                        <ul className="reveal grid gap-3 sm:grid-cols-2">
                            {subjects.map((subject) => {
                                const Icon = subjectIcon(subject.slug);
                                const count = subject._count.notes;
                                const accent = accentFor(subject.slug);
                                const body = (
                                    <>
                                        <span
                                            className={cn(
                                                "flex size-12 shrink-0 items-center justify-center rounded-xl",
                                                count > 0 ? ACCENT_SURFACE[accent] : "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            <Icon className="size-[1.375rem]" aria-hidden="true" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[1.0625rem] font-semibold text-foreground">
                                                {subject.name}
                                            </span>
                                            <span className={cn("text-sm", count > 0 ? "text-muted-foreground" : "text-muted-foreground/80")}>
                                                {count > 0 ? pluralize(count, "note") : "No notes yet"}
                                            </span>
                                        </span>
                                    </>
                                );
                                return (
                                    <li key={subject.id}>
                                        {count > 0 ? (
                                            <Link
                                                href={`/notes?tag=${subject.slug}`}
                                                className="group flex h-full items-center gap-4 rounded-2xl border bg-card p-4 transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-sm"
                                            >
                                                {body}
                                                <ArrowRight
                                                    className="size-[1.125rem] shrink-0 text-muted-foreground transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-primary-ink"
                                                    aria-hidden="true"
                                                />
                                            </Link>
                                        ) : (
                                            <div className="flex h-full items-center gap-4 rounded-2xl border border-dashed border-border-strong/80 bg-transparent p-4">
                                                {body}
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </section>
            )}

            {/* D. Latest study notes */}
            {latestNotes.length > 0 && (
                <section aria-labelledby="latest-notes-title" className="border-y bg-card section-y">
                    <div className="container-page">
                        <SectionHeader
                            id="latest-notes-title"
                            eyebrow="New in the library"
                            title="Latest study notes"
                            action={<ViewAllLink href="/notes">View all notes</ViewAllLink>}
                        />
                        <div
                            className={cn(
                                "reveal mt-10 grid gap-5",
                                latestNotes.length === 2 && "md:grid-cols-2",
                                latestNotes.length >= 3 && "sm:grid-cols-2 lg:grid-cols-3"
                            )}
                        >
                            {latestNotes.map((note) => (
                                <PdfCard
                                    key={note.id}
                                    title={note.title}
                                    slug={note.slug}
                                    description={note.description}
                                    createdAt={note.createdAt}
                                    fileSize={note.fileSize}
                                    tags={note.tags}
                                    layout={latestNotes.length === 1 ? "feature" : "card"}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* E. Browse by phase */}
            {phases.length > 0 && (
                <section aria-labelledby="phases-title" className="section-y">
                    <div className="container-page">
                        <div className="relative overflow-hidden rounded-3xl bg-mint px-5 py-10 sm:px-8 md:px-12 md:py-14">
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 400 200"
                                className="pointer-events-none absolute -right-10 -bottom-12 w-80 opacity-60 md:w-[28rem]"
                                fill="none"
                            >
                                {[60, 95, 130, 165].map((r) => (
                                    <circle key={r} cx="300" cy="200" r={r} strokeWidth="1.5" className="stroke-primary/20" />
                                ))}
                            </svg>
                            <SectionHeader
                                id="phases-title"
                                eyebrow="Phases"
                                title="Browse by phase"
                                description="Pick the phase you're studying to see its notes."
                            />
                            <div className="reveal relative mt-10 md:mt-12">
                                <span
                                    aria-hidden="true"
                                    className="absolute top-8 bottom-8 left-[2.3125rem] w-px bg-primary/30 md:top-[2.4375rem] md:right-10 md:bottom-auto md:left-10 md:h-px md:w-auto"
                                />
                            <ol className="relative grid gap-3 md:auto-cols-fr md:grid-flow-col md:gap-4">
                                {phases.map((phase) => {
                                    const count = phase._count.notes;
                                    const numeral = phase.name.match(/\d+/)?.[0];
                                    return (
                                        <li key={phase.id} className="relative">
                                            <Link
                                                href={`/notes?tag=${phase.slug}`}
                                                className="group flex h-full items-center gap-4 rounded-2xl border border-primary/15 bg-card/80 p-3.5 transition-[border-color,background-color,box-shadow] duration-200 hover:border-primary/45 hover:bg-card hover:shadow-sm md:flex-col md:items-start md:gap-5 md:p-4"
                                            >
                                                <span
                                                    className={cn(
                                                        "flex size-[2.875rem] shrink-0 items-center justify-center rounded-full font-display text-xl font-semibold ring-4 ring-mint transition-colors",
                                                        count > 0
                                                            ? "bg-primary text-primary-foreground"
                                                            : "border-2 border-dashed border-primary/40 bg-card text-primary-ink"
                                                    )}
                                                    aria-hidden="true"
                                                >
                                                    {numeral ?? <span className="size-2 rounded-full bg-current" />}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate font-semibold text-foreground">{phase.name}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {count > 0 ? pluralize(count, "note") : "No notes yet"}
                                                    </span>
                                                </span>
                                                <ArrowRight
                                                    className="size-4 shrink-0 text-muted-foreground transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-primary-ink md:hidden"
                                                    aria-hidden="true"
                                                />
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ol>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* F. Latest articles */}
            {leadPost && (
                <section aria-labelledby="articles-title" className="pb-16 md:pb-24">
                    <div className="container-page">
                        <SectionHeader
                            id="articles-title"
                            eyebrow="From the blog"
                            title="Latest articles"
                            action={<ViewAllLink href="/blog">All articles</ViewAllLink>}
                        />
                        <div
                            className={cn(
                                "reveal mt-10 grid gap-5",
                                morePosts.length > 0 && "lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"
                            )}
                        >
                            <BlogCard
                                title={leadPost.title}
                                slug={leadPost.slug}
                                excerpt={leadPost.excerpt}
                                coverImage={leadPost.coverImage}
                                createdAt={leadPost.createdAt}
                                publishedAt={leadPost.publishedAt}
                                content={leadPost.content}
                                tags={leadPost.tags}
                                layout={morePosts.length > 0 ? "card" : "lead"}
                                eyebrow="Latest"
                            />
                            {morePosts.length > 0 && (
                                <ul className="flex flex-col gap-4">
                                    {morePosts.map((post) => (
                                        <li key={post.id}>
                                            <BlogCard
                                                title={post.title}
                                                slug={post.slug}
                                                excerpt={post.excerpt}
                                                coverImage={post.coverImage}
                                                createdAt={post.createdAt}
                                                publishedAt={post.publishedAt}
                                                content={post.content}
                                                tags={post.tags}
                                                layout="row"
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* G. Closing call to action */}
            <section aria-labelledby="cta-title" className="pb-16 md:pb-24">
                <div className="container-page">
                    <div className="relative isolate overflow-hidden rounded-3xl bg-ink px-6 py-12 text-ink-foreground sm:px-10 md:px-14 md:py-16">
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 420 320"
                            className="pointer-events-none absolute -right-32 -bottom-24 -z-10 w-[22rem] opacity-35 sm:-right-16 sm:-bottom-10 sm:w-[26rem] sm:opacity-90 md:right-6 md:w-[30rem]"
                            fill="none"
                        >
                            <g strokeWidth="2.5" strokeLinecap="round" className="stroke-primary/70">
                                <path d="M250 320V210" />
                                <path d="M250 210c0-40-40-60-96-76M250 210c0-40 40-60 96-76M250 210V92" />
                                <path d="M154 134l-22-50M154 134l-60-10M346 134l22-50M346 134l60-10" />
                            </g>
                            <g className="fill-ink stroke-primary/70" strokeWidth="2.5">
                                <circle cx="132" cy="84" r="7" />
                                <circle cx="94" cy="124" r="7" />
                                <circle cx="368" cy="84" r="7" />
                                <circle cx="406" cy="124" r="7" />
                            </g>
                            <circle cx="250" cy="84" r="11" className="fill-coral" />
                            <circle cx="250" cy="84" r="24" strokeWidth="1.5" className="stroke-coral/50" />
                        </svg>
                        <BrandMark className="size-10" />
                        <h2
                            id="cta-title"
                            className="mt-6 max-w-xl font-display text-section font-semibold text-balance md:text-[2.5rem] md:leading-[1.08]"
                        >
                            Find the notes for what you&apos;re studying today.
                        </h2>
                        <p className="mt-4 max-w-lg text-[1.0625rem] leading-relaxed text-ink-muted">
                            Search the library, or narrow it down by phase, subject, and system.
                        </p>
                        <Link
                            href="/notes"
                            className={cn(
                                buttonVariants({ size: "xl" }),
                                "mt-8 bg-ink-foreground text-ink hover:bg-white dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary-hover"
                            )}
                        >
                            Open the notes library
                            <ArrowRight data-icon="inline-end" />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
