import {
  ShoppingCart,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Undo2,
  CalendarClock,
  MessageSquareOff,
  DoorClosed,
  Timer,
  BellRing,
  HeartCrack,
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
  // ===========================================================================
  // Os cinco gatilhos da RN-28 (+ waitlist_notified, que existia no domínio e
  // não existia em UI nenhuma). Todos por Instagram DM.
  // ===========================================================================
  out_of_window_scheduled: {
    type: "out_of_window_scheduled",
    channel: "instagram_dm",
    title: "Comentou antes da campanha abrir",
    description:
      "Quem comenta antes do início recebe a data de abertura em vez de ficar sem resposta.",
    triggerLabel: () => "Quando o comentário chega antes do início da campanha",
    Icon: CalendarClock,
  },
  out_of_window_session_ended: {
    type: "out_of_window_session_ended",
    channel: "instagram_dm",
    title: "Comentou em transmissão encerrada",
    description:
      "A campanha continua aberta, mas aquela transmissão já acabou. Avisa e aponta para as outras.",
    triggerLabel: () => "Quando a sessão acabou e a campanha segue aberta",
    Icon: MessageSquareOff,
  },
  out_of_window_event_ended: {
    type: "out_of_window_event_ended",
    channel: "instagram_dm",
    title: "Comentou depois da campanha fechar",
    description: "Evita o descarte silencioso: o comprador sabe que a promoção terminou.",
    triggerLabel: () => "Quando o comentário chega com a campanha já encerrada",
    Icon: DoorClosed,
  },
  event_deadline_started: {
    type: "event_deadline_started",
    channel: "instagram_dm",
    title: "Campanha encerrada, o prazo começou",
    description:
      "O momento de maior impacto em conversão: o relógio para finalizar começa a correr agora.",
    triggerLabel: () => "Quando a campanha fecha e o prazo de pagamento arma",
    Icon: Timer,
  },
  waitlist_notified: {
    type: "waitlist_notified",
    channel: "instagram_dm",
    title: "Produto liberou para quem esperava",
    description:
      "Quem estava na fila é promovido e ganha o prazo extra configurado no evento.",
    triggerLabel: () => "Quando o produto libera para quem estava na fila",
    Icon: BellRing,
  },
  waitlist_unfulfilled: {
    type: "waitlist_unfulfilled",
    channel: "instagram_dm",
    title: "Não conseguimos liberar o produto",
    description:
      "A campanha fechou e o item da fila nunca liberou. Sem esta mensagem, a espera termina em silêncio.",
    triggerLabel: () => "Quando a fila fecha sem o produto ter liberado",
    Icon: HeartCrack,
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
  "event_deadline_started",
  "checkout_reminder",
  "out_of_window_scheduled",
  "out_of_window_session_ended",
  "out_of_window_event_ended",
  "waitlist_notified",
  "waitlist_unfulfilled",
  "payment_confirmed",
  "payment_cancelled",
  "payment_refunded",
]

export const CART_NOTIFICATION_ORDER: NotificationType[] = [
  "checkout_immediate",
  "item_added",
  "event_deadline_started",
  "checkout_reminder",
  "out_of_window_scheduled",
  "out_of_window_session_ended",
  "out_of_window_event_ended",
  "waitlist_notified",
  "waitlist_unfulfilled",
]

export const POST_PAYMENT_NOTIFICATION_ORDER: NotificationType[] = [
  "payment_confirmed",
  "payment_cancelled",
  "payment_refunded",
]
