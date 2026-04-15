import { apiClient } from "./client"
import { buildQueryString } from "@/lib/query"
import type { Order, OrderDetail, OrderListParams, OrderListResponse, OrderStats } from "@/types"

export const orderService = {
  list: (storeId: string, params?: OrderListParams, token?: string | null) => {
    const query = buildQueryString({
      search: params?.search,
      pagination: params?.pagination,
      sorting: params?.sorting,
      filters: params?.filters,
    })
    return apiClient.get<OrderListResponse>(`/stores/${storeId}/orders${query}`, token)
  },

  getById: (storeId: string, id: string, token?: string | null) =>
    apiClient.get<OrderDetail>(`/stores/${storeId}/orders/${id}`, token),

  updateStatus: (storeId: string, id: string, status: Order["status"], token?: string | null) =>
    apiClient.patch<Order>(`/stores/${storeId}/orders/${id}`, { status }, token),

  updatePaymentStatus: (storeId: string, id: string, paymentStatus: Order["paymentStatus"], token?: string | null) =>
    apiClient.patch<Order>(`/stores/${storeId}/orders/${id}`, { paymentStatus }, token),

  getStats: (storeId: string, token?: string | null) =>
    apiClient.get<OrderStats>(`/stores/${storeId}/orders/stats`, token),
}
