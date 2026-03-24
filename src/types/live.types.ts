import type { Pagination, Sorting, PaginatedResponse } from "./api.types"

export type LiveStatus = "scheduled" | "live" | "ended" | "cancelled"
export type LivePlatform = "instagram" | "tiktok" | "youtube" | "facebook"

export interface LiveSession {
  id: string
  title: string
  status: LiveStatus
  platform: LivePlatform
  platformLiveId: string
  startedAt: string | null
  endedAt: string | null
  totalComments: number
  totalOrders: number
  createdAt: string
  updatedAt: string
}

export interface LiveComment {
  id: string
  liveSessionId: string
  authorName: string
  authorAvatar: string | null
  content: string
  keyword: string | null
  matchedProductId: string | null
  processedAt: string | null
  createdAt: string
}

export interface CreateLiveSessionPayload {
  title: string
  platform: LivePlatform
  platformLiveId: string
}

export interface UpdateLiveSessionPayload {
  title?: string
  platform?: LivePlatform
  platformLiveId?: string
}

export interface LiveStats {
  totalLives: number
  activeLives: number
  totalOrders: number
}

// Filters for live listing
export interface LiveFilters {
  status?: LiveStatus[]
  platform?: LivePlatform[]
  dateFrom?: string
  dateTo?: string
}

// Query params for listing lives
export interface LiveListParams {
  search?: string
  pagination?: Pagination
  sorting?: Sorting
  filters?: LiveFilters
}

// Response type for live listing
export type LiveListResponse = PaginatedResponse<LiveSession>
