import type { Pagination, Sorting, PaginatedResponse } from "./api.types"

// =============================================================================
// EVENT STATUS & PLATFORM
// =============================================================================

export type EventStatus = "active" | "ended"
export type EventType = "single" | "multi"
export type Platform = "instagram" | "tiktok" | "youtube" | "facebook"

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
}

// End Event
export interface EndEventPayload {
  autoSendCheckoutLinks?: boolean
}

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
  openCarts: number
  paidCarts: number
  totalProductsSold: number
  projectedRevenue: number
  confirmedRevenue: number
}

// Cart with total value for event details page
export interface EventCart {
  id: string
  platformUserId: string
  platformHandle: string
  status: string
  paymentStatus: string | null
  totalValue: number
  totalItems: number
  createdAt: string
  expiresAt: string | null
}

// Response types
export interface EventDetailStatsResponse {
  totalComments: number
  openCarts: number
  paidCarts: number
  totalProductsSold: number
  projectedRevenue: number
  confirmedRevenue: number
}

export interface EventCartsResponse {
  data: EventCart[]
}

// Product sold in an event
export interface EventProduct {
  id: string
  name: string
  imageUrl: string | null
  keyword: string
  totalQuantity: number
  totalRevenue: number
}

export interface EventProductsResponse {
  data: EventProduct[]
}
