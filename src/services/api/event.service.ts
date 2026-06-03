import { apiClient } from "./client"
import { buildQueryString } from "@/lib/query"
import type {
  Event,
  EventStats,
  CreateEventPayload,
  CreatePostEventPayload,
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
  EventCart,
  EventCartsResponse,
  EventCommentsResponse,
  EventSoldProductsResponse,
  EventWhitelistProduct,
  EventWhitelistResponse,
  AddEventProductPayload,
  UpdateEventProductPayload,
  EventUpsell,
  EventUpsellsResponse,
  AddEventUpsellPayload,
  UpdateEventUpsellPayload,
  LiveModeState,
  SetActiveProductPayload,
  SetProcessingPausedPayload,
  ActiveCheckout,
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

  // Create a post-commerce event (maps an Instagram post + selected products)
  createPost: (storeId: string, payload: CreatePostEventPayload, token?: string | null) =>
    apiClient.post<CreateEventResponse>(`/stores/${storeId}/lives/posts`, payload, token),

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

  // Event Details - List comments (with Instagram comment IDs) for moderation
  listComments: (storeId: string, eventId: string, token?: string | null) =>
    apiClient.get<EventCommentsResponse>(`/stores/${storeId}/lives/${eventId}/comments`, token),

  // Comment moderation — reply (public), hide/unhide, delete via Instagram Graph API
  replyComment: (storeId: string, commentId: string, text: string, token?: string | null) =>
    apiClient.post<{ commentId: string; replied: boolean }>(
      `/stores/${storeId}/integrations/instagram/comments/${commentId}/reply`,
      { text },
      token
    ),

  hideComment: (storeId: string, commentId: string, hidden: boolean, token?: string | null) =>
    apiClient.post<{ commentId: string; hidden: boolean }>(
      `/stores/${storeId}/integrations/instagram/comments/${commentId}/hide`,
      { hidden },
      token
    ),

  deleteComment: (storeId: string, commentId: string, token?: string | null) =>
    apiClient.delete<{ commentId: string; deleted: boolean }>(
      `/stores/${storeId}/integrations/instagram/comments/${commentId}`,
      token
    ),

  // Event Details - Resend the Instagram checkout DM for a single cart
  resendCartMessage: (
    storeId: string,
    eventId: string,
    cartId: string,
    token?: string | null
  ) =>
    apiClient.post<EventCart>(
      `/stores/${storeId}/lives/${eventId}/carts/${cartId}/resend-message`,
      {},
      token
    ),

  // Event Details - List carts currently in checkout phase (live merchant view)
  listActiveCheckouts: (storeId: string, eventId: string, token?: string | null) =>
    apiClient.get<{ data: ActiveCheckout[] }>(
      `/stores/${storeId}/lives/${eventId}/active-checkouts`,
      token
    ),

  // Event Details - List products sold in an event (sales report)
  listSoldProducts: (storeId: string, eventId: string, token?: string | null) =>
    apiClient.get<EventSoldProductsResponse>(`/stores/${storeId}/lives/${eventId}/products`, token),

  // Live Mode - Get current state (active product + pause status)
  getLiveModeState: (storeId: string, eventId: string, token?: string | null) =>
    apiClient.get<LiveModeState>(`/stores/${storeId}/lives/${eventId}/live-mode`, token),

  // Live Mode - Set active product (fallback for generic purchase intents)
  setActiveProduct: (storeId: string, eventId: string, payload: SetActiveProductPayload, token?: string | null) =>
    apiClient.patch<void>(`/stores/${storeId}/lives/${eventId}/active-product`, payload, token),

  // Live Mode - Pause/resume comment processing
  setProcessingPaused: (storeId: string, eventId: string, payload: SetProcessingPausedPayload, token?: string | null) =>
    apiClient.patch<void>(`/stores/${storeId}/lives/${eventId}/pause-processing`, payload, token),

  // ==========================================================================
  // EVENT WHITELIST - Products allowed for sale in this event
  // ==========================================================================

  // List whitelist products
  listWhitelist: (storeId: string, eventId: string, token?: string | null) =>
    apiClient.get<EventWhitelistResponse>(`/stores/${storeId}/lives/${eventId}/whitelist`, token),

  // Add product to whitelist
  addToWhitelist: (storeId: string, eventId: string, payload: AddEventProductPayload, token?: string | null) =>
    apiClient.post<EventWhitelistProduct>(`/stores/${storeId}/lives/${eventId}/whitelist`, payload, token),

  // Update whitelist product config
  updateWhitelistProduct: (
    storeId: string,
    eventId: string,
    productId: string,
    payload: UpdateEventProductPayload,
    token?: string | null
  ) =>
    apiClient.put<EventWhitelistProduct>(
      `/stores/${storeId}/lives/${eventId}/whitelist/${productId}`,
      payload,
      token
    ),

  // Remove from whitelist
  removeFromWhitelist: (storeId: string, eventId: string, productId: string, token?: string | null) =>
    apiClient.delete<void>(`/stores/${storeId}/lives/${eventId}/whitelist/${productId}`, token),

  // ==========================================================================
  // EVENT UPSELLS - Suggested products at checkout
  // ==========================================================================

  // List upsells
  listUpsells: (storeId: string, eventId: string, token?: string | null) =>
    apiClient.get<EventUpsellsResponse>(`/stores/${storeId}/lives/${eventId}/upsells`, token),

  // Add upsell
  addUpsell: (storeId: string, eventId: string, payload: AddEventUpsellPayload, token?: string | null) =>
    apiClient.post<EventUpsell>(`/stores/${storeId}/lives/${eventId}/upsells`, payload, token),

  // Update upsell
  updateUpsell: (
    storeId: string,
    eventId: string,
    upsellId: string,
    payload: UpdateEventUpsellPayload,
    token?: string | null
  ) =>
    apiClient.put<EventUpsell>(
      `/stores/${storeId}/lives/${eventId}/upsells/${upsellId}`,
      payload,
      token
    ),

  // Remove upsell
  removeUpsell: (storeId: string, eventId: string, upsellId: string, token?: string | null) =>
    apiClient.delete<void>(`/stores/${storeId}/lives/${eventId}/upsells/${upsellId}`, token),
}
