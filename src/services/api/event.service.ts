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
  EndSessionResponse,
  CreateSessionPayload,
  AddPlatformPayload,
  LinkSessionMediaPayload,
  EventListParams,
  EventListResponse,
  EventSession,
  EventPlatform,
  EventDetailStatsResponse,
  EventSessionMetrics,
  EventPulse,
  EventCartsResponse,
  EventCommentsResponse,
  EventSoldProductsResponse,
  SessionProduct,
  SessionProductsResponse,
  AddSessionProductPayload,
  UpdateSessionProductPayload,
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

  // Encerra UMA sessão sem encerrar o evento.
  //
  // Não confundir com `end` acima, que é do evento: aquele encerra o evento,
  // encerra todas as sessões e finaliza os carrinhos. Este só para a live/post
  // que acabou — o evento segue no ar e os carrinhos continuam valendo, que é o
  // que faz um comprador de segunda e de terça ter um pedido só.
  endSession: (storeId: string, eventId: string, sessionId: string, token?: string | null) =>
    apiClient.post<EndSessionResponse>(
      `/stores/${storeId}/lives/${eventId}/sessions/${sessionId}/end`,
      {},
      token
    ),

  // Add platform to active session (crash recovery)
  addPlatform: (storeId: string, eventId: string, payload: AddPlatformPayload, token?: string | null) =>
    apiClient.post<EventPlatform>(`/stores/${storeId}/lives/${eventId}/platforms`, payload, token),

  // Vincula a publicação a UMA transmissão nomeada — o "vincular depois" da
  // sessão criada sem mídia. A rota acima resolve a sessão sozinha e por isso
  // não serve a uma campanha com mais de uma transmissão.
  linkSessionMedia: (
    storeId: string,
    eventId: string,
    sessionId: string,
    payload: LinkSessionMediaPayload,
    token?: string | null
  ) =>
    apiClient.post<EventPlatform>(
      `/stores/${storeId}/lives/${eventId}/sessions/${sessionId}/platforms`,
      payload,
      token
    ),

  // Event Details - Stats for a specific event
  getEventStats: (storeId: string, eventId: string, token?: string | null) =>
    apiClient.get<EventDetailStatsResponse>(`/stores/${storeId}/lives/${eventId}/event-stats`, token),

  // Event Details - Métrica em dois níveis: quebra por transmissão + o balde
  // "sem transmissão". A soma das linhas fecha com o event-stats do evento.
  getSessionMetrics: (storeId: string, eventId: string, token?: string | null) =>
    apiClient.get<EventSessionMetrics>(`/stores/${storeId}/lives/${eventId}/session-metrics`, token),

  // Event Details - Cheap change-signal for near-real-time refresh
  getPulse: (storeId: string, eventId: string, token?: string | null) =>
    apiClient.get<EventPulse>(`/stores/${storeId}/lives/${eventId}/pulse`, token),

  // Event Details - List carts for an event
  listCarts: (storeId: string, eventId: string, token?: string | null) =>
    apiClient.get<EventCartsResponse>(`/stores/${storeId}/lives/${eventId}/carts`, token),

  // Event Details - as falas de cada transmissão, com o desfecho de cada uma.
  listComments: (storeId: string, eventId: string, token?: string | null) =>
    apiClient.get<EventCommentsResponse>(`/stores/${storeId}/lives/${eventId}/comments`, token),

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
  // SESSION PRODUCTS - o que ESTA transmissão pode vender
  //
  // As quatro rotas equivalentes por evento saíram do backend: elas escreviam
  // em todas as sessões de uma vez, que é justamente o contrário do que o
  // lojista quer — a live vende qualquer coisa, o story vende uma peça só.
  // ==========================================================================

  listSessionProducts: (
    storeId: string,
    eventId: string,
    sessionId: string,
    token?: string | null
  ) =>
    apiClient.get<SessionProductsResponse>(
      `/stores/${storeId}/lives/${eventId}/sessions/${sessionId}/whitelist`,
      token
    ),

  addSessionProduct: (
    storeId: string,
    eventId: string,
    sessionId: string,
    payload: AddSessionProductPayload,
    token?: string | null
  ) =>
    apiClient.post<SessionProduct>(
      `/stores/${storeId}/lives/${eventId}/sessions/${sessionId}/whitelist`,
      payload,
      token
    ),

  // Chaveado por productId — nunca pelo id da linha da lista.
  updateSessionProduct: (
    storeId: string,
    eventId: string,
    sessionId: string,
    productId: string,
    payload: UpdateSessionProductPayload,
    token?: string | null
  ) =>
    apiClient.put<SessionProduct>(
      `/stores/${storeId}/lives/${eventId}/sessions/${sessionId}/whitelist/${productId}`,
      payload,
      token
    ),

  removeSessionProduct: (
    storeId: string,
    eventId: string,
    sessionId: string,
    productId: string,
    token?: string | null
  ) =>
    apiClient.delete<void>(
      `/stores/${storeId}/lives/${eventId}/sessions/${sessionId}/whitelist/${productId}`,
      token
    ),

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
