import { apiClient } from "./client"
import { buildQueryString } from "@/lib/query"
import type {
  ListNotificationsResponse,
  ListNotificationsParams,
  UnreadCountResponse,
} from "@/types/notification-inbox.types"

export const notificationInboxService = {
  list: (params?: ListNotificationsParams, token?: string | null) => {
    const query = buildQueryString({
      pagination: params?.pagination,
      filters: { unreadOnly: params?.unreadOnly },
    })
    return apiClient.get<ListNotificationsResponse>(`/notifications${query}`, token)
  },

  unreadCount: (token?: string | null) =>
    apiClient.get<UnreadCountResponse>("/notifications/unread-count", token),

  markRead: (id: string, token?: string | null) =>
    apiClient.post<void>(`/notifications/${id}/read`, {}, token),

  markAllRead: (token?: string | null) =>
    apiClient.post<void>("/notifications/read-all", {}, token),
}
