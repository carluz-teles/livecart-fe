"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import type { PagarmeWebhookStatus } from "@/types"

export const pagarmeWebhookStatusKeys = {
  all: ["pagarme-webhook-status"] as const,
  byIntegration: (storeId: string, integrationId: string) =>
    [...pagarmeWebhookStatusKeys.all, storeId, integrationId] as const,
}

// Hits Pagar.me's hooks-history endpoint to confirm the merchant registered
// our webhook URL. Gated by `enabled` because the call is provider-specific
// and only meaningful while the Pagar.me details sheet is open.
export function usePagarmeWebhookStatus(integrationId: string | null, enabled = true) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery<PagarmeWebhookStatus>({
    queryKey: pagarmeWebhookStatusKeys.byIntegration(storeId ?? "", integrationId ?? ""),
    queryFn: async () => {
      const token = await getToken()
      return integrationService.getPagarmeWebhookStatus(storeId!, integrationId!, token)
    },
    enabled:
      enabled &&
      isLoaded &&
      isSignedIn &&
      !storeLoading &&
      !!storeId &&
      !!integrationId,
    staleTime: 30 * 1000,
  })
}
