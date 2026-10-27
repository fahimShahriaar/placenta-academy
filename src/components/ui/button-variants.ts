import { cva, type VariantProps } from "class-variance-authority"

// Kept out of the "use client" button module so server components can style
// <Link> elements as buttons (avoids nesting <button> inside <a>).
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-(--ease-standard) outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/45 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover",
        ink: "bg-ink text-ink-foreground shadow-xs hover:bg-ink/90 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90",
        outline:
          "border-border-strong bg-card text-foreground shadow-xs hover:border-foreground/30 hover:bg-sunken aria-expanded:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-mint-strong aria-expanded:bg-mint-strong",
        ghost:
          "text-foreground hover:bg-muted aria-expanded:bg-muted dark:hover:bg-muted/70",
        quiet:
          "text-muted-foreground hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/30",
        "destructive-ghost":
          "text-destructive hover:bg-destructive-soft focus-visible:ring-destructive/30",
        link: "h-auto! px-0! text-primary-ink underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-2 px-4 text-sm has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-md px-2 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-1.5 rounded-[0.625rem] px-3 text-sm has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        lg: "h-11 gap-2 px-5 text-[0.9375rem] has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xl: "h-12 gap-2 rounded-xl px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5 [&_svg:not([class*='size-'])]:size-[1.125rem]",
        icon: "size-10",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9 rounded-[0.625rem]",
        "icon-lg": "size-11 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonVariantProps = VariantProps<typeof buttonVariants>

export { buttonVariants, type ButtonVariantProps }
