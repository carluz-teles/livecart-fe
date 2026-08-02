import type { Pagination, Sorting, PaginatedResponse } from "./api.types"
import type { SessionType } from "@/lib/event-kind"

export type { SessionType }

// =============================================================================
// EVENT STATUS & PLATFORM
// =============================================================================

export type EventStatus = "scheduled" | "active" | "ended"
export type Platform = "instagram" // Only Instagram supported for now

/** Vocabulário LEGADO de `live_events.type`, dropado pela migration 000120.
 *
 *  Sobrevive só no payload de criação de live, onde `single`/`multi` ainda
 *  descrevem a intenção do lojista ao abrir a campanha. **Nenhuma tela pode
 *  decidir nada com ele** — a espécie de um evento vem das sessões, via
 *  `getEventKind` em `@/lib/event-kind`. */
export type LegacyEventType = "single" | "multi"

// =============================================================================
// PLATFORM - Platform IDs associated with sessions
// =============================================================================

export interface EventPlatform {
  id: string
  platform: Platform
  platformLiveId: string
  addedAt: string
}

// =============================================================================
// SESSION - Platform-agnostic broadcast with start/end times
// =============================================================================

export interface SessionComment {
  handle: string
  text: string
}

/** Métrica de UMA transmissão, nos dois níveis (Fatia 5).
 *
 *  Confirmado é o congelado do pedido pago; projetado é o que está nos
 *  carrinhos abertos. Sempre em GMV bruto: cupom é do evento e frete é do
 *  carrinho, então nenhum dos dois tem transmissão.
 *
 *  Substitui `totalRevenue`/`paidRevenue`/`totalCarts`, que somavam o carrinho
 *  INTEIRO na transmissão em que ele nasceu — numa campanha de uma semana isso
 *  creditava a semana toda à primeira live. */
export interface SessionRevenue {
  paidCarts: number
  soldUnits: number
  confirmedRevenue: number
  openCarts: number
  projectedUnits: number
  projectedRevenue: number
}

export interface EventSession extends SessionRevenue {
  id: string
  eventId: string
  type: string // live, post, reel, story
  status: string // active, live, ended
  sequenceOrder: number
  startedAt: string | null
  endedAt: string | null
  totalComments: number
  platforms: EventPlatform[]
  comments?: SessionComment[]
  createdAt: string
  updatedAt: string
}

/** Uma linha do relatório por transmissão. `sessionId` nulo é o balde "sem
 *  transmissão" (item posto pelo painel, ou carrinho anterior ao log de
 *  adições) — ele existe de propósito: escondê-lo faz a soma das transmissões
 *  não fechar com o total do evento. */
export interface SessionMetrics extends SessionRevenue {
  sessionId: string | null
  sequenceOrder: number
  type: string
  status: string
  /** `"first_touch"` = esta transmissão já existia antes do corte da atribuição
   *  (migration 000119), então os números dela incluem período em que o produto
   *  inteiro era creditado à sessão da PRIMEIRA adição. `"addition_log"` = ela
   *  nasceu depois do corte e é 100% derivada do log de adições. */
  attributionSource: string
}

/** Métrica do evento com a quebra por transmissão. `confirmedRevenue` e
 *  `projectedRevenue` são, por construção, a soma exata de `sessions` +
 *  `unattributed`, e batem com os mesmos campos de `EventDetailStats`. */
export interface EventSessionMetrics {
  eventId: string
  confirmedRevenue: number
  projectedRevenue: number
  sessions: SessionMetrics[]
  unattributed: SessionMetrics | null
  /** Instante em que "receita por transmissão" mudou de definição (D26). Nulo
   *  só se o marcador não existir no banco. */
  attributionCutoverAt: string | null
  attributionCutoverNote?: string
}

// =============================================================================
// EVENT - Container for sessions. Carts are tied to events.
// =============================================================================

export interface Event {
  id: string
  title: string
  /** Espécies distintas das transmissões desta campanha ({live, post, reel,
   *  story}). É a fonte de "que evento é este" — `live_events.type` não existe
   *  mais a partir da 000120. Lista vazia = campanha ainda sem transmissão.
   *  Sempre consumir via `getEventKind` (`@/lib/event-kind`). */
  sessionTypes: string[]
  status: EventStatus
  totalOrders: number
  closeCartOnEventEnd: boolean
  cartExpirationMinutes: number | null
  cartMaxQuantityPerItem: number | null
  freeShipping: boolean
  /** Discount percent (0-100) applied at checkout when the buyer pays with
   *  Pix. 0 disables the feature. Stacks with coupons. */
  pixDiscountPercent: number
  /** Abertura da janela comercial. Fora dela comentário não vira carrinho. */
  scheduledAt: string | null
  /** Fechamento da janela comercial (RN-05, obrigatório na criação). É o teto
   *  que garante que nenhum carrinho fica sem prazo: durante a campanha o
   *  carrinho não expira, e o relógio só começa quando ela fecha. */
  endsAt: string | null
  /** RN-10 — minutos extras que quem é promovido da fila ganha para pagar,
   *  contados a partir do momento em que o produto liberou. Vale para o
   *  carrinho inteiro e não acumula. */
  waitlistNotifiedTtlMinutes: number
  description: string | null
  productCount: number
  upsellCount: number
  sessions?: EventSession[]
  createdAt: string
  updatedAt: string
}

