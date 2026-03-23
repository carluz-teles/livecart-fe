import { apiClient } from "./client"
import { buildQueryString } from "@/lib/query"
import type { Customer, CustomerListParams, CustomerListResponse, CustomerStats } from "@/types"

export const customerService = {
  list: (storeId: string, params?: CustomerListParams, token?: string | null) => {
    const query = buildQueryString({
      search: params?.search,
      pagination: params?.pagination,
      sorting: params?.sorting,
      filters: params?.filters,
    })
    return apiClient.get<CustomerListResponse>(`/stores/${storeId}/customers${query}`, token)
  },

  getById: (storeId: string, id: string, token?: string | null) =>
    apiClient.get<Customer>(`/stores/${storeId}/customers/${id}`, token),

  getStats: (storeId: string, token?: string | null) =>
    apiClient.get<CustomerStats>(`/stores/${storeId}/customers/stats`, token),
}
