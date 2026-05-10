"use client"

import { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  eventKeys,
  useEventCarts,
  useEventDetailStats,
  useEventSoldProducts,
  useEndEvent,
} from "@/hooks/event"
import { useStoreId } from "@/hooks/useUser"
import type { Event } from "@/types/event.types"
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

  const [endEventOpen, setEndEventOpen] = useState(false)
  const [createSessionOpen, setCreateSessionOpen] = useState(false)
  const [crashRecoveryOpen, setCrashRecoveryOpen] = useState(false)

  const refresh = useCallback(() => {
    // The event itself can change too (sessions list, status) — kick a fresh
    // load by invalidating its detail key, then refetch the dependent slices.
    if (storeId) {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(storeId, id) })
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
    },
    actions: {
      refresh,
      endEvent,
      isEndingEvent: endEventMutation.isPending,
      setEndEventOpen,
      setCreateSessionOpen,
      setCrashRecoveryOpen,
    },
  }

  return (
    <EventDetailContext.Provider value={value}>
      {children}
    </EventDetailContext.Provider>
  )
}
