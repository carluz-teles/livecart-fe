"use client"

import { use } from "react"
import { SessionsTable } from "@/components/event/SessionsTable"
import { isPostLikeEvent } from "@/types/event.types"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailSessions() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { event } = ctx.state

  // Post and story events have no broadcast sessions to manage.
  if (isPostLikeEvent(event.type)) return null

  return <SessionsTable sessions={event.sessions ?? []} isLoading={false} />
}
