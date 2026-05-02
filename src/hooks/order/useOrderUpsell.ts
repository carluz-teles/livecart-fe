"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { orderService } from "@/services/api/order.service"
import { useStoreId } from "@/hooks/useUser"
import type { OrderUpsellSummary } from "@/types"
import { orderKeys } from "./useOrders"

const upsellKey = (storeId: string, id: string) =>
  [...orderKeys.detail(storeId, id), "upsell"] as const

export function useOrderUpsell(id: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: upsellKey(storeId ?? "", id),
    queryFn: async (): Promise<OrderUpsellSummary> => {
      const token = await getToken()
      return orderService.getUpsell(storeId!, id, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId && !!id,
  })
}
