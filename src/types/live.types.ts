import type { Pagination, Sorting, PaginatedResponse } from "./api.types"

export type LiveStatus = "scheduled" | "live" | "ended" | "cancelled"
export type LivePlatform = "instagram" | "tiktok" | "youtube" | "facebook"

export interface LiveSession {
  id: string
  title: string
  status: LiveStatus
  platform: LivePlatform
  platform_live_id: string
  started_at: string | null
  ended_at: string | null
  total_comments: number
  total_orders: number
  created_at: string
  updated_at: string
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
  total_lives: number
  active_lives: number
  total_orders: number
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
