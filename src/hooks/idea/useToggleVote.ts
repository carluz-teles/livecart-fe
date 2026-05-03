"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { ideaService } from "@/services/api/idea.service"
import { ideaKeys } from "./useIdeas"
import type {
  IdeaDetail,
  IdeaListItem,
  ListIdeasResponse,
  ToggleVoteResponse,
} from "@/types/idea.types"

// Optimistic vote toggle: flips voted_by_me and bumps voteCount immediately
// across all cached lists and the detail query, then reconciles with the server
// response. Rolls back on error.
export function useToggleVote(ideaId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<ToggleVoteResponse> => {
      const token = await getToken()
      return ideaService.toggleVote(ideaId, token)
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ideaKeys.all })

      const previousLists = queryClient.getQueriesData<ListIdeasResponse>({
        queryKey: ideaKeys.lists(),
      })
      const previousDetail = queryClient.getQueryData<IdeaDetail>(ideaKeys.detail(ideaId))

      const flip = (it: IdeaListItem): IdeaListItem =>
        it.id === ideaId
          ? {
              ...it,
              votedByMe: !it.votedByMe,
              voteCount: it.votedByMe ? it.voteCount - 1 : it.voteCount + 1,
            }
          : it

      previousLists.forEach(([key, data]) => {
        if (!data) return
        queryClient.setQueryData<ListIdeasResponse>(key, {
          ...data,
          data: data.data.map(flip),
        })
      })

      if (previousDetail) {
        queryClient.setQueryData<IdeaDetail>(ideaKeys.detail(ideaId), {
          ...previousDetail,
          votedByMe: !previousDetail.votedByMe,
          voteCount: previousDetail.votedByMe
            ? previousDetail.voteCount - 1
            : previousDetail.voteCount + 1,
        })
      }

      return { previousLists, previousDetail }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previousLists.forEach(([key, data]) => queryClient.setQueryData(key, data))
      if (ctx?.previousDetail) {
        queryClient.setQueryData(ideaKeys.detail(ideaId), ctx.previousDetail)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ideaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ideaKeys.detail(ideaId) })
    },
  })
}
