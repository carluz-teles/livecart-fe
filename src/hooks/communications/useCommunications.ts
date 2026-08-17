"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"

import { notificationService } from "@/services/api/notification.service"
import { useStore } from "@/hooks/store/useStore"
import {
  NOTIFICATION_META,
  NOTIFICATION_ORDER,
  type NotificationChannel,
} from "@/lib/communications"
import type { CartSettings, Store } from "@/types/store.types"
import type {
  NotificationSettings,
  NotificationType,
} from "@/types/notification.types"

import { communicationsKeys } from "./keys"

export interface CommunicationCard {
  type: NotificationType
  channel: NotificationChannel
  title: string
  description: string
  triggerLabel: string
  enabled: boolean
  // Compact text snippet for the list. For IG DM = first line of template,
  // for email = subject (or empty when merchant hasn't customized).
  snippet: string
  Icon: typeof NOTIFICATION_META[NotificationType]["Icon"]
}

interface UseCommunicationsResult {
  isLoading: boolean
  cards: CommunicationCard[]
  cartSettings?: CartSettings
  store?: Store
}

export function useCommunications(): UseCommunicationsResult {
  const { getToken } = useAuth()
  const storeQuery = useStore()
  const storeId = storeQuery.data?.id

  const settingsQuery = useQuery<NotificationSettings>({
    queryKey: [...communicationsKeys.settings(), storeId ?? ""],
    queryFn: async () => {
      const token = await getToken()
      return notificationService.getSettings(storeId!, token)
    },
    enabled: !!storeId,
  })

  const cartSettings = storeQuery.data?.cartSettings

  const cards: CommunicationCard[] = NOTIFICATION_ORDER.map((type) => {
    const meta = NOTIFICATION_META[type]
    const { enabled, snippet } = pickCardSummary(settingsQuery.data, type)
    return {
      type,
      channel: meta.channel,
      title: meta.title,
      description: meta.description,
      triggerLabel: meta.triggerLabel(cartSettings ?? {}),
      enabled,
      snippet,
      Icon: meta.Icon,
    }
  })

  return {
    isLoading: storeQuery.isLoading || settingsQuery.isLoading,
    cards,
    cartSettings,
    store: storeQuery.data,
  }
}

function pickCardSummary(
  settings: NotificationSettings | undefined,
  type: NotificationType,
): { enabled: boolean; snippet: string } {
  if (!settings) return { enabled: false, snippet: "" }
  switch (type) {
    case "checkout_immediate":
      return summaryFromTemplate(settings.checkout_immediate)
    case "item_added":
      return summaryFromTemplate(settings.item_added)
    case "checkout_reminder":
      return summaryFromTemplate(settings.checkout_reminder)
    case "out_of_window_scheduled":
      return summaryFromTemplate(settings.out_of_window_scheduled)
    case "out_of_window_session_ended":
      return summaryFromTemplate(settings.out_of_window_session_ended)
    case "out_of_window_event_ended":
      return summaryFromTemplate(settings.out_of_window_event_ended)
    case "event_deadline_started":
      return summaryFromTemplate(settings.event_deadline_started)
    case "waitlist_joined":
      return summaryFromTemplate(settings.waitlist_joined)
    case "waitlist_unfulfilled":
      return summaryFromTemplate(settings.waitlist_unfulfilled)
    case "payment_confirmed":
      return summaryFromEmail(settings.payment_confirmed)
    case "payment_cancelled":
      return summaryFromEmail(settings.payment_cancelled)
    case "payment_refunded":
      return summaryFromEmail(settings.payment_refunded)
  }
}

function summaryFromTemplate(t?: { enabled: boolean; template: string } | null) {
  if (!t) return { enabled: false, snippet: "" }
  return { enabled: t.enabled, snippet: firstLine(t.template) }
}

function summaryFromEmail(
  e?: { enabled: boolean; subject: string; body_html: string } | null,
) {
  if (!e) return { enabled: false, snippet: "" }
  return { enabled: e.enabled, snippet: e.subject }
}

function firstLine(s: string): string {
  const i = s.indexOf("\n")
  return i === -1 ? s : s.slice(0, i)
}
