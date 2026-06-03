"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { uploadService } from "@/services/api/upload.service"
import { useStoreId } from "@/hooks/useUser"
import type { CreateInstagramPostPayload } from "@/types/event.types"
import { eventKeys } from "./useEvents"

type CreateReelArgs = { file: File } & Omit<CreateInstagramPostPayload, "imageUrl">

/**
 * Publishes a Reel by streaming the video to the backend, which uploads it
 * directly to Instagram, then creates the bound post event.
 */
export function useCreateInstagramReel() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, ...rest }: CreateReelArgs) => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      const fd = new FormData()
      fd.append("file", file)
      if (rest.caption) fd.append("caption", rest.caption)
      if (rest.title) fd.append("title", rest.title)
      fd.append("productIds", JSON.stringify(rest.productIds))
      if (rest.startsAt) fd.append("startsAt", rest.startsAt)
      if (rest.endsAt) fd.append("endsAt", rest.endsAt)
      if (rest.cartExpirationMinutes != null)
        fd.append("cartExpirationMinutes", String(rest.cartExpirationMinutes))
      if (rest.cartMaxQuantityPerItem != null)
        fd.append("cartMaxQuantityPerItem", String(rest.cartMaxQuantityPerItem))
      return uploadService.createInstagramReel(storeId, fd, token!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventKeys.stats(storeId!) })
    },
  })
}
