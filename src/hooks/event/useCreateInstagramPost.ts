"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { uploadService } from "@/services/api/upload.service"
import { useStoreId } from "@/hooks/useUser"
import type { CreateInstagramPostPayload, CreateEventResponse } from "@/types/event.types"
import { eventKeys } from "./useEvents"

type CreateInstagramPostArgs = { file: File } & Omit<CreateInstagramPostPayload, "imageUrl">

/**
 * Uploads the image, publishes the Instagram post, and creates the bound post
 * event — in one mutation.
 */
export function useCreateInstagramPost() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, ...rest }: CreateInstagramPostArgs): Promise<CreateEventResponse> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      const { url } = await uploadService.uploadInstagramMedia(file, storeId, token!)
      return integrationService.createInstagramPost(storeId, { ...rest, imageUrl: url }, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventKeys.stats(storeId!) })
    },
  })
}
