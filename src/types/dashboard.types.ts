export interface DashboardStats {
  total_revenue: number
  total_orders: number
  active_products: number
  total_lives: number
}

export interface MonthlyRevenueItem {
  month: string
  month_num: number
  revenue: number
}

export interface MonthlyRevenueResponse {
  data: MonthlyRevenueItem[]
}

export interface TopProductItem {
  id: string
  name: string
  keyword: string
  total_sold: number
  total_revenue: number
}

export interface TopProductsResponse {
  data: TopProductItem[]
}
