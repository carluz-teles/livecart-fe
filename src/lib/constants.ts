/**
 * Centralized constants for the application.
 * Use these instead of hardcoding values in components.
 */

import type { LivePlatform } from "@/types/live.types"
import type { EventStatus } from "@/types/event.types"
import type { OrderStatus, PaymentStatus } from "@/types/cart.types"
import type { BillingInterval } from "@/types/user.types"

// =============================================================================
// STATUS CONFIGURATIONS
// =============================================================================

export type BadgeVariant = "outline" | "destructive" | "secondary" | "default"

export interface StatusConfig {
  label: string
  variant: BadgeVariant
}

// `LIVE_STATUS_CONFIG` saiu daqui: era órfão e falava de "live" onde hoje o
// objeto é uma SESSÃO. Quem rotula sessão é SESSION_STATUS_CONFIG, abaixo.

export interface EventStatusConfig extends StatusConfig {
  icon: "radio" | "check-circle" | "calendar" | "instagram"
}

/**
 * Status da campanha quando ela tem transmissão ao vivo.
 */
export const EVENT_STATUS_CONFIG: Record<EventStatus, EventStatusConfig> = {
  scheduled: { label: "Agendada", variant: "outline", icon: "calendar" },
  active: { label: "No ar", variant: "destructive", icon: "radio" },
  ended: { label: "Encerrada", variant: "secondary", icon: "check-circle" },
}

/**
 * Status da campanha que só tem publicações — um post ativo não está "ao vivo".
 */
export const POST_EVENT_STATUS_CONFIG: Record<EventStatus, EventStatusConfig> = {
  scheduled: { label: "Agendada", variant: "outline", icon: "calendar" },
  active: { label: "Ativa", variant: "default", icon: "instagram" },
  ended: { label: "Encerrada", variant: "secondary", icon: "check-circle" },
}

/** Tooltip de cada status do evento (copy deck §8.2). */
export const EVENT_STATUS_HINT: Record<EventStatus, string> = {
  scheduled:
    "A campanha ainda não abriu. Comentários recebem um aviso automático em vez de virar carrinho.",
  active:
    "A campanha está vendendo. Os carrinhos ficam abertos e não expiram enquanto ela durar.",
  ended: "A campanha fechou. Os carrinhos estão com prazo correndo ou já expiraram.",
}

/**
 * Escolhe o rótulo de status a partir do que existe DENTRO da campanha.
 *
 * Antes isto recebia `event.type` — a coluna que a 000119 remove. O parâmetro
 * agora é o predicado derivado das sessões (`getEventKind(...).isPublicationOnly`),
 * então nada aqui depende do tipo do container.
 */
export function getEventStatusDisplay(
  status: EventStatus,
  isPublicationOnly = false
): EventStatusConfig {
  const map = isPublicationOnly ? POST_EVENT_STATUS_CONFIG : EVENT_STATUS_CONFIG
  return map[status] ?? map.ended
}

/** Rótulos de status de uma SESSÃO (copy deck §8.3). */
export const SESSION_STATUS_CONFIG: Record<string, StatusConfig & { hint: string }> = {
  active: {
    label: "Aguardando",
    variant: "outline",
    hint: "Sessão criada, ainda sem publicação vinculada ou sem transmissão no ar.",
  },
  live: {
    label: "Capturando",
    variant: "default",
    hint: "Os comentários desta publicação estão virando carrinho agora.",
  },
  ended: {
    label: "Encerrada",
    variant: "secondary",
    hint: "Esta sessão parou de capturar. A campanha pode continuar aberta nas outras sessões.",
  },
}

/**
 * Status do carrinho — copy deck §8.4.
 *
 * "Ativo/Checkout/Completo" era o vocabulário interno do banco vazando para a
 * tela: no modelo guarda-chuva `checkout` não significa "o cliente está
 * finalizando", significa "a campanha fechou e o prazo dele começou a correr".
 * Sem essa distinção o lojista lê o status errado exatamente no momento em que
 * a decisão depende dele.
 */
export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig & { hint: string }> = {
  active: {
    label: "Aberto",
    variant: "outline",
    hint: "Aceitando itens novos. O link de pagamento já funciona — mas ainda não há prazo correndo.",
  },
  checkout: {
    label: "Aguardando pagamento",
    variant: "secondary",
    hint: "A campanha encerrou. O cliente tem prazo para finalizar; depois disso os produtos voltam ao estoque.",
  },
  completed: {
    label: "Concluído",
    variant: "default",
    hint: "Pedido fechado. Nada mais entra neste carrinho.",
  },
  expired: {
    label: "Expirado",
    variant: "destructive",
    hint: "O prazo acabou sem pagamento. Os produtos voltaram para a loja e para a fila de espera.",
  },
  cancelled: {
    label: "Cancelado",
    variant: "destructive",
    hint: "Cancelado por você ou pelo cliente. O estoque foi devolvido.",
  },
}

/**
 * Payment status configuration
 */
export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, StatusConfig> = {
  pending: { label: "Pendente", variant: "outline" },
  paid: { label: "Pago", variant: "default" },
  failed: { label: "Falhou", variant: "destructive" },
  refunded: { label: "Reembolsado", variant: "secondary" },
  cancelled: { label: "Cancelado", variant: "secondary" },
}

/**
 * One-off badge for the buyer's first paid order on this store.
 * Variant `default` picks up the brand amber.
 */
export const FIRST_PURCHASE_BADGE: StatusConfig = {
  label: "Primeira venda",
  variant: "default",
}

// =============================================================================
// BILLING — plano Pro (fonte única dos preços de exibição)
// =============================================================================

/**
 * Preço do plano Pro por intervalo de cobrança, em centavos.
 * Espelha os valores cobrados pelo backend (Stripe): mensal R$ 597,00,
 * semestral R$ 3.402,90 (5% off, cobrado a cada 6 meses) e anual
 * R$ 6.447,60 (10% off, cobrado a cada 12 meses). Não há endpoint de preços
 * dedicado — se um for criado, substituir este hardcode por ele.
 */
export const PRO_PLAN_PRICE_CENTS: Record<BillingInterval, number> = {
  monthly: 59700,
  semestral: 340290,
  annual: 644760,
}

export const BILLING_INTERVAL_MONTHS: Record<BillingInterval, number> = {
  monthly: 1,
  semestral: 6,
  annual: 12,
}

export const BILLING_INTERVAL_LABELS: Record<BillingInterval, string> = {
  monthly: "Mensal",
  semestral: "Semestral",
  annual: "Anual",
}

/** Desconto (%) do intervalo comparado à mensalidade × N meses. */
export const BILLING_INTERVAL_DISCOUNT_PCT: Record<BillingInterval, number> = {
  monthly: 0,
  semestral: 5,
  annual: 10,
}

// =============================================================================
// PLATFORM LABELS
// =============================================================================

/**
 * Platform display labels
 */
export const PLATFORM_LABELS: Record<LivePlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get status config with fallback
 */
export function getStatusConfig<T extends string, C extends StatusConfig>(
  config: Record<T, C>,
  status: string,
  fallback: T
): C {
  return config[status as T] || config[fallback]
}
