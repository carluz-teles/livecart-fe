import {
  ShoppingCart,
  Plus,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  type LucideIcon,
} from "lucide-react"

import type { NotificationType } from "@/types/notification.types"

export type NotificationChannel = "instagram_dm" | "email"

interface NotificationMeta {
  type: NotificationType
  channel: NotificationChannel
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
    channel: "instagram_dm",
    title: "Carrinho criado",
    description: "Disparada quando o cliente adiciona o primeiro item ao carrinho.",
    triggerLabel: () => "Quando o cliente cria um novo carrinho",
    Icon: ShoppingCart,
  },
  item_added: {
    type: "item_added",
    channel: "instagram_dm",
    title: "Itens adicionados",
    description: "Disparada toda vez que o cliente adiciona mais itens ao carrinho.",
    triggerLabel: () => "Quando o cliente adiciona mais itens",
    Icon: Plus,
  },
  checkout_reminder: {
    type: "checkout_reminder",
    channel: "instagram_dm",
    title: "Lembrete de expiração",
    description: "Avise o cliente antes do carrinho expirar e recupere vendas.",
    triggerLabel: ({ expirationReminderMinutes }) =>
      `${expirationReminderMinutes ?? 15} minutos antes do carrinho expirar`,
    Icon: Clock,
  },
  payment_confirmed: {
    type: "payment_confirmed",
    channel: "email",
    title: "Pagamento confirmado",
    description: "Email enviado assim que o pagamento é aprovado, com o link público do pedido.",
    triggerLabel: () => "Quando o pagamento é confirmado",
    Icon: CheckCircle2,
  },
  shipped: {
    type: "shipped",
    channel: "email",
    title: "Pedido enviado",
    description: "Email com o código de rastreio assim que o envio é criado.",
    triggerLabel: () => "Quando você cria o envio do pedido",
    Icon: Truck,
  },
  delivered: {
    type: "delivered",
    channel: "email",
    title: "Pedido entregue",
    description: "Email de agradecimento quando a entrega é confirmada.",
    triggerLabel: () => "Quando o pedido é marcado como entregue",
    Icon: PackageCheck,
  },
}

export const NOTIFICATION_ORDER: NotificationType[] = [
  "checkout_immediate",
  "item_added",
  "checkout_reminder",
  "payment_confirmed",
  "shipped",
  "delivered",
]

export const CART_NOTIFICATION_ORDER: NotificationType[] = [
  "checkout_immediate",
  "item_added",
  "checkout_reminder",
]

export const POST_PAYMENT_NOTIFICATION_ORDER: NotificationType[] = [
  "payment_confirmed",
  "shipped",
  "delivered",
]
