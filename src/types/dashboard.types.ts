export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  activeProducts: number
  totalLives: number
}

export interface MonthlyRevenueItem {
  month: string
  monthNum: number
  revenue: number
}

export interface MonthlyRevenueResponse {
  data: MonthlyRevenueItem[]
}

export interface TopProductItem {
  id: string
  name: string
  keyword: string
  totalSold: number
  totalRevenue: number
}

export interface TopProductsResponse {
  data: TopProductItem[]
}

// =============================================================================
// ANALYTICS - Revenue Attribution
// =============================================================================

export interface EventWithRevenue {
  id: string
  title: string
  status: string
  createdAt: string
  totalComments: number
  totalCarts: number
  paidCarts: number
  confirmedRevenue: number
  conversionRate: number
}

export interface EventsWithRevenueResponse {
  data: EventWithRevenue[]
}

export interface AggregatedFunnel {
  totalComments: number
  totalCarts: number
  checkoutCarts: number
  paidCarts: number
  confirmedRevenue: number
  averageTicket: number
  commentsToCartsRate: number
  cartsToCheckoutRate: number
  checkoutToPaidRate: number
  overallConversionRate: number
}
