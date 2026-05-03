"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { notificationInboxService } from "@/services/api/notification-inbox.service"
import type {
  ListNotificationsParams,
  ListNotificationsResponse,
} from "@/types/notification-inbox.types"

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (params?: ListNotificationsParams) =>
    [...notificationKeys.lists(), params ?? {}] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
}

export function useNotifications(params?: ListNotificationsParams) {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: async (): Promise<ListNotificationsResponse> => {
      const token = await getToken()
      return notificationInboxService.list(params, token)
    },
    enabled: isLoaded && isSignedIn,
  })
}
