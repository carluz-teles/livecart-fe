export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  status: number
  error?: string
  message?: string
  fields?: Record<string, string>
}

// Query value objects - matching backend lib/query package
export interface Pagination {
  page: number
  limit: number
}

export interface PaginationResponse {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Sorting {
  sortBy: string
  sortOrder: "asc" | "desc"
}

// Paginated response structure - matches backend pattern
export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationResponse
}

// Default values for query params
export const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 20,
}

export const DEFAULT_SORTING: Sorting = {
  sortBy: "created_at",
  sortOrder: "desc",
}