// =============================================================================
// REQUEST/RESPONSE TYPES
// =============================================================================

// Create Event (with optional session + platform)
export interface CreateEventPayload {
  title: string
  type?: LegacyEventType
  platform?: Platform
  platformLiveId?: string
  // Janela comercial da campanha (RN-05).
  startsAt?: string | null
  /** OBRIGATÓRIO no backend (`validate:"required"`). Sem ele o POST responde
   *  422 — foi assim que a criação de evento ficou quebrada. */
  endsAt: string
  /** Sinônimo legado de `startsAt`. Continua aceito pelo backend; o formulário
   *  escreve `startsAt`. */
  scheduledAt?: string | null
  description?: string | null
  // Cart settings (override store defaults)
  closeCartOnEventEnd?: boolean
  cartExpirationMinutes?: number | null
  cartMaxQuantityPerItem?: number | null
  waitlistNotifiedTtlMinutes?: number | null
  freeShipping?: boolean
  pixDiscountPercent?: number
}

// Payload to publish an image post on Instagram and create its post event
export interface CreateInstagramPostPayload {
  imageUrl: string
  imageKey?: string
  caption?: string
  title?: string
  productIds: string[]
  startsAt?: string | null
  /** OBRIGATÓRIO — mesma regra do evento de live (RN-05). */
  endsAt: string
  cartExpirationMinutes?: number | null
  cartMaxQuantityPerItem?: number | null
  // Stable per selected media so a retried submit (after a client timeout)
  // returns the original post instead of publishing a duplicate.
  idempotencyKey?: string
}

// Payload to create a post-commerce event (maps an Instagram post + products)
export interface CreatePostEventPayload {
  title?: string
  mediaId: string
  mediaPermalink?: string
  mediaThumbnailUrl?: string
  mediaCaption?: string
  productIds: string[]
  startsAt?: string | null
  /** OBRIGATÓRIO — mesma regra do evento de live (RN-05). */
  endsAt: string
  cartExpirationMinutes?: number | null
  cartMaxQuantityPerItem?: number | null
}

export interface CreateEventResponse {
  id: string
  title: string
  platform: string
  status: string
  createdAt: string
}

/** Edição do evento. Campo ausente = "não mexer"; string vazia em `startsAt` =
 *  "limpar". `endsAt` não aceita vazio — o backend recusa remover o teto. */
export interface UpdateEventPayload {
  title: string
  pixDiscountPercent?: number
  startsAt?: string | null
  endsAt?: string
  waitlistNotifiedTtlMinutes?: number
}

// End Event - payload is now empty since auto-send is handled via Private Reply during the live
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EndEventPayload {}

export interface EndEventResponse {
  live: Event
  cartsFinalized: number
  autoSendLinks: boolean
}

// Create Session (add new session to existing event)
export interface CreateSessionPayload {
  platform: Platform
  platformLiveId: string
  /** Espécie da transmissão. Omitir grava `live` — foi assim que toda sessão
   *  criada pelo painel nasceu `live`, inclusive as de post. */
  type?: SessionType
}

// Add Platform (reconnect - add platform ID to existing session)
export interface AddPlatformPayload {
  platform: Platform
  platformLiveId: string
}

/** Contadores do topo de /events.
 *
 *  `totalLives`/`activeLives` sempre contaram EVENTOS — o nome mentia desde
 *  antes do guarda-chuva e agora mente de forma visível, porque uma campanha
 *  tem live, post e story ao mesmo tempo. O backend emite os dois pares com o
 *  MESMO valor durante a transição. */
export interface EventStats {
  totalEvents: number
  activeEvents: number
  /** @deprecated conta eventos, não lives. Use `totalEvents`. */
  totalLives?: number
  /** @deprecated conta eventos, não lives. Use `activeEvents`. */
  activeLives?: number
  totalOrders: number
  totalRevenue: number // cents
}

// =============================================================================
// FILTERS & LIST PARAMS
// =============================================================================

export interface EventFilters {
  status?: EventStatus[]
  dateFrom?: string
  dateTo?: string
}

