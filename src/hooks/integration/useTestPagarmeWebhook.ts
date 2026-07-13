"use client"

import { useMutation } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import type { PagarmeWebhookTest } from "@/types"

// Triggers the loopback self-test on demand (a mutation, not a query — it has a
// side effect: an outbound HTTP call to our own endpoint). Returns the test
// result so the probe can render reachable/healthy/latency inline.
export function useTestPagarmeWebhook(integrationId: string | null) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()

  return useMutation<PagarmeWebhookTest, Error, void>({
    mutationFn: async () => {
      const token = await getToken()
      return integrationService.testPagarmeWebhook(storeId!, integrationId!, token)
    },
  })
}
