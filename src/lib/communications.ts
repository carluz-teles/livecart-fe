import {
  ShoppingCart,
  Plus,
  CheckCircle2,
  XCircle,
  Undo2,
  CalendarClock,
  MessageSquareOff,
  DoorClosed,
  Hourglass,
  PackageCheck,
  Truck,
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
  // ===========================================================================
  // Os cinco gatilhos da RN-28 (+ waitlist_notified, que existia no domínio e
  // não existia em UI nenhuma). Todos por Instagram DM.
  // ===========================================================================
  out_of_window_scheduled: {
    type: "out_of_window_scheduled",
    channel: "instagram_dm",
    title: "Comentou antes da campanha abrir",
    description:
      "Quem comenta num post ou reel antes do início recebe a data de abertura em vez de ficar sem resposta. Vale para publicações — comentário de live só chega durante a transmissão.",
    triggerLabel: () => "Comentário em post/reel antes do início da campanha",
    Icon: CalendarClock,
  },
  out_of_window_session_ended: {
    type: "out_of_window_session_ended",
    channel: "instagram_dm",
    title: "Comentou em publicação de sessão encerrada",
    description:
      "A campanha continua aberta, mas aquela sessão já acabou. Vale para post e reel — o Instagram não permite responder comentário de uma live que terminou.",
    triggerLabel: () => "Comentário em post/reel de sessão encerrada, campanha aberta",
    Icon: MessageSquareOff,
  },
  out_of_window_event_ended: {
    type: "out_of_window_event_ended",
    channel: "instagram_dm",
    title: "Comentou depois da campanha fechar",
    description:
      "Evita o descarte silencioso: quem comenta num post ou reel depois do fim sabe que a promoção terminou. Comentário de live encerrada não pode ser respondido pelo Instagram.",
    triggerLabel: () => "Comentário em post/reel com a campanha já encerrada",
    Icon: DoorClosed,
  },
  waitlist_joined: {
    type: "waitlist_joined",
    channel: "instagram_dm",
    title: "Entrou na fila de espera",
    description:
      "O produto pedido acabou. Sem esta mensagem o comprador recebe o texto de item adicionado e acha que comprou.",
    triggerLabel: () => "Quando o estoque não cobre o pedido e o item vai para a fila",
    Icon: Hourglass,
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
  // Existiam no backend desde o início e nunca tiveram card: eram
  // inconfiguráveis pela UI (20/08/2026).
  shipped: {
    type: "shipped",
    channel: "email",
    title: "Pedido enviado",
    description: "Email com o código de rastreio assim que a etiqueta é postada.",
    triggerLabel: () => "Quando o envio é postado com rastreio",
    Icon: Truck,
  },
  delivered: {
    type: "delivered",
    channel: "email",
    title: "Pedido entregue",
    description: "Email de confirmação quando a transportadora marca a entrega.",
    triggerLabel: () => "Quando a entrega é confirmada",
    Icon: PackageCheck,
  },
}

// Removidos do catálogo em 20/08/2026 (nunca entregavam, por regra do
// Instagram — DM fora da janela de resposta):
//   • event_deadline_started ("Campanha encerrada"): DM na hora que o evento
//     fecha, tipicamente dias após o último comentário do comprador.
//   • waitlist_unfulfilled ("Não conseguimos liberar"): DM no fim da fila,
//     ainda mais tarde. Em produção: 0 entregas.
//   • checkout_reminder ("Lembrete de expiração"): com prazos de dias, o
//     lembrete cai sempre fora da janela. Em produção: nunca disparou.
// Os tipos continuam existindo no backend (compat de JSONB e rotas velhas);
// só saíram da oferta da UI.
export const NOTIFICATION_ORDER: NotificationType[] = [
  "checkout_immediate",
  "item_added",
  "out_of_window_scheduled",
  "out_of_window_session_ended",
  "out_of_window_event_ended",
  "waitlist_joined",
  "payment_confirmed",
  "payment_cancelled",
  "payment_refunded",
  "shipped",
  "delivered",
]

export const CART_NOTIFICATION_ORDER: NotificationType[] = [
  "checkout_immediate",
  "item_added",
  "out_of_window_scheduled",
  "out_of_window_session_ended",
  "out_of_window_event_ended",
  "waitlist_joined",
]

export const POST_PAYMENT_NOTIFICATION_ORDER: NotificationType[] = [
  "payment_confirmed",
  "payment_cancelled",
  "payment_refunded",
  "shipped",
  "delivered",
]
