import { cn } from "@/lib/utils";

const FALLBACK_LABELS = ["Anatomy", "Physiology", "Pathology", "Pharmacology"];

// Branches grow from the book's spine; endpoints match the label anchors.
const BRANCHES = [
    "M280 262C254 246 196 236 132 200",
    "M280 262C262 222 226 168 206 122",
    "M280 262C280 206 280 150 280 94",
    "M280 262C298 222 334 168 354 122",
    "M280 262C306 246 364 236 428 200",
];

const TWIGS = ["M220 238 196 264", "M340 238 364 264", "M168 218 156 244", "M392 218 404 244"];

// Upper labels sit outside their nodes so they never cover the central branch.
const LABEL_ANCHORS = [
    { x: 132, y: 200, place: "below", hideOnMobile: false },
    { x: 206, y: 122, place: "left", hideOnMobile: true },
    { x: 354, y: 122, place: "right", hideOnMobile: true },
    { x: 428, y: 200, place: "below", hideOnMobile: false },
] as const;

const PLACEMENT = {
    below: { dx: 0, dy: 18, translate: "-50% 0" },
    left: { dx: -16, dy: 0, translate: "-100% -50%" },
    right: { dx: 16, dy: 0, translate: "0 -50%" },
} as const;

/**
 * Decorative hero artwork: an open study book with a branching "vessel
 * tree" (the brand motif) growing from its spine and ending in subject
 * labels. Purely presentational — hidden from assistive technology, and
 * fully drawn even when animation is disabled.
 */
