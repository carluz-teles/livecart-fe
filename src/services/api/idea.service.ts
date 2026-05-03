import { apiClient } from "./client"
import { buildQueryString } from "@/lib/query"
import type {
  IdeaCategory,
  IdeaDetail,
  IdeaListItem,
  ListIdeasParams,
  ListIdeasResponse,
  CreateIdeaPayload,
  CreateCommentPayload,
  IdeaCommentNode,
  ToggleVoteResponse,
} from "@/types/idea.types"

export const ideaService = {
  list: (params?: ListIdeasParams, token?: string | null) => {
    const query = buildQueryString({
      pagination: params?.pagination,
      filters: {
        tab: params?.tab,
        category: params?.category,
        q: params?.q,
        sort: params?.sort,
      },
    })
    return apiClient.get<ListIdeasResponse>(`/ideas${query}`, token)
  },

  getById: (id: string, token?: string | null) =>
    apiClient.get<IdeaDetail>(`/ideas/${id}`, token),

  create: (payload: CreateIdeaPayload, token?: string | null) =>
    apiClient.post<IdeaListItem>("/ideas/", payload, token),

  toggleVote: (id: string, token?: string | null) =>
    apiClient.post<ToggleVoteResponse>(`/ideas/${id}/vote`, {}, token),

  createComment: (id: string, payload: CreateCommentPayload, token?: string | null) =>
    apiClient.post<IdeaCommentNode>(`/ideas/${id}/comments`, payload, token),

  listCategories: (token?: string | null) =>
    apiClient.get<IdeaCategory[]>("/idea-categories", token),
}
