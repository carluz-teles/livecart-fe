"use client"

import { use, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEvent } from "@/hooks/event/useEvent"
import { EventDetailProvider } from "@/components/event/EventDetail/EventDetail.Provider"
import { EventDetailContext } from "@/components/event/EventDetail/EventDetailContext"
import { EventDetailEndEventDialog } from "@/components/event/EventDetail/EventDetail.EndEventDialog"
import "@/app/globals.css"

function OpenConfirmation() {
  const context = use(EventDetailContext)!
  return <>
    <button onClick={() => context.actions.setEndEventOpen(true)}>Revisar encerramento</button>
    <EventDetailEndEventDialog />
  </>
}

function EventUnderTest() {
  const { data: event } = useEvent("event")
  return event ? <EventDetailProvider event={event}><OpenConfirmation /></EventDetailProvider> : <p>Carregando evento…</p>
}

export default function Page() {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } }))
  return <QueryClientProvider client={client}><EventUnderTest /></QueryClientProvider>
}
