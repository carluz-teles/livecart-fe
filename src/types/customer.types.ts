import type { Pagination, Sorting, PaginatedResponse } from "./api.types"

export interface Customer {
  id: string
  handle: string
  email?: string | null
  phone?: string | null
  totalOrders: number
  totalSpent: number
  lastOrderAt: string | null
  firstOrderAt: string | null
}

// Lightweight order summary returned by the customer-detail drawer.
export interface CustomerOrder {
  id: string
  shortId: number
  status: string
  paymentStatus: string | null
  totalItems: number
  totalValue: number
  paidAt: string | null
  createdAt: string | null
}

export interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  avgSpentPerCustomer: number
}

// Filters for customer listing
export interface CustomerFilters {
  hasOrders?: boolean
  orderCountMin?: number
  orderCountMax?: number
  totalSpentMin?: number
  totalSpentMax?: number
  dateFrom?: string
  dateTo?: string
}

// Query params for listing customers
export interface CustomerListParams {
  search?: string
  pagination?: Pagination
  sorting?: Sorting
  filters?: CustomerFilters
}

// Response type for customer listing
export type CustomerListResponse = PaginatedResponse<Customer>

// Blocked handle (a customer prevented from purchasing). Lives in its own
// table on the backend: customers are not deleted when blocked — purchases
// are filtered at the comment-processor layer, and any open cart they have
// gets soft-cancelled with cancelled_reason='customer_blocked'.
export interface BlockedHandle {
  id: string
  handle: string
  reason?: string | null
  blockedAt: string
  unblockedAt?: string | null
  blockedByUserId?: string | null
}

export interface BlockedHandlesResponse {
  data: BlockedHandle[]
  total: number
}

export interface BlockHandlePayload {
  handle: string
  reason?: string
}
