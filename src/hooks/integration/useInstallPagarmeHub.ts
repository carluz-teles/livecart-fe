"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import { integrationKeys } from "./useIntegrations"

// Hook for completing a Pagar.me Hub (Partner App) install. The Hub redirect
// lands back on the settings page with a short-lived authorization_code
// (?authorization_code=..., valid ~180s); this forwards it to the backend,
// which exchanges it for the merchant accessToken and activates the
// integration. 422 means the code was invalid or already expired.
export function useInstallPagarmeHub() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (authorizationCode: string) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return integrationService.installPagarmeHub(storeId, authorizationCode, token)
    },
    onSuccess: () => {
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: integrationKeys.list(storeId) })
      }
    },
  })
}
