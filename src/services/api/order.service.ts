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

// buildQueryString omits `false` booleans, but the orders API uses
// hasShipment and needsAttention as tri-state filters where `false` carries
// real meaning ("orders without shipment", "exclude the problems bucket").
// Serializing each as a string preserves both states without changing the
// shared utility.
function serializeOrderFilters(filters: OrderListParams["filters"]) {
  if (!filters) return undefined
  const { hasShipment, needsAttention, ...rest } = filters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: Record<string, any> = { ...rest }
  if (hasShipment !== undefined) {
    out.hasShipment = hasShipment ? "true" : "false"
  }
  if (needsAttention !== undefined) {
    out.needsAttention = needsAttention ? "true" : "false"
  }
  return out
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

  // Marks the order as delivered from the merchant's side. The BE emits a
  // `delivered` order_event and dispatches the "Pedido entregue" email.
  markDelivered: (storeId: string, id: string, token?: string | null) =>
    apiClient.post<{ confirmed: boolean }>(
      `/stores/${storeId}/orders/${id}/mark-delivered`,
      {},
      token,
    ),

  // Cancela um pedido ainda não pago. O carrinho continua existindo com
  // status 'cancelled' (o link público mostra "cancelado", não "expirado"),
  // o estoque volta e a reserva no ERP é estornada. Responde 409 quando o
  // pedido já foi pago ou está com um pagamento sendo finalizado — nessa
  // corrida o pagamento vence. Retorna o OrderDetail atualizado.
  // Edição de itens de pedido AGUARDANDO PAGAMENTO, pelo painel. As três
  // devolvem o OrderDetail relido: a edição muda total, subtotal pagável, valor
  // em fila, frete (que é descartado) e o histórico — devolver só o item
  // obrigaria a tela a adivinhar o resto.
  addItem: (
    storeId: string,
    orderId: string,
    payload: { productId: string; quantity: number },
    token?: string | null,
  ) =>
    apiClient.post<OrderDetail>(
      `/stores/${storeId}/orders/${orderId}/items`,
      payload,
      token,
    ),

  // Quantidade ABSOLUTA, não delta: o servidor recusa o passo obsoleto com 409
  // em vez de aplicar "+1" sobre um valor que já mudou.
  setItemQuantity: (
    storeId: string,
    orderId: string,
    itemId: string,
    quantity: number,
    token?: string | null,
  ) =>
    apiClient.patch<OrderDetail>(
      `/stores/${storeId}/orders/${orderId}/items/${itemId}`,
      { quantity },
      token,
    ),

  removeItem: (
    storeId: string,
    orderId: string,
    itemId: string,
    token?: string | null,
  ) =>
    apiClient.delete<OrderDetail>(
      `/stores/${storeId}/orders/${orderId}/items/${itemId}`,
      token,
    ),

  cancel: (storeId: string, id: string, token?: string | null) =>
    apiClient.post<OrderDetail>(
      `/stores/${storeId}/orders/${id}/cancel`,
      {},
      token,
    ),

  // Replays the post-payment Tiny order creation for an order whose
  // finalisation previously failed. Returns the refreshed OrderDetail so
  // the FE can swap the banner state in-place.
  retryERPFinalisation: (storeId: string, id: string, token?: string | null) =>
    apiClient.post<OrderDetail>(
      `/stores/${storeId}/orders/${id}/retry-erp`,
      {},
      token,
    ),

  // Forces a fetch of the NFe state from the active ERP (today: Tiny). The
  // backend Tiny webhook covers this automatically, but Tiny doesn't always
  // deliver nota_fiscal events promptly — this gives the merchant a manual
  // "Verificar NFe" button to bridge the gap. The refreshed OrderDetail
  // carries the updated `erpInvoice` field.
  syncInvoice: (storeId: string, id: string, token?: string | null) =>
    apiClient.post<OrderDetail>(
      `/stores/${storeId}/orders/${id}/sync-invoice`,
      {},
      token,
    ),
}
