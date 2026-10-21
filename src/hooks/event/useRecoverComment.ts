"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useUser } from "@/hooks/useUser"
import { eventKeys } from "./useEvents"
import type { ApiError } from "@/types/api.types"

export function useRecoverComment(eventId: string) {
  const { getToken } = useAuth()
  const { user } = useUser()
  const storeId = user?.membership?.storeId
  const role = user?.membership?.role
  const canRecover = role === "owner" || role === "admin"
  const client = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!storeId || !canRecover) throw new Error("Você não tem permissão para recuperar comentários.")
      return eventService.recoverComment(storeId, eventId, commentId, await getToken())
    },
    retry: false,
    onSettled: async () => {
      if (!storeId) return
      await Promise.all([
        client.invalidateQueries({ queryKey: eventKeys.commentsRoot(storeId, eventId) }),
        client.invalidateQueries({ queryKey: eventKeys.detailCarts(storeId, eventId) }),
        client.invalidateQueries({ queryKey: eventKeys.detailStats(storeId, eventId) }),
        client.invalidateQueries({ queryKey: eventKeys.detailProducts(storeId, eventId) }),
      ])
    },
  })
  const apiError = mutation.error as ApiError | null
  const errorMessage = mutation.error
    ? apiError?.status === 408
      ? "A confirmação demorou. Atualize os comentários antes de tentar novamente; a recuperação pode já estar em andamento."
      : apiError?.message || apiError?.error || "Não foi possível recuperar o comentário. Tente novamente."
    : null

  return { ...mutation, canRecover, errorMessage }
}
