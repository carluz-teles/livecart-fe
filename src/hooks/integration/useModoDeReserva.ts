"use client"

import { useState } from "react"
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
    mutationFn: async ({
      modo,
      confirmoQueOErpReserva,
    }: {
      modo: ModoDeReserva
      confirmoQueOErpReserva?: boolean
    }): Promise<ModoDeReservaResponse> => {
      const token = await getToken()
      return integrationService.setModoDeReserva(
        storeId!,
        integrationId!,
        modo,
        token,
        confirmoQueOErpReserva,
      )
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

/**
 * A TROCA de modo, com a confirmação que ela passou a exigir.
 *
 * Antes o modo era só um retrato: nada no fluxo do pedido o lia. Agora ele
 * decide QUANDO o pedido nasce no ERP, e sair do modo em que o ERP reserva tira
 * de cena quem hoje segura a peça durante a live. Um clique sem confirmação
 * numa escolha desse tamanho é a diferença entre configurar e descobrir depois.
 *
 * Confirma só na direção que TIRA a reserva do ERP. O caminho inverso — ligar a
 * reserva nativa — não precisa de aviso: ele adiciona uma trava, não remove.
 */
export function useTrocaDeModoDeReserva(
  integrationId: string | undefined,
  retrato: ModoDeReservaResponse | undefined
) {
  const definir = useDefinirModoDeReserva(integrationId)
  const [aConfirmar, setAConfirmar] = useState<ModoDeReserva | null>(null)

  const pedir = (modo: ModoDeReserva) => {
    if (modo === retrato?.modo) return // já é o escolhido

    // Sair do modo em que o ERP reserva tira de cena quem hoje segura a peça.
    const perdeReservaDoERP = modo === "local" && retrato?.modoEfetivo === "nativa"

    // Entrar no modo nativo SEM termos visto o ERP segurando é uma declaração
    // do lojista: "eu liguei a Reserva lá". Ele pode estar certo — a
    // configuração é dele, no ERP dele, e nós não conseguimos consultá-la —
    // mas a escolha precisa ser consciente, porque a partir dela o LiveCart
    // para de segurar a peça.
    const assumeSemObservacao =
      modo === "nativa" && retrato?.capacidadeConfirmada === false

    if (perdeReservaDoERP || assumeSemObservacao) {
      setAConfirmar(modo)
      return
    }
    definir.mutate({ modo })
  }

  const confirmar = () => {
    if (!aConfirmar) return
    definir.mutate({
      modo: aConfirmar,
      // Só a entrada no nativo carrega a declaração.
      confirmoQueOErpReserva: aConfirmar === "nativa",
    })
    setAConfirmar(null)
  }

  return {
    pedir,
    confirmar,
    cancelar: () => setAConfirmar(null),
    aConfirmar,
    salvando: definir.isPending,
  }
}
