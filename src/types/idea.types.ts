import type { PaginationResponse, Pagination } from "./api.types"

export type IdeaStatus =
  | "aberta"
  | "em_estudo"
  | "em_desenvolvimento"
  | "concluida"
  | "recusada"

export type IdeaTab = "all" | "new" | "mine" | "under_study" | "completed"
export type IdeaSort = "trending" | "new"

export interface IdeaCategory {
  slug: string
  label: string
}

export interface IdeaListItem {
  id: string
  number: number
  title: string
  description: string
  category: string
  categoryLabel: string
  status: IdeaStatus
  authorId: string
  authorName: string
  voteCount: number
  commentCount: number
  votedByMe: boolean
  isAuthor: boolean
  createdAt: string
}

export interface IdeaCommentNode {
  id: string
  body: string
  authorId: string
  authorName: string
  createdAt: string
  replies: IdeaCommentNode[]
}

export interface IdeaDetail extends IdeaListItem {
  comments: IdeaCommentNode[]
}

export interface ListIdeasParams {
  tab?: IdeaTab
  category?: string
  q?: string
  sort?: IdeaSort
  pagination?: Pagination
}

export interface ListIdeasResponse {
  data: IdeaListItem[]
  pagination: PaginationResponse
}

export interface CreateIdeaPayload {
  title: string
  description: string
  category: string
}

export interface CreateCommentPayload {
  body: string
  parentCommentId?: string
}

export interface ToggleVoteResponse {
  voteCount: number
  votedByMe: boolean
}
