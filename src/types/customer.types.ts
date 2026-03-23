import type { Pagination, Sorting, PaginatedResponse } from "./api.types"

export interface Customer {
  id: string
  handle: string
  total_orders: number
  total_spent: number
  last_order_at: string | null
  first_order_at: string | null
}

export interface CustomerStats {
  total_customers: number
  active_customers: number
  avg_spent_per_customer: number
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
