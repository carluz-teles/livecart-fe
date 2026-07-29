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
 * Event status configuration (live events)
 */
export const EVENT_STATUS_CONFIG: Record<EventStatus, EventStatusConfig> = {
  scheduled: { label: "Agendado", variant: "outline", icon: "calendar" },
  active: { label: "Ao Vivo", variant: "destructive", icon: "radio" },
  ended: { label: "Finalizado", variant: "secondary", icon: "check-circle" },
}

/**
 * Event status configuration for POST events — an active post is not "live".
 */
export const POST_EVENT_STATUS_CONFIG: Record<EventStatus, EventStatusConfig> = {
  scheduled: { label: "Agendado", variant: "outline", icon: "calendar" },
  active: { label: "Ativo", variant: "default", icon: "instagram" },
  ended: { label: "Encerrado", variant: "secondary", icon: "check-circle" },
}

/**
 * Picks the status display for an event based on its type.
 */
export function getEventStatusDisplay(
  status: EventStatus,
  type?: string
): EventStatusConfig {
  const map =
    type === "post" || type === "story" ? POST_EVENT_STATUS_CONFIG : EVENT_STATUS_CONFIG
  return map[status] ?? map.ended
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
