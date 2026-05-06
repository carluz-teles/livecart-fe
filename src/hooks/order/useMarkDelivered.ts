"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"

import { orderService } from "@/services/api/order.service"
import { useStoreId } from "@/hooks/useUser"

import { orderKeys } from "./useOrders"

// Merchant-side "Marcar como entregue" mutation. Calls the new
// /orders/:id/mark-delivered endpoint and invalidates the detail + list
// queries so the OrderDetail header status badge reflects the new state.
export function useMarkDelivered() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation<{ confirmed: boolean }, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const token = await getToken()
      return orderService.markDelivered(storeId!, id, token)
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(storeId ?? "", id),
      })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}
