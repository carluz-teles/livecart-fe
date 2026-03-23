import { apiClient } from "./client"
import { buildQueryString } from "@/lib/query"
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductListParams,
  ProductListResponse,
  ProductStats,
} from "@/types"

export const productService = {
  list: (storeId: string, params?: ProductListParams, token?: string | null) => {
    const query = buildQueryString({
      search: params?.search,
      pagination: params?.pagination,
      sorting: params?.sorting,
      filters: params?.filters,
    })
    return apiClient.get<ProductListResponse>(`/stores/${storeId}/products${query}`, token)
  },

  getById: (storeId: string, id: string, token?: string | null) =>
    apiClient.get<Product>(`/stores/${storeId}/products/${id}`, token),

  create: (storeId: string, payload: CreateProductPayload, token?: string | null) =>
    apiClient.post<Product>(`/stores/${storeId}/products`, payload, token),

  update: (storeId: string, id: string, payload: UpdateProductPayload, token?: string | null) =>
    apiClient.put<Product>(`/stores/${storeId}/products/${id}`, payload, token),

  delete: (storeId: string, id: string, token?: string | null) =>
    apiClient.delete<void>(`/stores/${storeId}/products/${id}`, token),

  getStats: (storeId: string, token?: string | null) =>
    apiClient.get<ProductStats>(`/stores/${storeId}/products/stats`, token),
}