export function HeroIllustration({
    labels,
    className,
}: {
    labels: string[];
    className?: string;
}) {
    const names = [...labels, ...FALLBACK_LABELS.filter((l) => !labels.includes(l))].slice(0, 4);

    return (
        <div
            aria-hidden="true"
            className={cn(
                "relative isolate aspect-[56/52] w-full overflow-hidden rounded-[2rem] bg-mint ring-1 ring-primary/10",
                className
            )}
        >
            <svg viewBox="0 0 560 520" className="absolute inset-0 size-full" fill="none">
                <defs>
                    <pattern id="hero-dots" width="22" height="22" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.15" className="fill-foreground/12" />
                    </pattern>
                </defs>
                <rect width="560" height="520" fill="url(#hero-dots)" />
                <circle cx="462" cy="86" r="156" className="fill-primary/8" />
                <circle cx="62" cy="474" r="92" className="stroke-coral/45" strokeWidth="1.5" />
                <circle cx="62" cy="474" r="64" className="stroke-coral/30" strokeWidth="1.5" />

                {/* Molecule motif */}
                <g className="stroke-foreground/25" strokeWidth="1.5" strokeLinejoin="round">
                    <path d="M70 64l16 9v18l-16 9-16-9V73z" />
                    <path d="M86 91l16 9v18l-16 9-16-9v-18" />
                    <path d="M102 73l14-8" />
                    <circle cx="120" cy="63" r="4" className="fill-background" />
                </g>

                {/* Graph-paper markers */}
                <g className="stroke-foreground/25" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M492 296v12M486 302h12" />
                    <path d="M512 430v10M507 435h10" />
                    <path d="M40 258v10M35 263h10" />
                </g>

                {/* Vessel tree */}
                <g className="stroke-primary" strokeWidth="3" strokeLinecap="round">
                    <path d="M280 346V262" pathLength={1} className="draw-path animate-draw" />
                    {BRANCHES.map((d, i) => (
                        <path
                            key={d}
                            d={d}
                            pathLength={1}
                            className="draw-path animate-draw"
                            style={{ animationDelay: `${0.35 + i * 0.08}s` }}
                        />
                    ))}
                </g>
                <g className="stroke-primary/70" strokeWidth="2" strokeLinecap="round">
                    {TWIGS.map((d, i) => (
                        <path
                            key={d}
                            d={d}
                            pathLength={1}
                            className="draw-path animate-draw"
                            style={{ animationDelay: `${0.9 + i * 0.06}s` }}
                        />
                    ))}
                </g>
                <g className="fill-primary">
                    {[
                        [196, 264],
                        [364, 264],
                        [156, 244],
                        [404, 244],
                    ].map(([cx, cy], i) => (
                        <circle
                            key={cx}
                            cx={cx}
                            cy={cy}
                            r="4"
                            className="origin-center animate-pop [transform-box:fill-box]"
                            style={{ animationDelay: `${1.2 + i * 0.05}s` }}
                        />
                    ))}
                    <circle cx="280" cy="262" r="5.5" />
                </g>
                {LABEL_ANCHORS.map(({ x, y }, i) => (
                    <circle
                        key={x}
                        cx={x}
                        cy={y}
                        r="7.5"
                        strokeWidth="3"
                        className="origin-center animate-pop fill-card stroke-primary [transform-box:fill-box]"
                        style={{ animationDelay: `${1 + i * 0.06}s` }}
                    />
                ))}
                <circle cx="280" cy="94" r="19" className="stroke-coral/50" strokeWidth="1.5" />
                <circle
                    cx="280"
                    cy="94"
                    r="9.5"
                    className="origin-center animate-pop fill-coral [transform-box:fill-box]"
                    style={{ animationDelay: "1.3s" }}
                />

                {/* Open study book */}
                <g strokeWidth="2.5" strokeLinejoin="round" className="stroke-foreground">
                    <path d="M92 454v9c58-10 138-2 188 22 50-24 130-32 188-22v-9" className="fill-mint-strong" />
                    <path d="M280 346c-50-26-130-34-188-24v132c58-10 138-2 188 22z" className="fill-card" />
                    <path d="M280 346c50-26 130-34 188-24v132c-58-10-138-2-188 22z" className="fill-card" />
                    <path d="M280 346v130" />
                </g>
                <g className="stroke-foreground/25" strokeWidth="3" strokeLinecap="round">
                    <path d="M122 356c40-5 86-3 128 8" />
                    <path d="M122 376c40-5 86-3 134 9" />
                    <path d="M122 396c40-5 70-3 102 5" />
                    <path d="M122 416c40-5 86-3 128 8" />
                    <path d="M122 436c30-4 56-3 82 2" />
                    <path d="M386 428c20-2 44-1 60 1" />
                    <path d="M330 446c40-6 80-7 116-3" />
                </g>
                <g className="stroke-foreground/35" strokeWidth="2">
                    <rect x="312" y="350" width="132" height="64" rx="8" transform="rotate(-4 378 382)" />
                    <circle cx="352" cy="384" r="17" className="stroke-primary/70" />
                    <circle cx="352" cy="384" r="6" className="fill-coral/70 stroke-none" />
                    <path d="M384 372h44M384 386h36M384 400h28" strokeLinecap="round" />
                </g>
                {/* Bookmark ribbon */}
                <path d="M300 340v168l9-10 9 10V336" className="fill-coral" />
            </svg>

            {LABEL_ANCHORS.map(({ x, y, place, hideOnMobile }, i) =>
                names[i] ? (
                    <span
                        key={x}
                        className={cn(
                            "absolute max-w-[34%] animate-rise truncate rounded-full border border-primary/15 bg-card px-3 py-1 text-[0.75rem] font-medium text-foreground shadow-sm sm:text-[0.8125rem]",
                            hideOnMobile && "hidden sm:block"
                        )}
                        style={{
                            left: `${((x + PLACEMENT[place].dx) / 560) * 100}%`,
                            top: `${((y + PLACEMENT[place].dy) / 520) * 100}%`,
                            // `translate` composes with the keyframe transform
                            translate: PLACEMENT[place].translate,
                            animationDelay: `${1.15 + i * 0.08}s`,
                        }}
                    >
                        {names[i]}
                    </span>
                ) : null
            )}
        </div>
    );
}
