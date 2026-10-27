import type { PdfTagCategory } from "@/generated/prisma/enums";

// Shared vocabulary for PDF tag categories, used by the public library,
// the admin forms and the tag manager so they never drift apart.

export const CATEGORY_ORDER: PdfTagCategory[] = [
    "PHASE",
    "SUBJECT",
    "SYSTEM",
    "TOPIC",
    "OTHER",
];

export const CATEGORY_LABELS: Record<PdfTagCategory, string> = {
    PHASE: "Phase",
    SUBJECT: "Subject",
    SYSTEM: "System",
    TOPIC: "Topic",
    OTHER: "Other",
};

export const CATEGORY_PLURALS: Record<PdfTagCategory, string> = {
    PHASE: "Phases",
    SUBJECT: "Subjects",
    SYSTEM: "Systems",
    TOPIC: "Topics",
    OTHER: "Other tags",
};

export function categoryLabel(category: string): string {
    return CATEGORY_LABELS[category as PdfTagCategory] ?? "Other";
}

// Badge styling per category. Subject and phase carry the most weight;
// everything else stays neutral to keep cards calm.
export const CATEGORY_BADGE: Record<PdfTagCategory, string> = {
    SUBJECT: "bg-secondary text-secondary-foreground",
    PHASE: "border-border-strong bg-card text-foreground",
    SYSTEM: "bg-coral-soft text-coral-ink",
    TOPIC: "bg-muted text-foreground",
    OTHER: "border-border bg-card text-muted-foreground",
};

/** Sort tag names so "Phase 2" comes before "Phase 10". */
export function compareTagNames(a: { name: string }, b: { name: string }) {
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
}

type TagLike = { name: string; slug: string; category: string };

/** Split a note's tags into the primary subject/phase and the remaining tags. */
export function summarizeNoteTags<T extends TagLike>(tags: T[]) {
    const subjects = tags.filter((t) => t.category === "SUBJECT");
    const phases = tags.filter((t) => t.category === "PHASE").sort(compareTagNames);
    const subject = subjects[0];
    const phase = phases[0];
    const rest = tags
        .filter((t) => t !== subject && t !== phase)
        .sort(
            (a, b) =>
                CATEGORY_ORDER.indexOf(a.category as PdfTagCategory) -
                CATEGORY_ORDER.indexOf(b.category as PdfTagCategory)
        );
    return { subject, phase, rest };
}

// Three cohesive accents, assigned deterministically so a given subject
// or article always gets the same treatment.
export const ACCENTS = ["teal", "coral", "ink"] as const;
export type Accent = (typeof ACCENTS)[number];

export function accentFor(key: string | undefined): Accent {
    if (!key) return "teal";
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    return ACCENTS[hash % ACCENTS.length];
}

export const ACCENT_SURFACE: Record<Accent, string> = {
    teal: "bg-secondary text-primary-ink",
    coral: "bg-coral-soft text-coral-ink",
    ink: "bg-muted text-foreground",
};
