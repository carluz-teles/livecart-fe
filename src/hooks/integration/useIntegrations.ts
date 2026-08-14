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
    // Enquanto uma varredura do ERP roda, a lista se reconsulta sozinha: é ela
    // que destrava os botões de sincronizar quando o trabalho acaba. Sem isso o
    // lojista ficaria com o botão desabilitado até recarregar a página na mão,
    // sem saber que já podia clicar.
    refetchInterval: (query) =>
      query.state.data?.data?.some((i) => i.erpResyncRunning) ? 30_000 : false,
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
  const { data } = useIntegrations()
  const erp = data?.data?.find((i) => i.type === "erp" && i.status === "active")
  return { running: Boolean(erp?.erpResyncRunning), integrationId: erp?.id }
}
