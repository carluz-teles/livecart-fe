import { apiClient } from "./client"
import type {
  LiveSession,
  LiveComment,
  LiveStats,
  CreateLiveSessionPayload,
  PaginatedResponse,
} from "@/types"

export interface ListLivesParams {
  page?: number
  status?: string
}

export const liveService = {
  list: (params?: ListLivesParams) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.status) searchParams.set("status", params.status)

    const query = searchParams.toString()
    return apiClient.get<PaginatedResponse<LiveSession>>(`/lives${query ? `?${query}` : ""}`)
  },

  getById: (id: string) => apiClient.get<LiveSession>(`/lives/${id}`),

  create: (payload: CreateLiveSessionPayload) =>
    apiClient.post<LiveSession>("/lives", payload),

  start: (id: string) => apiClient.post<LiveSession>(`/lives/${id}/start`, {}),

  end: (id: string) => apiClient.post<LiveSession>(`/lives/${id}/end`, {}),

  getStats: (id: string) => apiClient.get<LiveStats>(`/lives/${id}/stats`),

  getComments: (id: string, params?: { page?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set("page", String(params.page))

    const query = searchParams.toString()
    return apiClient.get<PaginatedResponse<LiveComment>>(
      `/lives/${id}/comments${query ? `?${query}` : ""}`
    )
  },
}
