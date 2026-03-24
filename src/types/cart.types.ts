import type { Pagination, Sorting, PaginatedResponse } from "./api.types"

export type CartStatus = "pending" | "checkout" | "completed" | "expired"
export type OrderStatus = "pending" | "checkout" | "completed" | "expired"
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage: string | null
  keyword: string
  size: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
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
  liveSessionId: string
  liveTitle: string
  livePlatform: string
  customerHandle: string
  customerId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  items: OrderItem[]
  totalItems: number
  totalAmount: number
  paidAt: string | null
  createdAt: string
  expiresAt: string | null
}

export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  avgTicket: number
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
