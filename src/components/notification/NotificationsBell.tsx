"use client"

import { useUnreadCount } from "@/hooks/notification"
import { NotificationsDropdown } from "./NotificationsDropdown"

export function NotificationsBell() {
  const { data } = useUnreadCount()
  const count = data?.count ?? 0
  return <NotificationsDropdown unreadCount={count} />
}
