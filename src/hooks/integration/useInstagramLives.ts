"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import type { InstagramLivesResponse } from "@/types"

export const instagramLivesKeys = {
  all: ["instagram", "lives"] as const,
  list: (storeId: string) => [...instagramLivesKeys.all, storeId] as const,
}

/**
 * Lives no ar da conta do Instagram.
 *
 * `enabled` existe porque este hook consulta a Graph API a cada 30 segundos, e
 * antes rodava em toda página que MONTAVA o formulário de sessão — inclusive com
 * o diálogo fechado, re-renderizando o componente sozinho a cada meio minuto e
 * gastando cota da Meta para uma tela que ninguém está vendo.
 */
export function useInstagramLives({ enabled = true }: { enabled?: boolean } = {}) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: instagramLivesKeys.list(storeId ?? ""),
    queryFn: async (): Promise<InstagramLivesResponse> => {
      const token = await getToken()
      return integrationService.getInstagramLives(storeId!, token)
    },
    enabled: enabled && isLoaded && isSignedIn && !storeLoading && !!storeId,
    // Só fica sondando quando alguém está olhando.
    refetchInterval: enabled ? 30000 : false,
    staleTime: 10000, // Consider data stale after 10 seconds
  })
}
