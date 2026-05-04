import { apiClient } from "./client"
import { buildQueryString } from "@/lib/query"
import type {
  Order,
  OrderDetail,
  OrderListParams,
  OrderListResponse,
  OrderStats,
  OrderUpsellSummary,
  ShippingAddressPayload,
} from "@/types"

export interface RegenerateCheckoutResponse {
  token: string
  expiresAt: string
}

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

  // Admin-only: replaces the cart's shipping address. Backend rejects with
  // 409 if the order is paid or already has a shipment.
  updateShippingAddress: (
    storeId: string,
    id: string,
    address: ShippingAddressPayload,
    token?: string | null,
  ) =>
    apiClient.patch<void>(
      `/stores/${storeId}/orders/${id}/shipping-address`,
      address,
      token,
    ),

  // Admin-only: pushes expires_at forward and resets the cart so the buyer
  // can pay again. Returns the token + new expires_at so the FE builds the
  // public checkout URL itself.
  regenerateCheckout: (
    storeId: string,
    id: string,
    token?: string | null,
  ) =>
    apiClient.post<RegenerateCheckoutResponse>(
      `/stores/${storeId}/orders/${id}/regenerate-checkout`,
      {},
      token,
    ),
}
