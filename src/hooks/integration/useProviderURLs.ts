"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import type { IntegrationProvider, ProviderURLs } from "@/types"

export const providerURLsKeys = {
  all: ["integration-provider-urls"] as const,
  byProvider: (storeId: string, provider: IntegrationProvider) =>
    [...providerURLsKeys.all, storeId, provider] as const,
}

// Fetches the OAuth callback + webhook URLs the merchant has to paste into
// the provider's app. Only providers that require it (Tiny) return data —
// others 422. Pass `enabled` to gate the request to when the dialog opens.
export function useProviderURLs(provider: IntegrationProvider, enabled = true) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery<ProviderURLs>({
    queryKey: providerURLsKeys.byProvider(storeId ?? "", provider),
    queryFn: async () => {
      const token = await getToken()
      return integrationService.getProviderURLs(storeId!, provider, token)
    },
    enabled: enabled && isLoaded && isSignedIn && !storeLoading && !!storeId,
    staleTime: 5 * 60 * 1000,
  })
}
