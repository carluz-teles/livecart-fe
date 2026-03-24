"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { orderService } from "@/services/api/order.service"
import { useStoreId } from "@/hooks/useUser"
import type { Order } from "@/types"
import { orderKeys } from "./useOrders"

interface UpdateOrderParams {
  id: string
  status?: Order["status"]
  paymentStatus?: Order["paymentStatus"]
}

export function useUpdateOrder() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UpdateOrderParams): Promise<Order> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()

      if (params.status) {
        return orderService.updateStatus(storeId, params.id, params.status, token)
      }
      if (params.paymentStatus) {
        return orderService.updatePaymentStatus(storeId, params.id, params.paymentStatus, token)
      }

      throw new Error("Either status or paymentStatus must be provided")
    },
    onSuccess: (data, params) => {
      if (storeId) {
        queryClient.setQueryData(orderKeys.detail(storeId, params.id), data)
      }
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}
