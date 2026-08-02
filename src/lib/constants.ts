/**
 * Centralized constants for the application.
 * Use these instead of hardcoding values in components.
 */

import type { LiveStatus, LivePlatform } from "@/types/live.types"
import type { EventStatus } from "@/types/event.types"
import type { OrderStatus, PaymentStatus } from "@/types/cart.types"

// =============================================================================
// STATUS CONFIGURATIONS
// =============================================================================

export type BadgeVariant = "outline" | "destructive" | "secondary" | "default"

export interface StatusConfig {
  label: string
  variant: BadgeVariant
}

export interface LiveStatusConfig extends StatusConfig {
  icon: "calendar" | "play" | "eye" | "clock"
}

/**
 * Live session status configuration
 */
export const LIVE_STATUS_CONFIG: Record<LiveStatus, LiveStatusConfig> = {
  scheduled: { label: "Agendada", variant: "outline", icon: "calendar" },
  active: { label: "Ao Vivo", variant: "destructive", icon: "play" },
  live: { label: "Ao Vivo", variant: "destructive", icon: "play" },
  ended: { label: "Finalizada", variant: "secondary", icon: "eye" },
  cancelled: { label: "Cancelada", variant: "outline", icon: "clock" },
}

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
 * Order status configuration
 */
export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  active: { label: "Ativo", variant: "outline" },
  checkout: { label: "Checkout", variant: "secondary" },
  completed: { label: "Completo", variant: "default" },
  expired: { label: "Expirado", variant: "destructive" },
  cancelled: { label: "Cancelado", variant: "destructive" },
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
export function getStatusConfig<T extends string>(
  config: Record<T, StatusConfig>,
  status: string,
  fallback: T
): StatusConfig {
  return config[status as T] || config[fallback]
}
