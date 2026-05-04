import { apiClient } from "./client"
import { buildQueryString } from "@/lib/query"
import type {
  Order,
  OrderDetail,
  OrderListParams,
  OrderListResponse,
  OrderStats,
  OrderUpsellSummary,
} from "@/types"

// buildQueryString omits `false` booleans, but the orders API uses hasShipment
// as a tri-state filter where `false` is meaningful ("orders without shipment").
// Serializing it as a string preserves both states without changing the
// shared utility.
function serializeOrderFilters(filters: OrderListParams["filters"]) {
  if (!filters) return undefined
  const { hasShipment, ...rest } = filters
  if (hasShipment === undefined) return rest
  return { ...rest, hasShipment: hasShipment ? "true" : "false" }
}

export const orderService = {
  list: (storeId: string, params?: OrderListParams, token?: string | null) => {
    const query = buildQueryString({
      search: params?.search,
      pagination: params?.pagination,
      sorting: params?.sorting,
      filters: serializeOrderFilters(params?.filters),
    })
    return apiClient.get<OrderListResponse>(`/stores/${storeId}/orders${query}`, token)
  },

  getById: (storeId: string, id: string, token?: string | null) =>
    apiClient.get<OrderDetail>(`/stores/${storeId}/orders/${id}`, token),

  updateStatus: (storeId: string, id: string, status: Order["status"], token?: string | null) =>
    apiClient.patch<Order>(`/stores/${storeId}/orders/${id}`, { status }, token),

  updatePaymentStatus: (storeId: string, id: string, paymentStatus: Order["paymentStatus"], token?: string | null) =>
    apiClient.patch<Order>(`/stores/${storeId}/orders/${id}`, { paymentStatus }, token),

  getStats: (storeId: string, params?: OrderListParams, token?: string | null) => {
    const query = buildQueryString({
      search: params?.search,
      filters: serializeOrderFilters(params?.filters),
    })
    return apiClient.get<OrderStats>(`/stores/${storeId}/orders/stats${query}`, token)
  },

  getUpsell: (storeId: string, id: string, token?: string | null) =>
    apiClient.get<OrderUpsellSummary>(
      `/stores/${storeId}/orders/${id}/upsell`,
      token
    ),
}
