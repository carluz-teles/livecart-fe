import { EventsAccessGate } from "@/components/event"

// Gates the whole Events area behind the two things an event needs to work:
// a connected Instagram account (where orders come from) and an active payment
// method (how they get charged). Lives in the layout so the rule is declared
// once for the segment instead of being wired into each page.
export default function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <EventsAccessGate>{children}</EventsAccessGate>
}
