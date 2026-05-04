"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { orderService } from "@/services/api/order.service"
import { useStoreId } from "@/hooks/useUser"
import type { OrderListParams, OrderListResponse } from "@/types"

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (storeId: string, params?: OrderListParams) => [...orderKeys.lists(), storeId, params] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (storeId: string, id: string) => [...orderKeys.details(), storeId, id] as const,
  stats: (storeId: string, params?: OrderListParams) => [...orderKeys.all, "stats", storeId, params] as const,
}

export function useOrders(params?: OrderListParams) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: orderKeys.list(storeId ?? "", params),
    queryFn: async (): Promise<OrderListResponse> => {
      const token = await getToken()
      return orderService.list(storeId!, params, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
