"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { ideaService } from "@/services/api/idea.service"
import { ideaKeys } from "./useIdeas"
import type { CreateCommentPayload, IdeaCommentNode } from "@/types/idea.types"

export function useCreateComment(ideaId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateCommentPayload): Promise<IdeaCommentNode> => {
      const token = await getToken()
      return ideaService.createComment(ideaId, payload, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ideaKeys.detail(ideaId) })
      queryClient.invalidateQueries({ queryKey: ideaKeys.lists() })
    },
  })
}
