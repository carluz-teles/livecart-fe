import {
  ShoppingCart,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Undo2,
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
  payment_cancelled: {
    type: "payment_cancelled",
    channel: "email",
    title: "Pedido cancelado",
    description: "Email enviado quando o pagamento do pedido é cancelado.",
    triggerLabel: () => "Quando o pagamento é cancelado",
    Icon: XCircle,
  },
  payment_refunded: {
    type: "payment_refunded",
    channel: "email",
    title: "Pedido estornado",
    description: "Email de confirmação do reembolso, com o prazo por forma de pagamento.",
    triggerLabel: () => "Quando o pagamento é estornado",
    Icon: Undo2,
  },
}

export const NOTIFICATION_ORDER: NotificationType[] = [
  "checkout_immediate",
  "item_added",
  "checkout_reminder",
  "payment_confirmed",
  "payment_cancelled",
  "payment_refunded",
]

export const CART_NOTIFICATION_ORDER: NotificationType[] = [
  "checkout_immediate",
  "item_added",
  "checkout_reminder",
]

export const POST_PAYMENT_NOTIFICATION_ORDER: NotificationType[] = [
  "payment_confirmed",
  "payment_cancelled",
  "payment_refunded",
]
