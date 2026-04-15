"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { orderService } from "@/services/api/order.service"
import { useStoreId } from "@/hooks/useUser"
import type { OrderDetail } from "@/types"
import { orderKeys } from "./useOrders"

export function useOrder(id: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: orderKeys.detail(storeId ?? "", id),
    queryFn: async (): Promise<OrderDetail> => {
      const token = await getToken()
      return orderService.getById(storeId!, id, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId && !!id,
  })
}
