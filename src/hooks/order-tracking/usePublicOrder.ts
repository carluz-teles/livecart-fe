"use client"

import { useQuery } from "@tanstack/react-query"

import { fetchPublicOrder } from "@/services/api/order-tracking.service"
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
