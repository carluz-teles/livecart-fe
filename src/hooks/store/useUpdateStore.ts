"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { storeService } from "@/services/api/store.service"
import { storeKeys } from "./useStore"
import type { Store, UpdateStorePayload } from "@/types/store.types"

export function useUpdateStore() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateStorePayload): Promise<Store> => {
      const token = await getToken()
      return storeService.update(payload, token)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(storeKeys.current(), data)
    },
  })
}
