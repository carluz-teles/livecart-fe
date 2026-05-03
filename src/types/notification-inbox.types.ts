import type { PaginationResponse, Pagination } from "./api.types"

export type NotificationType =
  | "idea_comment"
  | "idea_reply"
  | "idea_status_change"

export interface InboxNotification {
  id: string
  type: NotificationType
  ideaId?: string
  commentId?: string
  actorId?: string
  actorName?: string
  ideaNumber?: number
  ideaTitle?: string
  payload: Record<string, unknown>
  readAt?: string | null
  createdAt: string
}

export interface ListNotificationsResponse {
  data: InboxNotification[]
  unreadCount: number
  pagination: PaginationResponse
}

export interface UnreadCountResponse {
  count: number
}

export interface ListNotificationsParams {
  unreadOnly?: boolean
  pagination?: Pagination
}
