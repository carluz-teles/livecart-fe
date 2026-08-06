"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { uploadService } from "@/services/api/upload.service"
import { useStoreId } from "@/hooks/useUser"
import type { CreateInstagramPostPayload } from "@/types/event.types"
import { eventKeys } from "./useEvents"

type CreateReelArgs = { file: File; onProgress?: (percent: number) => void } & Omit<
  CreateInstagramPostPayload,
  "imageUrl"
>

/**
 * Publishes a Reel by streaming the video to the backend, which uploads it
 * directly to Instagram, then creates the bound post event. onProgress reports
 * the video upload (0–100); once it reaches 100 the server processes the Reel.
 */
export function useCreateInstagramReel() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, onProgress, ...rest }: CreateReelArgs) => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      const fd = new FormData()
      fd.append("file", file)
      // Publicar DENTRO de um evento existente: a mídia vira sessão dele.
      if (rest.eventId) fd.append("eventId", rest.eventId)
      if (rest.caption) fd.append("caption", rest.caption)
      if (rest.title) fd.append("title", rest.title)
      fd.append("productIds", JSON.stringify(rest.productIds))
      if (rest.startsAt) fd.append("startsAt", rest.startsAt)
      if (rest.endsAt) fd.append("endsAt", rest.endsAt)
      if (rest.cartExpirationMinutes != null)
        fd.append("cartExpirationMinutes", String(rest.cartExpirationMinutes))
      if (rest.cartMaxQuantityPerItem != null)
        fd.append("cartMaxQuantityPerItem", String(rest.cartMaxQuantityPerItem))
      if (rest.idempotencyKey) fd.append("idempotencyKey", rest.idempotencyKey)
      return uploadService.createInstagramReel(storeId, fd, token!, onProgress)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventKeys.stats(storeId!) })
    },
    // Surfaced by the global MutationCache so the success toast fires even if the
    // merchant closed the dialog before the Reel finished processing.
    meta: {
      successMessage: "Reel publicado no Instagram!",
      successDescription: "O evento já está ativo e capturando comentários.",
    },
  })
}
