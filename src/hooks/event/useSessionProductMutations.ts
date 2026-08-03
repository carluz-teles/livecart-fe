"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type {
  AddSessionProductPayload,
  UpdateSessionProductPayload,
  SessionProduct,
} from "@/types/event.types"
import { eventKeys } from "./useEvents"
import { toast } from "sonner"

/**
 * Escrita na lista de produtos de UMA transmissão.
 *
 * Além da própria lista, as mutações invalidam o detalhe do evento: a contagem
 * por transmissão (`session.productCount`) vive lá e é ela que a tabela de
 * sessões usa para distinguir "vende tudo" de "restrito a N produtos".
 */
export function useAddSessionProduct(eventId: string, sessionId: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: AddSessionProductPayload): Promise<SessionProduct> => {
      const token = await getToken()
      return eventService.addSessionProduct(storeId!, eventId, sessionId, payload, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventKeys.sessionProducts(storeId!, eventId, sessionId),
      })
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(storeId!, eventId) })
      toast.success("Produto liberado nesta transmissão")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao adicionar produto")
    },
  })
}

export function useUpdateSessionProduct(eventId: string, sessionId: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      productId,
      payload,
    }: {
      productId: string
      payload: UpdateSessionProductPayload
    }): Promise<SessionProduct> => {
      const token = await getToken()
      return eventService.updateSessionProduct(
        storeId!,
        eventId,
        sessionId,
        productId,
        payload,
        token
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventKeys.sessionProducts(storeId!, eventId, sessionId),
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar produto")
    },
  })
}

export function useRemoveSessionProduct(eventId: string, sessionId: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string): Promise<void> => {
      const token = await getToken()
      return eventService.removeSessionProduct(
        storeId!,
        eventId,
        sessionId,
        productId,
        token
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventKeys.sessionProducts(storeId!, eventId, sessionId),
      })
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(storeId!, eventId) })
      toast.success("Produto removido desta transmissão")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao remover produto")
    },
  })
}
