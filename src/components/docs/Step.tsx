import { cn } from "@/lib/utils"

// Locations are predefined so the doc author can't introduce arbitrary
// pill colours; new providers just need a new entry here.
type StepLocation = "tiny" | "livecart" | "smartenvios"

interface StepProps {
  number: number
  title: string
  // When set, renders a small pill above the title indicating which system
  // the user should be on for this step. Critical for back-and-forth flows
  // (Tiny ↔ LiveCart) so the reader doesn't lose track.
  location?: StepLocation
  children: React.ReactNode
}

const LOCATION_STYLES: Record<
  StepLocation,
  { label: string; className: string }
> = {
  tiny: {
    label: "Na Tiny (Olist)",
    className:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300",
  },
  livecart: {
    label: "No LiveCart",
    className:
      "border-primary/30 bg-primary/10 text-primary",
  },
  smartenvios: {
    label: "Na SmartEnvios",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
  },
}

export function Step({ number, title, location, children }: StepProps) {
  const loc = location ? LOCATION_STYLES[location] : null
  return (
    <section className="relative pl-12">
      <span className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-semibold text-primary">
        {number}
      </span>
      <div className="space-y-4">
        {loc && (
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              loc.className
            )}
          >
            {loc.label}
          </span>
        )}
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground [&_p]:text-foreground/90">
          {children}
        </div>
      </div>
    </section>
  )
}
