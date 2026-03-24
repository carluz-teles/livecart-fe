import { apiClient } from "./client"
import { buildQueryString } from "@/lib/query"
import type {
  LiveSession,
  LiveStats,
  CreateLiveSessionPayload,
  UpdateLiveSessionPayload,
  LiveListParams,
  LiveListResponse,
} from "@/types"

export const liveService = {
  list: (storeId: string, params?: LiveListParams, token?: string | null) => {
    const query = buildQueryString({
      search: params?.search,
      pagination: params?.pagination,
      sorting: params?.sorting,
      filters: params?.filters,
    })
    return apiClient.get<LiveListResponse>(`/stores/${storeId}/lives${query}`, token)
  },

  getById: (storeId: string, id: string, token?: string | null) =>
    apiClient.get<LiveSession>(`/stores/${storeId}/lives/${id}`, token),

  create: (storeId: string, payload: CreateLiveSessionPayload, token?: string | null) =>
    apiClient.post<LiveSession>(`/stores/${storeId}/lives`, payload, token),

  update: (storeId: string, id: string, payload: UpdateLiveSessionPayload, token?: string | null) =>
    apiClient.put<LiveSession>(`/stores/${storeId}/lives/${id}`, payload, token),

  delete: (storeId: string, id: string, token?: string | null) =>
    apiClient.delete<void>(`/stores/${storeId}/lives/${id}`, token),

  start: (storeId: string, id: string, token?: string | null) =>
    apiClient.post<LiveSession>(`/stores/${storeId}/lives/${id}/start`, {}, token),

  end: (storeId: string, id: string, token?: string | null) =>
    apiClient.post<LiveSession>(`/stores/${storeId}/lives/${id}/end`, {}, token),

  getStats: (storeId: string, token?: string | null) =>
    apiClient.get<LiveStats>(`/stores/${storeId}/lives/stats`, token),
}
