"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { ideaService } from "@/services/api/idea.service"
import { ideaKeys } from "./useIdeas"
import type { CreateIdeaPayload, IdeaListItem } from "@/types/idea.types"

export function useCreateIdea() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateIdeaPayload): Promise<IdeaListItem> => {
      const token = await getToken()
      return ideaService.create(payload, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ideaKeys.lists() })
    },
  })
}
