"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import type { IntegrationListResponse } from "@/types"
import { resyncProgress } from "./resync-progress"
import { refreshProductsAfterResync } from "./resync-cache"

export const integrationKeys = {
  all: ["integrations"] as const,
  lists: () => [...integrationKeys.all, "list"] as const,
  list: (storeId: string) => [...integrationKeys.lists(), storeId] as const,
  details: () => [...integrationKeys.all, "detail"] as const,
  detail: (storeId: string, id: string) =>
    [...integrationKeys.details(), storeId, id] as const,
}

export function useIntegrations() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: integrationKeys.list(storeId ?? ""),
    queryFn: async (): Promise<IntegrationListResponse> => {
      const token = await getToken()
      const result = await integrationService.list(storeId!, token)
      const previous = queryClient.getQueryData<IntegrationListResponse>(
        integrationKeys.list(storeId!),
      )
      refreshProductsAfterResync(queryClient, storeId!, previous, result)
      return result
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
    // Poll active work frequently and discover runs started by another user.
    refetchInterval: (query) =>
      query.state.data?.data?.some((i) => i.erpResyncRunning)
        ? 5_000
        : query.state.data?.data?.some((i) => i.type === "erp" && i.status === "active") ? 30_000 : false,
  })
}

/**
 * Ponto único de "tem varredura do ERP rodando agora".
 *
 * Duas telas desabilitam botão por causa disso (o "sincronizar todos" e o sync
 * por produto). Cada uma resolvendo por conta própria é convite para elas
 * discordarem — uma bloqueia, a outra deixa passar, e o lojista dispara duas
 * varreduras sobre a mesma cota do ERP.
 */
export function useERPResyncRunning() {
  const { data, error, isPending, isFetching, refetch } = useIntegrations()
  const erp = data?.data?.find((i) => i.type === "erp" && i.status === "active")
  const progress = resyncProgress(erp)
  return {
    ...progress,
    progress,
    integrationId: erp?.id,
    integration: erp,
    error,
    isPending,
    isFetching,
    refetch,
  }
}