export interface EventListParams {
  search?: string
  pagination?: Pagination
  sorting?: Sorting
  filters?: EventFilters
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

export type EventListResponse = PaginatedResponse<Event>

// =============================================================================
// EVENT DETAILS - Stats and Cart Listing
// =============================================================================

// Stats for a specific event
export interface EventDetailStats {
  totalComments: number
  totalCarts: number
  openCarts: number
  checkoutCarts: number
  paidCarts: number
  totalProductsSold: number
  projectedRevenue: number
  confirmedRevenue: number
}

// Cart with total value for event details page
export interface EventCart {
  id: string
  token: string
  sessionId: string | null
  platformUserId: string
  platformHandle: string
  status: string
  paymentStatus: string | null
  totalValue: number
  totalItems: number
  availableItems: number
  waitlistedItems: number
  createdAt: string
  expiresAt: string | null
}

// Response types
export interface EventDetailStatsResponse {
  totalComments: number
  totalCarts: number
  openCarts: number
  checkoutCarts: number
  paidCarts: number
  totalProductsSold: number
  projectedRevenue: number
  confirmedRevenue: number
}

/** Tiny change-signal polled cheaply for near-real-time refresh. When a field
 *  moves, the client refetches the matching heavy list (carts / comments). */
export interface EventPulse {
  orders: number
  comments: number
  ordersChangedAt: string
}

export interface EventCartsResponse {
  data: EventCart[]
}

// A live comment with its Instagram comment ID, for the moderation UI
export interface EventComment {
  id: string
  platformCommentId: string
  handle: string
  text: string
  hasPurchaseIntent: boolean
  /** Mirrors the Instagram hide state so the hide button toggles hide ↔ unhide. */
  hidden: boolean
  createdAt: string
}

export interface EventCommentsResponse {
  data: EventComment[]
}

/** A cart currently in checkout phase (status='checkout', not yet paid).
 *  Surfaced live on the merchant dashboard so the operator can see buyer
 *  edits in real time before the payment lands. */
export interface ActiveCheckout {
  id: string
  platformHandle: string
  token: string
  status: string
  paymentStatus?: string
  createdAt: string
  expiresAt?: string | null
  initialSubtotalCents: number
  currentSubtotalCents: number
  deltaCents: number
  mutationCount: number
  lastMutationAt?: string | null
}

// Product sold in an event (sales report)
export interface EventSoldProduct {
  id: string
  name: string
  imageUrl: string | null
  keyword: string
  totalQuantity: number
  totalRevenue: number
}

export interface EventSoldProductsResponse {
  data: EventSoldProduct[]
}

// =============================================================================
// EVENT WHITELIST - Products allowed for sale in an event
// =============================================================================

export interface EventWhitelistProduct {
  id: string
  productId: string
  name: string
  keyword: string
  imageUrl: string | null
  originalPrice: number
  specialPrice: number | null
  effectivePrice: number
  maxQuantity: number | null
  displayOrder: number
  featured: boolean
  stock: number
  productActive: boolean
}

export interface AddEventProductPayload {
  productId: string
  specialPrice?: number | null
  maxQuantity?: number | null
  displayOrder?: number
  featured?: boolean
}

export interface UpdateEventProductPayload {
  specialPrice?: number | null
  maxQuantity?: number | null
  displayOrder?: number
  featured?: boolean
}

export interface EventWhitelistResponse {
  data: EventWhitelistProduct[]
}

// =============================================================================
// EVENT UPSELLS - Suggested products at checkout
// =============================================================================

export interface EventUpsell {
  id: string
  productId: string
  name: string
  keyword: string
  imageUrl: string | null
  originalPrice: number
  discountPercent: number
  discountedPrice: number
  messageTemplate: string | null
  displayOrder: number
  active: boolean
  stock: number
}

export interface AddEventUpsellPayload {
  productId: string
  discountPercent: number
  messageTemplate?: string | null
  displayOrder?: number
  active?: boolean
}

export interface UpdateEventUpsellPayload {
  discountPercent?: number
  messageTemplate?: string | null
  displayOrder?: number
  active?: boolean
}

export interface EventUpsellsResponse {
  data: EventUpsell[]
}

// =============================================================================
// LIVE MODE - Active Product & Pause Processing
// =============================================================================

export interface ActiveProduct {
  id: string
  name: string
  keyword: string
  price: number
  imageUrl: string | null
}

export interface LiveModeState {
  processingPaused: boolean
  activeProduct: ActiveProduct | null
}

export interface SetActiveProductPayload {
  productId: string | null // null to clear
}

export interface SetProcessingPausedPayload {
  paused: boolean
}
