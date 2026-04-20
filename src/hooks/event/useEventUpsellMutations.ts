"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { AddEventUpsellPayload, UpdateEventUpsellPayload, EventUpsell } from "@/types/event.types"
import { eventKeys } from "./useEvents"
import { toast } from "sonner"

/**
 * Hook to add an upsell to an event
 */
export function useAddUpsell(eventId: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: AddEventUpsellPayload): Promise<EventUpsell> => {
      const token = await getToken()
      return eventService.addUpsell(storeId!, eventId, payload, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.upsells(storeId!, eventId) })
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(storeId!, eventId) })
      toast.success("Upsell adicionado")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao adicionar upsell")
    },
  })
}

/**
 * Hook to update an upsell
 */
export function useUpdateUpsell(eventId: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      upsellId,
      payload,
    }: {
      upsellId: string
      payload: UpdateEventUpsellPayload
    }): Promise<EventUpsell> => {
      const token = await getToken()
      return eventService.updateUpsell(storeId!, eventId, upsellId, payload, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.upsells(storeId!, eventId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar upsell")
    },
  })
}

/**
 * Hook to remove an upsell
 */
export function useRemoveUpsell(eventId: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (upsellId: string): Promise<void> => {
      const token = await getToken()
      return eventService.removeUpsell(storeId!, eventId, upsellId, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.upsells(storeId!, eventId) })
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(storeId!, eventId) })
      toast.success("Upsell removido")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao remover upsell")
    },
  })
}
