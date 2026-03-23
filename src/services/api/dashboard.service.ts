import { apiClient } from "./client"
import type { DashboardStats, MonthlyRevenueResponse, TopProductsResponse } from "@/types"

export const dashboardService = {
  getStats: (storeId: string, token?: string | null) =>
    apiClient.get<DashboardStats>(`/stores/${storeId}/dashboard/stats`, token),

  getMonthlyRevenue: (storeId: string, token?: string | null) =>
    apiClient.get<MonthlyRevenueResponse>(`/stores/${storeId}/dashboard/chart`, token),

  getTopProducts: (storeId: string, token?: string | null) =>
    apiClient.get<TopProductsResponse>(`/stores/${storeId}/dashboard/top-products`, token),
}
