import type { Pagination, Sorting, PaginatedResponse } from "./api.types"

export type CartStatus = "pending" | "checkout" | "completed" | "expired"
export type OrderStatus = "pending" | "checkout" | "completed" | "expired"
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

export interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_image: string | null
  keyword: string
  size: string | null
  quantity: number
  unit_price: number
  total_price: number
}

export interface Cart {
  id: string
  token: string
  customerName: string
  customerPhone: string | null
  customerEmail: string | null
  status: CartStatus
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  live_session_id: string
  live_title: string
  live_platform: string
  customer_handle: string
  customer_id: string
  status: OrderStatus
  payment_status: PaymentStatus
  items: OrderItem[]
  total_items: number
  total_amount: number
  paid_at: string | null
  created_at: string
  expires_at: string | null
}

export interface OrderStats {
  total_orders: number
  pending_orders: number
  total_revenue: number
  avg_ticket: number
}

export interface CartCheckoutPayload {
  customerName: string
  customerPhone: string
  customerEmail?: string
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
}

// Filters for order listing
export interface OrderFilters {
  status?: OrderStatus[]
  paymentStatus?: PaymentStatus[]
  liveSessionId?: string
  dateFrom?: string
  dateTo?: string
  totalMin?: number
  totalMax?: number
}

// Query params for listing orders
export interface OrderListParams {
  search?: string
  pagination?: Pagination
  sorting?: Sorting
  filters?: OrderFilters
}

// Response type for order listing
export type OrderListResponse = PaginatedResponse<Order>
