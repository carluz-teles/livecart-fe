"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import {
  orderService,
  type RegenerateCheckoutResponse,
} from "@/services/api/order.service"
import { useStoreId } from "@/hooks/useUser"
import { orderKeys } from "./useOrders"

export function useRegenerateCheckout() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation<RegenerateCheckoutResponse, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const token = await getToken()
      return orderService.regenerateCheckout(storeId!, id, token)
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(storeId ?? "", id),
      })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}
