import { EventsInstagramGate } from "@/components/event"

// Gates the whole Events area behind a connected Instagram account: without one
// there is no source of comments, so there can be no events. Lives in the
// layout so the rule is declared once for the segment instead of being wired
// into each page.
export default function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <EventsInstagramGate>{children}</EventsInstagramGate>
}
