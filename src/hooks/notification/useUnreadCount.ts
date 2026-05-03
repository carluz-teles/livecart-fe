"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { notificationInboxService } from "@/services/api/notification-inbox.service"
import { notificationKeys } from "./useNotifications"
import type { UnreadCountResponse } from "@/types/notification-inbox.types"

// Polled count for the bell badge. 30s strikes a balance between freshness and
// load — the user can also pull-to-refresh by opening the dropdown.
export function useUnreadCount() {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async (): Promise<UnreadCountResponse> => {
      const token = await getToken()
      return notificationInboxService.unreadCount(token)
    },
    enabled: isLoaded && isSignedIn,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}
