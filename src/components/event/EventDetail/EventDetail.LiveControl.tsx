"use client"

import { use } from "react"
import { LiveModeControlPanel } from "@/components/live/LiveModeControlPanel"
import { getEventKind } from "@/lib/event-kind"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailLiveControl() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { event } = ctx.state

  // Modo Live é execução de transmissão ao vivo: campanha só de publicação não
  // tem produto em destaque nem processamento para pausar.
  if (getEventKind(event).isPublicationOnly) return null
  if (event.status !== "active") return null
  return <LiveModeControlPanel eventId={event.id} enabled />
}
