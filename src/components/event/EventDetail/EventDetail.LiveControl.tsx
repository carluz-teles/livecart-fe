"use client"

import { use } from "react"
import { LiveModeControlPanel } from "@/components/live/LiveModeControlPanel"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailLiveControl() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { event } = ctx.state

  // "Modo Live" only applies to live events, never to post-commerce events.
  if (event.type === "post") return null
  if (event.status !== "active") return null
  return <LiveModeControlPanel eventId={event.id} enabled />
}
