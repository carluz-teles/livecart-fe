import type { Pagination, Sorting, PaginatedResponse } from "./api.types"

export interface Customer {
  id: string
  handle: string
  totalOrders: number
  totalSpent: number
  lastOrderAt: string | null
  firstOrderAt: string | null
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
