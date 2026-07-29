import type { PaginationResponse, Pagination } from "./api.types"

export type NotificationType =
  | "idea_comment"
  | "idea_reply"
  | "idea_status_change"
  // Fato de PEDIDO: a loja cancelou o carrinho e o pagamento entrou assim
  // mesmo — o cancelamento foi revertido e o pedido seguiu o fluxo normal.
  | "order_cancellation_reverted"

export interface InboxNotification {
  id: string
  type: NotificationType
  ideaId?: string
  // Âncora dos fatos de pedido (o pedido É o carrinho): leva para /orders/{id}.
  cartId?: string
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
