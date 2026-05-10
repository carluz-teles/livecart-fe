"use client"

import { createContext } from "react"
import type {
  Event,
  EventCart,
  EventDetailStats,
  EventSoldProduct,
} from "@/types/event.types"

type SoldProduct = EventSoldProduct

export interface EventDetailState {
  event: Event
  stats: EventDetailStats | undefined
  statsLoading: boolean
  carts: EventCart[]
  cartsLoading: boolean
  products: SoldProduct[]
  productsLoading: boolean
  // Dialog open flags — lifted so Header (Ações dropdown) and Body can both
  // trigger the same flows.
  endEventOpen: boolean
  createSessionOpen: boolean
  crashRecoveryOpen: boolean
}

export interface EventDetailActions {
  refresh: () => void
  endEvent: () => void
  isEndingEvent: boolean
  setEndEventOpen: (open: boolean) => void
  setCreateSessionOpen: (open: boolean) => void
  setCrashRecoveryOpen: (open: boolean) => void
}

export interface EventDetailContextValue {
  state: EventDetailState
  actions: EventDetailActions
}

export const EventDetailContext =
  createContext<EventDetailContextValue | null>(null)
