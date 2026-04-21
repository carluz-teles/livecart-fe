import { apiClient } from "./client"
import type {
  DashboardStats,
  MonthlyRevenueResponse,
  TopProductsResponse,
  TopBuyersResponse,
  ProductSalesResponse,
  EventsWithRevenueResponse,
  AggregatedFunnel,
  RevenueByPaymentResponse,
} from "@/types"

export const dashboardService = {
  getStats: (storeId: string, token?: string | null) =>
    apiClient.get<DashboardStats>(`/stores/${storeId}/dashboard/stats`, token),

  getMonthlyRevenue: (storeId: string, token?: string | null) =>
    apiClient.get<MonthlyRevenueResponse>(`/stores/${storeId}/dashboard/chart`, token),

  getTopProducts: (storeId: string, token?: string | null) =>
    apiClient.get<TopProductsResponse>(`/stores/${storeId}/dashboard/top-products`, token),

  getTopBuyers: (storeId: string, token?: string | null) =>
    apiClient.get<TopBuyersResponse>(`/stores/${storeId}/dashboard/top-buyers`, token),

  getProductSales: (storeId: string, token?: string | null) =>
    apiClient.get<ProductSalesResponse>(`/stores/${storeId}/dashboard/product-sales`, token),

  // Analytics - Revenue Attribution
  getEventsWithRevenue: (storeId: string, token?: string | null, limit: number = 20) =>
    apiClient.get<EventsWithRevenueResponse>(`/stores/${storeId}/dashboard/analytics/events?limit=${limit}`, token),

  getAggregatedFunnel: (storeId: string, token?: string | null, days: number = 30) =>
    apiClient.get<AggregatedFunnel>(`/stores/${storeId}/dashboard/analytics/funnel?days=${days}`, token),

  // Revenue by Payment Method
  getRevenueByPayment: (storeId: string, token?: string | null) =>
    apiClient.get<RevenueByPaymentResponse>(`/stores/${storeId}/dashboard/revenue-by-payment`, token),
}
