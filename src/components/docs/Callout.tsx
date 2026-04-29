interface CalloutProps {
  icon: React.ReactNode
  title: string
  tone: "neutral" | "warning" | "success"
  children: React.ReactNode
}

const TONE_STYLES = {
  neutral:
    "border-blue-200 bg-blue-50/60 text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100",
  warning:
    "border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100",
  success:
    "border-emerald-200 bg-emerald-50/60 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100",
}

// Soft side-note used for tips, warnings, and "before you start" hints.
// Tones map to a small visual shift (blue / amber / green) without being
// loud — the goal is to draw attention without breaking the reading flow.
export function Callout({ icon, title, tone, children }: CalloutProps) {
  return (
    <div className={`rounded-lg border p-4 ${TONE_STYLES[tone]}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">{icon}</div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold">{title}</p>
          <div className="text-sm leading-relaxed opacity-90">{children}</div>
        </div>
      </div>
    </div>
  )
}
