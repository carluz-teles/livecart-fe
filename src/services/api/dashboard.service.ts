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
  CheckoutUpsellResponse,
  DashboardOverview,
  RevenueSeriesPoint,
  PeriodRange,
} from "@/types"

export const dashboardService = {
  getStats: (storeId: string, token?: string | null) =>
    apiClient.get<DashboardStats>(`/stores/${storeId}/dashboard/stats`, token),

  getMonthlyRevenue: (storeId: string, token?: string | null) =>
    apiClient.get<MonthlyRevenueResponse>(`/stores/${storeId}/dashboard/chart`, token),

  getTopProducts: (storeId: string, token?: string | null, range?: PeriodRange) =>
    apiClient.get<TopProductsResponse>(
      `/stores/${storeId}/dashboard/top-products${range ? `?from=${range.from}&to=${range.to}` : ""}`,
      token
    ),

  getTopBuyers: (storeId: string, token?: string | null, range?: PeriodRange) =>
    apiClient.get<TopBuyersResponse>(
      `/stores/${storeId}/dashboard/top-buyers${range ? `?from=${range.from}&to=${range.to}` : ""}`,
      token
    ),

  // Redesign jul/2026: KPIs + funil com estados, coerentes com o período
  getOverview: (storeId: string, range: PeriodRange, token?: string | null) =>
    apiClient.get<DashboardOverview>(
      `/stores/${storeId}/dashboard/overview?from=${range.from}&to=${range.to}`,
      token
    ),

  // Série de receita com granularidade adaptativa
  getRevenueSeries: (storeId: string, range: PeriodRange, bucket: string, token?: string | null) =>
    apiClient.get<RevenueSeriesPoint[]>(
      `/stores/${storeId}/dashboard/series?from=${range.from}&to=${range.to}&bucket=${bucket}`,
      token
    ),

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

  // Checkout upsell / downsell — net change between initial cart and paid cart
  getCheckoutUpsell: (
    storeId: string,
    token?: string | null,
    eventId?: string,
    topN: number = 5
  ) => {
    const params = new URLSearchParams()
    if (eventId) params.set("eventId", eventId)
    if (topN) params.set("topN", String(topN))
    const qs = params.toString() ? `?${params.toString()}` : ""
    return apiClient.get<CheckoutUpsellResponse>(
      `/stores/${storeId}/dashboard/checkout-upsell${qs}`,
      token
    )
  },
}
