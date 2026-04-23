"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { storeService } from "@/services/api/store.service"
import { storeKeys } from "./useStore"
import type { Store, ShippingDefaults } from "@/types/store.types"

export function useUpdateShippingDefaults() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ShippingDefaults): Promise<Store> => {
      const token = await getToken()
      return storeService.updateShippingDefaults(payload, token)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(storeKeys.current(), data)
    },
  })
}
