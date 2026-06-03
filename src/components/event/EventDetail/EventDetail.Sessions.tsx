"use client"

import { use } from "react"
import { SessionsTable } from "@/components/event/SessionsTable"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailSessions() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { event } = ctx.state

  // Post events have no broadcast sessions to manage.
  if (event.type === "post") return null

  return <SessionsTable sessions={event.sessions ?? []} isLoading={false} />
}
