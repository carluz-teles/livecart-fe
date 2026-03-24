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
