"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import type { IntegrationListResponse } from "@/types"

export const integrationKeys = {
  all: ["integrations"] as const,
  lists: () => [...integrationKeys.all, "list"] as const,
  list: (storeId: string) => [...integrationKeys.lists(), storeId] as const,
  details: () => [...integrationKeys.all, "detail"] as const,
  detail: (storeId: string, id: string) => [...integrationKeys.details(), storeId, id] as const,
}

export function useIntegrations() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: integrationKeys.list(storeId ?? ""),
    queryFn: async (): Promise<IntegrationListResponse> => {
      const token = await getToken()
      return integrationService.list(storeId!, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
