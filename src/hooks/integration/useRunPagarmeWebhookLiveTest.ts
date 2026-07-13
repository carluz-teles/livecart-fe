"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import { integrationKeys } from "./useIntegrations"
import { pagarmeWebhookStatusKeys } from "./usePagarmeWebhookStatus"
import type { PagarmeWebhookLiveTest } from "@/types"

// Triggers the REAL end-to-end webhook test: creates a throwaway PIX order so
// Pagar.me fires a real webhook to the configured endpoint, then confirms the
// delivery. A mutation (side effect) that can take up to ~20s to resolve.
export function useRunPagarmeWebhookLiveTest(integrationId: string | null) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation<PagarmeWebhookLiveTest, Error, void>({
    mutationFn: async () => {
      const token = await getToken()
      return integrationService.runPagarmeWebhookLiveTest(storeId!, integrationId!, token)
    },
    onSuccess: (result) => {
      // A delivered test flips the integration's webhook status to "active"
      // (the receiver stamps the ping) and lands in the delivery history —
      // refresh both so the UI reflects it without a page reload.
      if (result.delivered && storeId) {
        queryClient.invalidateQueries({ queryKey: integrationKeys.list(storeId) })
        queryClient.invalidateQueries({ queryKey: pagarmeWebhookStatusKeys.all })
      }
    },
  })
}
