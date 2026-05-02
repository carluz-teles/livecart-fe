"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { ActiveCheckout } from "@/types"
import { eventKeys } from "./useEvents"

/** Polls the merchant-facing "active checkouts" endpoint every 5s while the
 *  consumer is mounted. The page can pass `enabled: false` to pause polling
 *  when the panel is hidden behind a tab. */
export function useEventActiveCheckouts(eventId: string, enabled = true) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: [...eventKeys.detailCarts(storeId ?? "", eventId), "active-checkouts"],
    queryFn: async (): Promise<ActiveCheckout[]> => {
      const token = await getToken()
      const res = await eventService.listActiveCheckouts(storeId!, eventId, token)
      return res.data
    },
    enabled:
      enabled &&
      isLoaded &&
      isSignedIn &&
      !storeLoading &&
      !!storeId &&
      !!eventId,
    refetchInterval: enabled ? 5000 : false,
    refetchIntervalInBackground: false,
  })
}
