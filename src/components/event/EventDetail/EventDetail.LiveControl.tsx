"use client"

import { use } from "react"
import { LiveModeControlPanel } from "@/components/live/LiveModeControlPanel"
import { isPostLikeEvent } from "@/types/event.types"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailLiveControl() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { event } = ctx.state

  // "Modo Live" only applies to live events, never to post/story events.
  if (isPostLikeEvent(event.type)) return null
  if (event.status !== "active") return null
  return <LiveModeControlPanel eventId={event.id} enabled />
}
