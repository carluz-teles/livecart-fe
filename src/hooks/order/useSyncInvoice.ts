"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { orderService } from "@/services/api/order.service"
import { useStoreId } from "@/hooks/useUser"
import { orderKeys } from "./useOrders"
import type { OrderDetail } from "@/types"

// Triggers the manual "Verificar NFe" sync. The Tiny webhook should cover
// emission events automatically — this hook exists as a fallback the merchant
// can fire from the order detail page when the webhook is misconfigured or
// late, and it just forces a fresh fetch from the ERP.
export function useSyncInvoice() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation<OrderDetail, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const token = await getToken()
      return orderService.syncInvoice(storeId!, id, token)
    },
    onSuccess: (refreshed, { id }) => {
      // Hydrate the cache with the refreshed detail so the page picks up
      // erpInvoice without a follow-up GET.
      queryClient.setQueryData(orderKeys.detail(storeId ?? "", id), refreshed)
    },
  })
}
