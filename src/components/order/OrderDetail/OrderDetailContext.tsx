"use client"

import { createContext } from "react"
import type { OrderDetail } from "@/types/cart.types"

export interface RegenerateShareState {
  url: string
  expiresAt: string
}

export interface OrderDetailState {
  order: OrderDetail
  // Regenerate slice — confirmOpen drives the AlertDialog, share holds the
  // result that drives the post-success share sheet, isRegenerating tracks
  // the in-flight mutation. Lifted to the provider so both the Payment
  // card's inline alert and the Actions dropdown trigger the same flow.
  regenerate: {
    confirmOpen: boolean
    share: RegenerateShareState | null
    isPending: boolean
  }
}

export interface OrderDetailActions {
  refund: () => void
  isRefunding: boolean
  print: () => void
  requestRegenerate: () => void
  cancelRegenerate: () => void
  confirmRegenerate: () => void
  closeRegenerateShare: () => void
  markDelivered: () => void
  isMarkingDelivered: boolean
}

export interface OrderDetailMeta {
  storeId: string
}

export interface OrderDetailContextValue {
  state: OrderDetailState
  actions: OrderDetailActions
  meta: OrderDetailMeta
}

export const OrderDetailContext = createContext<OrderDetailContextValue | null>(null)
