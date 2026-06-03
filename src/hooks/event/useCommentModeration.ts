"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import { eventKeys } from "./useEvents"

// Shared invalidation so the comments list refreshes after any moderation action.
function useInvalidateComments(eventId: string) {
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({
      queryKey: eventKeys.detailComments(storeId ?? "", eventId),
    })
}

export function useReplyComment(eventId: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const invalidate = useInvalidateComments(eventId)

  return useMutation({
    mutationFn: async ({ commentId, text }: { commentId: string; text: string }) => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return eventService.replyComment(storeId, commentId, text, token)
    },
    onSuccess: () => {
      invalidate()
      toast.success("Resposta publicada no comentário")
    },
    onError: (err: { message?: string }) =>
      toast.error("Erro ao responder", { description: err.message }),
  })
}

export function useHideComment(eventId: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const invalidate = useInvalidateComments(eventId)

  return useMutation({
    mutationFn: async ({ commentId, hidden }: { commentId: string; hidden: boolean }) => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return eventService.hideComment(storeId, commentId, hidden, token)
    },
    onSuccess: (data) => {
      invalidate()
      toast.success(data.hidden ? "Comentário ocultado" : "Comentário reexibido")
    },
    onError: (err: { message?: string }) =>
      toast.error("Erro ao ocultar comentário", { description: err.message }),
  })
}

export function useDeleteComment(eventId: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const invalidate = useInvalidateComments(eventId)

  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return eventService.deleteComment(storeId, commentId, token)
    },
    onSuccess: () => {
      invalidate()
      toast.success("Comentário excluído")
    },
    onError: (err: { message?: string }) =>
      toast.error("Erro ao excluir comentário", { description: err.message }),
  })
}
