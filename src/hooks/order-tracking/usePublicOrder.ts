"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  confirmPublicDelivery,
  fetchPublicOrder,
} from "@/services/api/order-tracking.service"
import type { PublicOrder } from "@/types/order-tracking.types"

export const orderTrackingKeys = {
  all: ["order-tracking"] as const,
  detail: (shortId: string) => [...orderTrackingKeys.all, shortId] as const,
}

interface UsePublicOrderArgs {
  shortId: string
  key: string
  // Polling cadence in ms — null disables. The page enables polling so a
  // delivered/shipped state change reflects without a manual reload.
  pollIntervalMs?: number | false
}

export function usePublicOrder({
  shortId,
  key,
  pollIntervalMs = 30_000,
}: UsePublicOrderArgs) {
  return useQuery<PublicOrder | null>({
    queryKey: [...orderTrackingKeys.detail(shortId), key],
    queryFn: () => fetchPublicOrder(shortId, key),
    enabled: !!shortId && !!key,
    refetchInterval: pollIntervalMs ? pollIntervalMs : false,
    staleTime: 0,
  })
}

// Customer self-confirms delivery from the public page.
export function useConfirmDelivery({
  shortId,
  trackingKey,
}: {
  shortId: string
  trackingKey: string
}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => confirmPublicDelivery(shortId, trackingKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderTrackingKeys.detail(shortId) })
      toast.success("Entrega confirmada. Obrigado!")
    },
    onError: () => {
      toast.error("Não conseguimos confirmar agora. Tenta de novo em alguns segundos.")
    },
  })
}
