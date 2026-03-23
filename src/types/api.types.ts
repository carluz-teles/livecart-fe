export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  status: number
  message: string
  fields?: Record<string, string>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  totalPages: number
}
