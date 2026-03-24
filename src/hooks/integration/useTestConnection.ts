"use client"

import { useMutation } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"

export function useTestConnection() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()

  return useMutation({
    mutationFn: async (integrationId: string) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return integrationService.testConnection(storeId, integrationId, token)
    },
  })
}
