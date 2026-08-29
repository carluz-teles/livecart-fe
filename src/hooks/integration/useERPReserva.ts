"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"

import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import type { ERPReservaResponse } from "@/types"

import { integrationKeys } from "./useIntegrations"

export const erpReservaKeys = {
  all: [...integrationKeys.all, "erp-reserva"] as const,
  detail: (storeId: string, integrationId: string) =>
    [...erpReservaKeys.all, storeId, integrationId] as const,
}

/**
 * Procura evidência de que o módulo de Reserva de Estoque está ativo no Tiny.
 *
 * Fora do refetch automático de propósito: a resposta descreve a conta do
 * lojista no Tiny, que não muda sozinha enquanto ele olha a tela — e cada
 * checagem gasta leituras da mesma cota que a live usa.
 */
export function useERPReserva(
  integrationId: string | undefined,
  { enabled = true }: { enabled?: boolean } = {}
) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: erpReservaKeys.detail(storeId ?? "", integrationId ?? ""),
    queryFn: async (): Promise<ERPReservaResponse> => {
      const token = await getToken()
      return integrationService.checkERPReserva(storeId!, integrationId!, token)
    },
    enabled:
      enabled && isLoaded && isSignedIn && !storeLoading && !!storeId && !!integrationId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}
