"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { orderService } from "@/services/api/order.service"
import { useStoreId } from "@/hooks/useUser"
import type { OrderStats } from "@/types"
import { orderKeys } from "./useOrders"

export function useOrderStats() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: orderKeys.stats(storeId ?? ""),
    queryFn: async (): Promise<OrderStats> => {
      const token = await getToken()
      return orderService.getStats(storeId!, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
