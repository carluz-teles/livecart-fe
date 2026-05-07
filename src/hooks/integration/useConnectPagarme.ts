"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import { integrationKeys } from "./useIntegrations"
import type { ConnectPagarmePayload } from "@/types"

// Hook for Pagar.me API-key connection. Same endpoint serves first-time
// connect and key rotation — POST again with new keys and the existing
// integration row is updated in place. The backend validates against
// Pagar.me before persisting (422 means the keys are invalid).
export function useConnectPagarme() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ConnectPagarmePayload) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return integrationService.connectPagarme(storeId, payload, token)
    },
    onSuccess: () => {
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: integrationKeys.list(storeId) })
      }
    },
  })
}
