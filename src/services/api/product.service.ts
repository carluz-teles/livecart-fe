import { apiClient } from "./client"
import type { Product, CreateProductPayload, PaginatedResponse } from "@/types"

export interface ListProductsParams {
  page?: number
  search?: string
  active?: boolean
}

export const productService = {
  list: (params?: ListProductsParams) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.search) searchParams.set("search", params.search)
    if (params?.active !== undefined) searchParams.set("active", String(params.active))

    const query = searchParams.toString()
    return apiClient.get<PaginatedResponse<Product>>(`/products${query ? `?${query}` : ""}`)
  },

  getById: (id: string) => apiClient.get<Product>(`/products/${id}`),

  create: (payload: CreateProductPayload) =>
    apiClient.post<Product>("/products", payload),

  update: (id: string, payload: Partial<CreateProductPayload>) =>
    apiClient.put<Product>(`/products/${id}`, payload),

  delete: (id: string) => apiClient.delete<void>(`/products/${id}`),

  toggleActive: (id: string, active: boolean) =>
    apiClient.patch<Product>(`/products/${id}`, { active }),
}
