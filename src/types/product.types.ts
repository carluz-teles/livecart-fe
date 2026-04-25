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

// One axis of a variant combination — backend serializes both option name and
// the chosen value (e.g. { option: "Cor", value: "Preto" }). Always empty on
// list responses; populated only on detail.
export interface ProductOptionAssignment {
  option: string
  value: string
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
  // null for simple products; uuid pointing at the parent group for variants.
  groupId: string | null
  // Empty on list responses; on detail, identifies which variant this is.
  optionValues: ProductOptionAssignment[]
  // Gallery URLs (besides the main imageUrl). Empty on list responses.
  images: string[]
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

// =============================================================================
// PRODUCT GROUPS (variant aggregator)
// =============================================================================

// One option (e.g. "Cor") with its declared values. Position drives display
// order — frontend respects whatever the backend sent.
export interface ProductOptionValue {
  id: string
  value: string
  position: number
}

export interface ProductOption {
  id: string
  name: string
  position: number
  values: ProductOptionValue[]
}

// Image attached at the group level (model shots, size charts, etc.).
export interface ProductGroupImage {
  id: string
  url: string
  position: number
}

// Variant inside the group's detail response. Same shape as a Product row in
// most ways; we keep this narrower since the group endpoint doesn't echo
// every Product field.
export interface ProductGroupVariant {
  id: string
  keyword: string
  optionValues: ProductOptionAssignment[]
  price: number
  stock: number
  sku: string
  imageUrl: string | null
  images: ProductGroupImage[]
}

// List item — no options/variants embedded, use detail for that.
export interface ProductGroupListItem {
  id: string
  name: string
  description: string | null
  externalId: string
  externalSource: ProductSource
  variantsCount: number
  createdAt: string
  updatedAt: string
}

// Detail response — full graph (options, values, variants, gallery).
export interface ProductGroupDetail extends ProductGroupListItem {
  options: ProductOption[]
  groupImages: ProductGroupImage[]
  variants: ProductGroupVariant[]
}

export interface ProductGroupListParams {
  search?: string
  pagination?: Pagination
  sorting?: Sorting
}

export type ProductGroupListResponse = PaginatedResponse<ProductGroupListItem>

// =============================================================================
// CREATE PRODUCT GROUP — atomic transaction (group + options + values + variants)
// =============================================================================

// What the form sends per option.
export interface CreateProductGroupOptionPayload {
  name: string
  values: string[]
}

// What the form sends per variant. optionValues is an ordered array matching
// the order of options[] (index 0 = first option's chosen value, etc.).
export interface CreateProductGroupVariantPayload {
  optionValues: string[]
  price: number // cents
  stock: number
  sku?: string
  keyword?: string
  imageUrl?: string
  images?: string[]
  shipping?: ShippingProfile
}

export interface CreateProductGroupPayload {
  name: string
  description?: string
  externalSource?: ProductSource
  externalId?: string
  options: CreateProductGroupOptionPayload[]
  groupImages?: string[]
  variants: CreateProductGroupVariantPayload[]
}

// Server returns a slim summary plus the list of created variants with their
// generated keywords (useful for the success toast / immediate display).
export interface CreateProductGroupResponseVariant {
  id: string
  keyword: string
  optionValues: string[]
}

export interface CreateProductGroupResponse {
  id: string
  name: string
  createdAt: string
  variants: CreateProductGroupResponseVariant[]
}

export interface UpdateProductGroupPayload {
  name?: string
  description?: string
}
