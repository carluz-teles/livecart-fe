"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { orderService } from "@/services/api/order.service"
import { useStoreId } from "@/hooks/useUser"
import { orderKeys } from "./useOrders"
import type { OrderDetail } from "@/types"

export function useRetryERPFinalisation() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation<OrderDetail, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const token = await getToken()
      return orderService.retryERPFinalisation(storeId!, id, token)
    },
    onSuccess: (refreshed, { id }) => {
      queryClient.setQueryData(
        orderKeys.detail(storeId ?? "", id),
        refreshed,
      )
      // Invalidate the entire orders surface — list pages, per-tab counts,
      // and stats KPIs all read derived state that flips after a retry. A
      // narrower invalidation would leave the "Precisam atenção" pill
      // stale until the next remount.
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}
