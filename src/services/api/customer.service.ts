import { apiClient } from "./client"
import { buildQueryString } from "@/lib/query"
import type {
  BlockedHandle,
  BlockedHandlesResponse,
  BlockHandlePayload,
  Customer,
  CustomerListParams,
  CustomerListResponse,
  CustomerOrder,
  CustomerStats,
} from "@/types"

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

  listOrders: (storeId: string, id: string, token?: string | null, limit = 20) =>
    apiClient.get<CustomerOrder[]>(
      `/stores/${storeId}/customers/${id}/orders?limit=${limit}`,
      token,
    ),

  // Block flow ---------------------------------------------------------------

  listBlocked: (
    storeId: string,
    options: { includeInactive?: boolean; limit?: number; offset?: number } = {},
    token?: string | null,
  ) => {
    const params = new URLSearchParams()
    if (options.includeInactive) params.set("includeInactive", "true")
    if (options.limit) params.set("limit", String(options.limit))
    if (options.offset) params.set("offset", String(options.offset))
    const qs = params.toString()
    return apiClient.get<BlockedHandlesResponse>(
      `/stores/${storeId}/customers/blocks${qs ? `?${qs}` : ""}`,
      token,
    )
  },

  block: (storeId: string, payload: BlockHandlePayload, token?: string | null) =>
    apiClient.post<BlockedHandle>(`/stores/${storeId}/customers/blocks`, payload, token),

  unblock: (storeId: string, handle: string, token?: string | null) =>
    apiClient.delete<BlockedHandle>(
      `/stores/${storeId}/customers/blocks/${encodeURIComponent(handle)}`,
      token,
    ),
}
