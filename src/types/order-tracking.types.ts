// Mirrors the BE PublicOrderResponse from internal/postcheckout/handler.go.
// The public order-tracking page never sees authenticated state — only what
// this DTO carries.
export type PublicOrderStatus = "paid" | "shipped" | "delivered" | "refunded"

export interface PublicOrderItem {
  product_name: string
  product_image_url?: string
  quantity: number
  unit_price_cents: number
  line_total_cents: number
}

export interface PublicShippingAddress {
  city: string
  state: string
}

export interface PublicShippingSummary {
  service_name?: string
  carrier?: string
  tracking_code?: string
  deadline_days?: number
}

export type PublicOrderEventType =
  | "payment_confirmed"
  | "shipped"
  | "delivered"

export interface PublicOrderEvent {
  type: PublicOrderEventType
  occurred_at: string // RFC3339
  title: string
  subtitle?: string
  source: "system" | "merchant" | "customer"
}

export interface PublicOrder {
  short_id: string
  store_name: string
  store_logo_url?: string
  status: PublicOrderStatus
  paid_at?: string
  customer_name: string
  customer_email: string
  items: PublicOrderItem[]
  subtotal_cents: number
  shipping_cents: number
  discount_cents: number
  total_cents: number
  shipping_address?: PublicShippingAddress
  shipping?: PublicShippingSummary
  events: PublicOrderEvent[]
}
