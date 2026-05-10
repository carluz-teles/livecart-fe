"use client"

import { useParams } from "next/navigation"

import { useEvent } from "@/hooks/event"
import { EventDetail } from "@/components/event/EventDetail"

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>()
  const { data: event, isLoading, error } = useEvent(params.id)

  if (isLoading) return <EventDetail.Skeleton />
  if (error || !event) return <EventDetail.NotFound />

  return (
    <EventDetail.Provider event={event}>
      <EventDetail.Frame>
        <EventDetail.Header />
        <EventDetail.Body />
      </EventDetail.Frame>
    </EventDetail.Provider>
  )
}
