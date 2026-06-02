"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { EventCart } from "@/types/event.types"
import { eventKeys } from "./useEvents"

export function useResendCartMessage(eventId: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (cartId: string): Promise<EventCart> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return eventService.resendCartMessage(storeId, eventId, cartId, token)
    },
    onSuccess: (cart) => {
      queryClient.invalidateQueries({
        queryKey: eventKeys.detailCarts(storeId ?? "", eventId),
      })
      toast.success("Mensagem reenviada", {
        description: `Link de checkout enviado para @${cart.platformHandle}`,
      })
    },
    onError: (err: { message?: string }) => {
      toast.error("Erro ao reenviar mensagem", {
        description: err.message || "Tente novamente em instantes.",
      })
    },
  })
}
