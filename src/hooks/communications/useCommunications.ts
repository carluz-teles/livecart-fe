"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"

import { notificationService } from "@/services/api/notification.service"
import { useStore } from "@/hooks/store/useStore"
import { NOTIFICATION_META, NOTIFICATION_ORDER } from "@/lib/communications"
import type { CartSettings, Store } from "@/types/store.types"
import type {
  NotificationSettings,
  NotificationType,
  TemplateSettings,
} from "@/types/notification.types"

import { communicationsKeys } from "./keys"

export interface CommunicationCard {
  type: NotificationType
  title: string
  description: string
  triggerLabel: string
  enabled: boolean
  template: string
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
    const tpl = pickTemplate(settingsQuery.data, type)
    return {
      type,
      title: meta.title,
      description: meta.description,
      triggerLabel: meta.triggerLabel(cartSettings ?? {}),
      enabled: tpl?.enabled ?? false,
      template: tpl?.template ?? "",
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

function pickTemplate(
  settings: NotificationSettings | undefined,
  type: NotificationType,
): TemplateSettings | null {
  if (!settings) return null
  switch (type) {
    case "checkout_immediate":
      return settings.checkout_immediate
    case "item_added":
      return settings.item_added
    case "checkout_reminder":
      return settings.checkout_reminder
  }
}

