"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { AddEventProductPayload, UpdateEventProductPayload, EventWhitelistProduct } from "@/types/event.types"
import { eventKeys } from "./useEvents"
import { toast } from "sonner"

/**
 * Hook to add a product to the event whitelist
 */
export function useAddToWhitelist(eventId: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: AddEventProductPayload): Promise<EventWhitelistProduct> => {
      const token = await getToken()
      return eventService.addToWhitelist(storeId!, eventId, payload, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.whitelist(storeId!, eventId) })
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(storeId!, eventId) })
      toast.success("Produto adicionado à whitelist")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao adicionar produto")
    },
  })
}

/**
 * Hook to update a whitelist product configuration
 */
export function useUpdateWhitelistProduct(eventId: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      productId,
      payload,
    }: {
      productId: string
      payload: UpdateEventProductPayload
    }): Promise<EventWhitelistProduct> => {
      const token = await getToken()
      return eventService.updateWhitelistProduct(storeId!, eventId, productId, payload, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.whitelist(storeId!, eventId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar produto")
    },
  })
}

/**
 * Hook to remove a product from the whitelist
 */
export function useRemoveFromWhitelist(eventId: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string): Promise<void> => {
      const token = await getToken()
      return eventService.removeFromWhitelist(storeId!, eventId, productId, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.whitelist(storeId!, eventId) })
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(storeId!, eventId) })
      toast.success("Produto removido da whitelist")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao remover produto")
    },
  })
}
