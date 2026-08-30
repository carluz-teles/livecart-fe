"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"

import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import type { ModoDeReserva, ModoDeReservaResponse } from "@/types"

import { integrationKeys } from "./useIntegrations"

export const modoDeReservaKeys = {
  all: [...integrationKeys.all, "modo-reserva"] as const,
  detail: (storeId: string, integrationId: string) =>
    [...modoDeReservaKeys.all, storeId, integrationId] as const,
}

/**
 * Lê o modo de reserva de estoque e a capacidade REAL da conta do ERP.
 *
 * Fora do refetch por foco de propósito: a resposta descreve a conta do lojista
 * no ERP, que não muda enquanto ele olha a tela, e cada checagem gasta leituras
 * da mesma cota que a live usa.
 */
export function useModoDeReserva(
  integrationId: string | undefined,
  { enabled = true }: { enabled?: boolean } = {}
) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: modoDeReservaKeys.detail(storeId ?? "", integrationId ?? ""),
    queryFn: async (): Promise<ModoDeReservaResponse> => {
      const token = await getToken()
      return integrationService.getModoDeReserva(storeId!, integrationId!, token)
    },
    enabled:
      enabled && isLoaded && isSignedIn && !storeLoading && !!storeId && !!integrationId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Grava o modo escolhido.
 *
 * O retorno da mutação é escrito direto no cache em vez de invalidar: a
 * resposta já traz o retrato completo (escolhido, efetivo e o motivo da
 * diferença), e um refetch aqui gastaria outra leitura do ERP para chegar na
 * mesma coisa.
 */
export function useDefinirModoDeReserva(integrationId: string | undefined) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (modo: ModoDeReserva): Promise<ModoDeReservaResponse> => {
      const token = await getToken()
      return integrationService.setModoDeReserva(storeId!, integrationId!, modo, token)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        modoDeReservaKeys.detail(storeId ?? "", integrationId ?? ""),
        data
      )
      // A escolha e o efeito podem divergir — e é justamente aí que o lojista
      // precisa de aviso, senão ele acha que ligou uma coisa que não ligou.
      if (data.modo !== data.modoEfetivo) {
        toast.warning("Escolha salva, mas ainda não está valendo", {
          description: data.motivo,
        })
        return
      }
      toast.success("Modo de reserva atualizado")
    },
    onError: () => {
      toast.error("Não consegui salvar o modo de reserva. Tente de novo.")
    },
  })
}
