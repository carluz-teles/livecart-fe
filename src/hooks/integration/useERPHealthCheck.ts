"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"

import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import type { ERPHealthCheckResponse } from "@/types"

import { integrationKeys } from "./useIntegrations"

export const erpHealthCheckKeys = {
  all: [...integrationKeys.all, "erp-health"] as const,
  detail: (storeId: string, integrationId: string) =>
    [...erpHealthCheckKeys.all, storeId, integrationId] as const,
}

interface UseERPHealthCheckOptions {
  // When the integration is disconnected we still mount the card to surface
  // the empty state, but don't burn a network request — the audit only
  // makes sense when credentials are valid.
  enabled?: boolean
}

// Fetches the ERP cadastro audit. Stays off the auto-refetch loop because
// the result reflects merchant-side state in Tiny (a button click resolves
// each row). Manual `refetch()` from the UI's "Verificar de novo" CTA is
// what drives subsequent runs.
export function useERPHealthCheck(
  integrationId: string | undefined,
  { enabled = true }: UseERPHealthCheckOptions = {}
) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: erpHealthCheckKeys.detail(storeId ?? "", integrationId ?? ""),
    queryFn: async (): Promise<ERPHealthCheckResponse> => {
      const token = await getToken()
      return integrationService.runERPHealthCheck(storeId!, integrationId!, token)
    },
    enabled:
      enabled &&
      isLoaded &&
      isSignedIn &&
      !storeLoading &&
      !!storeId &&
      !!integrationId,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 min — quick re-renders within the same view don't refetch
  })
}
