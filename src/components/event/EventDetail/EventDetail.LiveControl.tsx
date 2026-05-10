"use client"

import { use } from "react"
import { LiveModeControlPanel } from "@/components/live/LiveModeControlPanel"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailLiveControl() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { event } = ctx.state

  if (event.status !== "active") return null
  return <LiveModeControlPanel eventId={event.id} enabled />
}
