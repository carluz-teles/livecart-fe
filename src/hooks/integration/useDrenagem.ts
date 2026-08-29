"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"

import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import type { DrainReport } from "@/types"

import { integrationKeys } from "./useIntegrations"

export const drenagemKeys = {
  all: [...integrationKeys.all, "drenagem"] as const,
  pendente: (storeId: string) => [...drenagemKeys.all, storeId] as const,
}

/**
 * Quanto ainda falta drenar. É o ensaio do backend (`dryRun`), que não escreve
 * nada e devolve o trabalho TOTAL pendente.
 *
 * É ele que decide se o painel aparece: quando a resposta vem com zero
 * carrinhos, a migração acabou e a tela some sozinha. Um painel de migração que
 * precisa de um segundo deploy para sair fica esquecido em produção.
 *
 * Sem refetch automático: cada passada lê o banco da loja, e o número só muda
 * quando alguém aperta o botão — quem invalida é a própria mutação.
 */
export function useDrenagemPendente({ enabled = true }: { enabled?: boolean } = {}) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: drenagemKeys.pendente(storeId ?? ""),
    queryFn: async (): Promise<DrainReport> => {
      const token = await getToken()
      return integrationService.drainLegacyReservations(storeId!, { dryRun: true }, token)
    },
    enabled: enabled && isLoaded && isSignedIn && !storeLoading && !!storeId,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })
}

/**
 * Roda uma passada DE VERDADE, em lote.
 *
 * Escreve no ERP e não tem volta: para cada carrinho cria o pedido de venda e
 * só então devolve a saída manual. `limite` existe para a primeira passada ser
 * pequena o bastante para conferir no Tiny antes de soltar o resto.
 */
export function useDrenar() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (limite: number): Promise<DrainReport> => {
      const token = await getToken()
      return integrationService.drainLegacyReservations(
        storeId!,
        { dryRun: false, limite },
        token,
      )
    },
    onSuccess: () => {
      // O que sobrou mudou; e se zerou, o painel se despede.
      void qc.invalidateQueries({ queryKey: drenagemKeys.all })
    },
  })
}
