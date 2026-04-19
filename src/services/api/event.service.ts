import { apiClient } from "./client"
import { buildQueryString } from "@/lib/query"
import type {
  Event,
  EventStats,
  CreateEventPayload,
  CreateEventResponse,
  UpdateEventPayload,
  EndEventPayload,
  EndEventResponse,
  CreateSessionPayload,
  AddPlatformPayload,
  EventListParams,
  EventListResponse,
  EventSession,
  EventPlatform,
  EventDetailStatsResponse,
  EventCartsResponse,
  EventProductsResponse,
  LiveModeState,
  SetActiveProductPayload,
  SetProcessingPausedPayload,
} from "@/types"

export const eventService = {
  // List events
  list: (storeId: string, params?: EventListParams, token?: string | null) => {
    const query = buildQueryString({
      search: params?.search,
      pagination: params?.pagination,
      sorting: params?.sorting,
      filters: params?.filters,
    })
    return apiClient.get<EventListResponse>(`/stores/${storeId}/lives${query}`, token)
  },

  // Get event by ID with sessions
  getById: (storeId: string, id: string, token?: string | null) =>
    apiClient.get<Event>(`/stores/${storeId}/lives/${id}`, token),

  // Create event + session + platform
  create: (storeId: string, payload: CreateEventPayload, token?: string | null) =>
    apiClient.post<CreateEventResponse>(`/stores/${storeId}/lives`, payload, token),

  // Update event title
  update: (storeId: string, id: string, payload: UpdateEventPayload, token?: string | null) =>
    apiClient.put<Event>(`/stores/${storeId}/lives/${id}`, payload, token),

  // Delete event
  delete: (storeId: string, id: string, token?: string | null) =>
    apiClient.delete<void>(`/stores/${storeId}/lives/${id}`, token),

  // End event (finalize all sessions + carts)
  end: (storeId: string, id: string, payload?: EndEventPayload, token?: string | null) =>
    apiClient.post<EndEventResponse>(`/stores/${storeId}/lives/${id}/end`, payload ?? {}, token),

  // Get stats
  getStats: (storeId: string, token?: string | null) =>
    apiClient.get<EventStats>(`/stores/${storeId}/lives/stats`, token),

  // Create new session on existing event
  createSession: (storeId: string, eventId: string, payload: CreateSessionPayload, token?: string | null) =>
    apiClient.post<EventSession>(`/stores/${storeId}/lives/${eventId}/sessions`, payload, token),

  // Add platform to active session (crash recovery)
  addPlatform: (storeId: string, eventId: string, payload: AddPlatformPayload, token?: string | null) =>
    apiClient.post<EventPlatform>(`/stores/${storeId}/lives/${eventId}/platforms`, payload, token),

  // Event Details - Stats for a specific event
  getEventStats: (storeId: string, eventId: string, token?: string | null) =>
    apiClient.get<EventDetailStatsResponse>(`/stores/${storeId}/lives/${eventId}/event-stats`, token),

  // Event Details - List carts for an event
  listCarts: (storeId: string, eventId: string, token?: string | null) =>
    apiClient.get<EventCartsResponse>(`/stores/${storeId}/lives/${eventId}/carts`, token),

  // Event Details - List products sold in an event
  listProducts: (storeId: string, eventId: string, token?: string | null) =>
    apiClient.get<EventProductsResponse>(`/stores/${storeId}/lives/${eventId}/products`, token),

  // Live Mode - Get current state (active product + pause status)
  getLiveModeState: (storeId: string, eventId: string, token?: string | null) =>
    apiClient.get<LiveModeState>(`/stores/${storeId}/lives/${eventId}/live-mode`, token),

  // Live Mode - Set active product (fallback for generic purchase intents)
  setActiveProduct: (storeId: string, eventId: string, payload: SetActiveProductPayload, token?: string | null) =>
    apiClient.patch<void>(`/stores/${storeId}/lives/${eventId}/active-product`, payload, token),

  // Live Mode - Pause/resume comment processing
  setProcessingPaused: (storeId: string, eventId: string, payload: SetProcessingPausedPayload, token?: string | null) =>
    apiClient.patch<void>(`/stores/${storeId}/lives/${eventId}/pause-processing`, payload, token),
}
