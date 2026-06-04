"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { uploadService } from "@/services/api/upload.service"
import { useStoreId } from "@/hooks/useUser"
import type { CreateInstagramPostPayload } from "@/types/event.types"
import { eventKeys } from "./useEvents"

type CreateStoryArgs = { file: File; onProgress?: (percent: number) => void } & Omit<
  CreateInstagramPostPayload,
  "imageUrl"
>

/**
 * Publishes a Story (photo or video) by streaming the file to the backend, which
 * publishes it to Instagram and creates the bound story event (24h window,
 * purchase intent captured via DM replies). onProgress reports the upload
 * (0–100); once it reaches 100 the server processes the Story.
 */
export function useCreateInstagramStory() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, onProgress, ...rest }: CreateStoryArgs) => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      const fd = new FormData()
      fd.append("file", file)
      if (rest.title) fd.append("title", rest.title)
      fd.append("productIds", JSON.stringify(rest.productIds))
      if (rest.cartExpirationMinutes != null)
        fd.append("cartExpirationMinutes", String(rest.cartExpirationMinutes))
      if (rest.cartMaxQuantityPerItem != null)
        fd.append("cartMaxQuantityPerItem", String(rest.cartMaxQuantityPerItem))
      if (rest.idempotencyKey) fd.append("idempotencyKey", rest.idempotencyKey)
      return uploadService.createInstagramStory(storeId, fd, token!, onProgress)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventKeys.stats(storeId!) })
    },
    // Surfaced by the global MutationCache so the success toast fires even if the
    // merchant closed the dialog before publishing finished.
    meta: {
      successMessage: "Story publicado no Instagram!",
      successDescription: "O evento já está ativo — as respostas por DM viram carrinho.",
    },
  })
}
