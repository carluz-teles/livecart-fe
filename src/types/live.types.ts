export type LiveStatus = "scheduled" | "live" | "ended" | "cancelled"

export interface LiveSession {
  id: string
  title: string
  status: LiveStatus
  scheduledAt: string
  startedAt: string | null
  endedAt: string | null
  viewerCount: number
  orderCount: number
  totalRevenue: number
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
  scheduledAt: string
}

export interface LiveStats {
  totalOrders: number
  totalViewers: number
  detectedThisMinute: number
  totalRevenue: number
}
