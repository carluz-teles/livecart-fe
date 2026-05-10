"use client"

import { use } from "react"
import { EventCheckoutUpsell } from "@/components/event/EventCheckoutUpsell"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailCheckoutUpsell() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { event } = ctx.state

  return <EventCheckoutUpsell eventId={event.id} />
}
