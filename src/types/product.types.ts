import type { Pagination, Sorting, PaginatedResponse } from "./api.types"

export type ProductStatus = "active" | "inactive"
export type ProductSource = "bling" | "tiny" | "shopify" | "manual"
export type PackageFormat = "box" | "roll" | "letter"

export interface ShippingProfile {
  weightGrams: number | null
  heightCm: number | null
  widthCm: number | null
  lengthCm: number | null
  sku: string
  packageFormat: PackageFormat
  insuranceValueCents: number | null
}

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
  shipping: ShippingProfile
  shippable: boolean
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
  shipping?: ShippingProfile
}

export interface UpdateProductPayload {
  name: string
  price: number // price in cents
  imageUrl?: string
  stock: number
  active: boolean
  shipping?: ShippingProfile
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
  shippable?: boolean
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
