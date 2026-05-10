"use client"

import { use } from "react"
import { EventActiveCheckouts } from "@/components/event/EventActiveCheckouts"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailActiveCheckouts() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { event } = ctx.state
  const isActive = event.status === "active"

  if (!isActive) return null
  return <EventActiveCheckouts eventId={event.id} enabled />
}
