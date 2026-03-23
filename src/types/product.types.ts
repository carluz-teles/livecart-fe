import type { Pagination, Sorting, PaginatedResponse } from "./api.types"

export type ProductStatus = "active" | "inactive"
export type ProductSource = "bling" | "tiny" | "shopify" | "manual"

export interface Product {
  id: string
  name: string
  keyword: string
  externalId: string | null
  externalSource: ProductSource
  price: number // price in cents
  imageUrl: string | null
  stock: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProductPayload {
  name: string
  externalId?: string
  externalSource: ProductSource
  keyword?: string
  price: number // price in cents
  imageUrl?: string
  stock: number
}

export interface UpdateProductPayload {
  name: string
  price: number // price in cents
  imageUrl?: string
  stock: number
  active: boolean
}

// Filters for product listing
export interface ProductFilters {
  status?: ProductStatus[]
  externalSource?: ProductSource[]
  priceMin?: number
  priceMax?: number
  stockMin?: number
  stockMax?: number
  hasLowStock?: boolean
}

// Query params for listing products
export interface ProductListParams {
  search?: string
  pagination?: Pagination
  sorting?: Sorting
  filters?: ProductFilters
}

// Response type for product listing
export type ProductListResponse = PaginatedResponse<Product>

// Product statistics
export interface ProductStats {
  totalProducts: number
  activeCount: number
  lowStockCount: number
  stockValue: number // in cents
}
