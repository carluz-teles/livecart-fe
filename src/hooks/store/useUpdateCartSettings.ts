"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { storeService } from "@/services/api/store.service"
import { storeKeys } from "./useStore"
import type { Store, UpdateCartSettingsPayload } from "@/types/store.types"

export function useUpdateCartSettings() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateCartSettingsPayload): Promise<Store> => {
      const token = await getToken()
      return storeService.updateCartSettings(payload, token)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(storeKeys.current(), data)
    },
  })
}
