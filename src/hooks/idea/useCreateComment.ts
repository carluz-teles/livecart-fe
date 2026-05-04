"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth, useUser } from "@clerk/nextjs"

import { ideaService } from "@/services/api/idea.service"
import { insertCommentInTree } from "@/lib/idea-comments"
import { ideaKeys } from "./keys"
import type {
  CreateCommentPayload,
  IdeaCommentNode,
  IdeaDetail,
} from "@/types/idea.types"

interface MutationContext {
  previousDetail: IdeaDetail | undefined
}

export function useCreateComment(ideaId: string) {
  const { getToken } = useAuth()
  const { user } = useUser()
  const queryClient = useQueryClient()

  return useMutation<
    IdeaCommentNode,
    Error,
    CreateCommentPayload,
    MutationContext
  >({
    mutationFn: async (payload) => {
      const token = await getToken()
      return ideaService.createComment(ideaId, payload, token)
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ideaKeys.detail(ideaId) })

      const previousDetail = queryClient.getQueryData<IdeaDetail>(
        ideaKeys.detail(ideaId),
      )

      if (previousDetail) {
        const optimistic: IdeaCommentNode = {
          id: `temp-${Date.now()}`,
          body: payload.body,
          authorId: user?.id ?? "self",
          authorName:
            user?.fullName ||
            user?.primaryEmailAddress?.emailAddress ||
            "Você",
          createdAt: new Date().toISOString(),
          replies: [],
        }

        queryClient.setQueryData<IdeaDetail>(ideaKeys.detail(ideaId), {
          ...previousDetail,
          commentCount: previousDetail.commentCount + 1,
          comments: insertCommentInTree(
            previousDetail.comments,
            payload.parentCommentId,
            optimistic,
          ),
        })
      }

      return { previousDetail }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousDetail) {
        queryClient.setQueryData(ideaKeys.detail(ideaId), ctx.previousDetail)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ideaKeys.detail(ideaId) })
      queryClient.invalidateQueries({ queryKey: ideaKeys.lists() })
    },
  })
}
