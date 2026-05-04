"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { orderService } from "@/services/api/order.service"
import { useStoreId } from "@/hooks/useUser"
import type { ShippingAddressPayload } from "@/types/cart.types"
import { orderKeys } from "./useOrders"

interface Variables {
  id: string
  address: ShippingAddressPayload
}

export function useUpdateShippingAddress() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, address }: Variables) => {
      const token = await getToken()
      return orderService.updateShippingAddress(storeId!, id, address, token)
    },
    onSuccess: (_, { id }) => {
      // Invalidate the detail so the address card refreshes; lists don't
      // surface the address so we leave them alone.
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(storeId ?? "", id),
      })
    },
  })
}
