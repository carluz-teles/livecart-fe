"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  eventKeys,
  useEventCarts,
  useEventDetailStats,
  useEventSoldProducts,
  useEventPulse,
  useEndEvent,
} from "@/hooks/event"
import { useStoreId } from "@/hooks/useUser"
import type { Event, EventPulse } from "@/types/event.types"
import {
  EventDetailContext,
  type EventDetailContextValue,
} from "./EventDetailContext"

interface ProviderProps {
  event: Event
  children: React.ReactNode
}

// Provider owns the full data graph for the event detail screen plus the
// dialog open flags. Sub-components (Header/Body/cards) only consume — they
// never re-fetch on their own.
export function EventDetailProvider({ event, children }: ProviderProps) {
  const id = event.id
  const queryClient = useQueryClient()
  const { storeId } = useStoreId()

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useEventDetailStats(id)
  const {
    data: carts,
    isLoading: cartsLoading,
    refetch: refetchCarts,
  } = useEventCarts(id)
  const {
    data: products,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useEventSoldProducts(id)

  const endEventMutation = useEndEvent()

  // Near-real-time refresh: poll the cheap pulse only while the event is active
  // (ended events never change) and refetch just the list that actually moved.
  const isActive = event.status === "active"
  const { data: pulse } = useEventPulse(id, isActive)
  const prevPulse = useRef<EventPulse | null>(null)
  useEffect(() => {
    if (!pulse || !storeId) return
    const prev = prevPulse.current
    prevPulse.current = pulse
    if (!prev) return // first reading is the baseline — nothing to refetch yet
    // New cart or a cart edit/payment → orders + sold products + stats.
    //
    // `sessionMetrics` entra JUNTO de propósito. Ele nunca era invalidado em
    // lugar nenhum e, com `staleTime` de 30s e sem refetch no foco, a quebra
    // por transmissão congelava enquanto o total do evento andava a cada
    // pagamento. O resultado é que o banner de divergência — o alarme que
    // deveria provar que a métrica fecha — disparava como comportamento
    // normal, e o lojista aprendia a ignorá-lo.
    if (pulse.orders !== prev.orders || pulse.ordersChangedAt !== prev.ordersChangedAt) {
      queryClient.invalidateQueries({ queryKey: eventKeys.detailCarts(storeId, id) })
      queryClient.invalidateQueries({ queryKey: eventKeys.detailProducts(storeId, id) })
      queryClient.invalidateQueries({ queryKey: eventKeys.detailStats(storeId, id) })
      queryClient.invalidateQueries({ queryKey: eventKeys.sessionMetrics(storeId, id) })
    }
    // New comment / DM reply → comments feed + stats.
    if (pulse.comments !== prev.comments) {
      queryClient.invalidateQueries({ queryKey: eventKeys.detailComments(storeId, id) })
      queryClient.invalidateQueries({ queryKey: eventKeys.detailStats(storeId, id) })
    }
  }, [pulse, storeId, id, queryClient])

  const [endEventOpen, setEndEventOpen] = useState(false)
  const [createSessionOpen, setCreateSessionOpen] = useState(false)
  const [crashRecoveryOpen, setCrashRecoveryOpen] = useState(false)
  const [editEventOpen, setEditEventOpen] = useState(false)

  const refresh = useCallback(() => {
    // The event itself can change too (sessions list, status) — kick a fresh
    // load by invalidating its detail key, then refetch the dependent slices.
    // A quebra por transmissão sai da mesma virada: quem clica em "Atualizar"
    // depois de adicionar uma sessão espera ver a sessão nova nas duas fontes.
    if (storeId) {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(storeId, id) })
      queryClient.invalidateQueries({ queryKey: eventKeys.sessionMetrics(storeId, id) })
    }
    refetchStats()
    refetchCarts()
    refetchProducts()
  }, [queryClient, storeId, id, refetchStats, refetchCarts, refetchProducts])

  const endEvent = useCallback(async () => {
    try {
      await endEventMutation.mutateAsync({ id, payload: {} })
      setEndEventOpen(false)
    } catch {
      // Mutation hook surfaces the error toast.
    }
  }, [endEventMutation, id])

  const value: EventDetailContextValue = {
    state: {
      event,
      stats,
      statsLoading,
      carts: carts ?? [],
      cartsLoading,
      products: products ?? [],
      productsLoading,
      endEventOpen,
      createSessionOpen,
      crashRecoveryOpen,
      editEventOpen,
    },
    actions: {
      refresh,
      endEvent,
      isEndingEvent: endEventMutation.isPending,
      setEndEventOpen,
      setCreateSessionOpen,
      setCrashRecoveryOpen,
      setEditEventOpen,
    },
  }

  return (
    <EventDetailContext.Provider value={value}>
      {children}
    </EventDetailContext.Provider>
  )
}
