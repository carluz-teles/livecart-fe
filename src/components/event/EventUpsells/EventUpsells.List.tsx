"use client"

import type { EventUpsell } from "@/types"
import { EventUpsellCard } from "./EventUpsells.Card"

interface EventUpsellsListProps {
  upsells: EventUpsell[]
  eventId: string
}

export function EventUpsellsList({ upsells, eventId }: EventUpsellsListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {upsells.map((upsell) => (
        <EventUpsellCard key={upsell.id} upsell={upsell} eventId={eventId} />
      ))}
    </div>
  )
}
