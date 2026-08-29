"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"

import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import type { CartJoinLink, JoinCandidate } from "@/types"

import { integrationKeys } from "./useIntegrations"

export const joinKeys = {
  all: [...integrationKeys.all, "join"] as const,
  candidates: (storeId: string, cartId: string) =>
    [...joinKeys.all, "candidates", storeId, cartId] as const,
  link: (storeId: string, cartId: string) => [...joinKeys.all, "link", storeId, cartId] as const,
}

/** Os pedidos que podem ser juntados a este. */
export function useJoinCandidates(cartId: string, { enabled = true } = {}) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading } = useStoreId()

  return useQuery({
    queryKey: joinKeys.candidates(storeId ?? "", cartId),
    queryFn: async (): Promise<JoinCandidate[]> => {
      const token = await getToken()
      return integrationService.listJoinCandidates(storeId!, cartId, token)
    },
    enabled: enabled && isLoaded && isSignedIn && !isLoading && !!storeId && !!cartId,
    staleTime: 30 * 1000,
  })
}

/** De que lado da junção este pedido está. */
export function useCartJoinLink(cartId: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading } = useStoreId()

  return useQuery({
    queryKey: joinKeys.link(storeId ?? "", cartId),
    queryFn: async (): Promise<CartJoinLink> => {
      const token = await getToken()
      return integrationService.getCartJoinLink(storeId!, cartId, token)
    },
    enabled: isLoaded && isSignedIn && !isLoading && !!storeId && !!cartId,
  })
}

/**
 * Junta dois pedidos num só no ERP.
 *
 * Invalida tudo do pedido depois: a junção muda a grade que subiu para o Tiny,
 * o extrato de cobranças e o vínculo — e deixar cache velho na tela faria o
 * lojista achar que não funcionou.
 */
export function useJoinOrders() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vars: {
      cartAId: string
      cartBId: string
      confirmDifferentBuyers?: boolean
    }) => {
      const token = await getToken()
      return integrationService.joinOrders(storeId!, vars, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: joinKeys.all })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}
