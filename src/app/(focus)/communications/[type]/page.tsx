"use client"

import { notFound, useParams } from "next/navigation"

import { NotificationEditor } from "@/components/communications/NotificationEditor"
import { EmailEditor } from "@/components/communications/EmailEditor"
import {
  NOTIFICATION_TYPES,
  isPostPaymentType,
  type CartNotificationType,
  type NotificationType,
  type PostPaymentNotificationType,
} from "@/types/notification.types"

export default function CommunicationDetailPage() {
  const params = useParams<{ type: string }>()
  const type = params?.type

  if (!type || !NOTIFICATION_TYPES.includes(type as NotificationType)) {
    notFound()
  }

  if (isPostPaymentType(type)) {
    return <EmailEditor type={type as PostPaymentNotificationType} />
  }
  return <NotificationEditor type={type as CartNotificationType} />
}
