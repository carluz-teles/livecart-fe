// Inline label for menu items, button names, and field names referenced
// in step instructions. Visually distinguishes UI text from prose so the
// reader can quickly scan "what to click" from the surrounding sentence.
export function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border bg-muted/60 px-1.5 py-0.5 text-[13px] font-medium text-foreground">
      {children}
    </span>
  )
}
