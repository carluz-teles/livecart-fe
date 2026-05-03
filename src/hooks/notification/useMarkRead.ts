"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { notificationInboxService } from "@/services/api/notification-inbox.service"
import { notificationKeys } from "./useNotifications"

export function useMarkRead() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const token = await getToken()
      return notificationInboxService.markRead(id, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useMarkAllRead() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const token = await getToken()
      return notificationInboxService.markAllRead(token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
