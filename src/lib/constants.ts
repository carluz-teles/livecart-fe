/**
 * Centralized constants for the application.
 * Use these instead of hardcoding values in components.
 */

import type { LiveStatus, LivePlatform } from "@/types/live.types"
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
  live: { label: "Ao Vivo", variant: "destructive", icon: "play" },
  ended: { label: "Finalizada", variant: "secondary", icon: "eye" },
  cancelled: { label: "Cancelada", variant: "outline", icon: "clock" },
}

/**
 * Order status configuration
 */
export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: { label: "Pendente", variant: "outline" },
  checkout: { label: "Checkout", variant: "secondary" },
  completed: { label: "Completo", variant: "default" },
  expired: { label: "Expirado", variant: "destructive" },
}

/**
 * Payment status configuration
 */
export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, StatusConfig> = {
  pending: { label: "Pendente", variant: "outline" },
  paid: { label: "Pago", variant: "default" },
  failed: { label: "Falhou", variant: "destructive" },
  refunded: { label: "Reembolsado", variant: "secondary" },
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
