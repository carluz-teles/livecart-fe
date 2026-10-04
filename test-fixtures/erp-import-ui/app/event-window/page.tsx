"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { EventForm } from "@/components/event/EventForm"
import { EventWindowForm } from "@/components/event/EventWindowForm"
import { storeKeys } from "@/hooks/store/useStore"
import type { Event } from "@/types/event.types"
import type { Store } from "@/types/store.types"
import { TooltipProvider } from "@/components/ui/tooltip"
import "@/app/globals.css"

export default function Page() {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  const [edit, setEdit] = useState(false)
  const [event, setEvent] = useState({
    id: "event", title: "Semana de outubro", status: "active", scheduledAt: null,
    endsAt: "2026-10-07T02:59:00Z", cartExpirationMinutes: 5760,
    waitlistNotifiedTtlMinutes: 30, pixDiscountPercent: 0,
  } as Event)
  return <QueryClientProvider client={client}><TooltipProvider>
    <EventForm />
    <button onClick={() => setEdit(true)}>Editar evento de teste</button>
    <button onClick={() => setEvent((current) => ({ ...current }))}>Atualizar evento recebido</button>
    <button onClick={() => client.setQueryData<Store>(storeKeys.current(), (current) => current && ({
      ...current, cartSettings: { ...current.cartSettings, expirationMinutes: 60 },
    }))}>Atualizar regras recebidas</button>
    <EventWindowForm event={event} open={edit} onOpenChange={setEdit} />
    <Toaster />
  </TooltipProvider></QueryClientProvider>
}
