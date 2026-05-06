"use client"

import { notFound, useParams } from "next/navigation"

import { NotificationEditor } from "@/components/communications/NotificationEditor"
import { NOTIFICATION_TYPES, type NotificationType } from "@/types/notification.types"

export default function CommunicationDetailPage() {
  const params = useParams<{ type: string }>()
  const type = params?.type

  if (!type || !NOTIFICATION_TYPES.includes(type as NotificationType)) {
    notFound()
  }

  return <NotificationEditor type={type as NotificationType} />
}
