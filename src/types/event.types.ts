import type { Pagination, Sorting, PaginatedResponse } from "./api.types"

// =============================================================================
// EVENT STATUS & PLATFORM
// =============================================================================

export type EventStatus = "scheduled" | "active" | "ended"
export type EventType = "single" | "multi" | "post"
export type Platform = "instagram" // Only Instagram supported for now

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

export interface EventSession {
  id: string
  eventId: string
  status: string // active, live, ended
  startedAt: string | null
  endedAt: string | null
  totalComments: number
  totalCarts: number
  paidCarts: number
  totalRevenue: number
  paidRevenue: number
  platforms: EventPlatform[]
  comments?: SessionComment[]
  createdAt: string
  updatedAt: string
}

// =============================================================================
// EVENT - Container for sessions. Carts are tied to events.
// =============================================================================

export interface Event {
  id: string
  title: string
  type: EventType
  status: EventStatus
  totalOrders: number
  closeCartOnEventEnd: boolean
  cartExpirationMinutes: number | null
  cartMaxQuantityPerItem: number | null
  freeShipping: boolean
  /** Discount percent (0-100) applied at checkout when the buyer pays with
   *  Pix. 0 disables the feature. Stacks with coupons. */
  pixDiscountPercent: number
  scheduledAt: string | null
  endsAt: string | null
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
  type?: EventType
  platform?: Platform
  platformLiveId?: string
  // Scheduling
  scheduledAt?: string | null
  description?: string | null
  // Cart settings (override store defaults)
  closeCartOnEventEnd?: boolean
  cartExpirationMinutes?: number | null
  cartMaxQuantityPerItem?: number | null
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
  endsAt?: string | null
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
  endsAt?: string | null
  cartExpirationMinutes?: number | null
  cartMaxQuantityPerItem?: number | null
}

export interface CreateEventResponse {
  id: string
  title: string
  type: EventType
  platform: string
  status: string
  createdAt: string
}

// Update Event
export interface UpdateEventPayload {
  title: string
  pixDiscountPercent?: number
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
}

// Add Platform (reconnect - add platform ID to existing session)
export interface AddPlatformPayload {
  platform: Platform
  platformLiveId: string
}

// Stats
export interface EventStats {
  totalLives: number   // totalEvents
  activeLives: number  // activeEvents
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
