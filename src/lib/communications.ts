import { ShoppingCart, Plus, Clock, type LucideIcon } from "lucide-react"

import type { NotificationType } from "@/types/notification.types"

interface NotificationMeta {
  type: NotificationType
  title: string
  description: string
  triggerLabel: (cartSettings: {
    realTimeCart?: boolean
    sendExpirationReminder?: boolean
    expirationReminderMinutes?: number
  }) => string
  Icon: LucideIcon
}

export const NOTIFICATION_META: Record<NotificationType, NotificationMeta> = {
  checkout_immediate: {
    type: "checkout_immediate",
    title: "Carrinho criado",
    description: "Disparada quando o cliente adiciona o primeiro item ao carrinho.",
    triggerLabel: () => "Quando o cliente cria um novo carrinho",
    Icon: ShoppingCart,
  },
  item_added: {
    type: "item_added",
    title: "Itens adicionados",
    description: "Disparada toda vez que o cliente adiciona mais itens ao carrinho.",
    triggerLabel: () => "Quando o cliente adiciona mais itens",
    Icon: Plus,
  },
  checkout_reminder: {
    type: "checkout_reminder",
    title: "Lembrete de expiração",
    description: "Avise o cliente antes do carrinho expirar e recupere vendas.",
    triggerLabel: ({ expirationReminderMinutes }) =>
      `${expirationReminderMinutes ?? 15} minutos antes do carrinho expirar`,
    Icon: Clock,
  },
}

export const NOTIFICATION_ORDER: NotificationType[] = [
  "checkout_immediate",
  "item_added",
  "checkout_reminder",
]
