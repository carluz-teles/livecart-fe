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

// =============================================================================
// TOP BUYERS
// =============================================================================

export interface TopBuyerItem {
  id: string
  handle: string
  totalOrders: number
  totalSpent: number
  lastPurchaseAt: string
}

export interface TopBuyersResponse {
  data: TopBuyerItem[]
}

// =============================================================================
// PRODUCT SALES (Stacked Bar Chart)
// =============================================================================

export interface ProductSalesProduct {
  id: string
  name: string
  keyword: string
}

export interface ProductSalesDataPoint {
  month: string
  monthNum: number
  values: Record<string, number>
}

export interface ProductSalesResponse {
  products: ProductSalesProduct[]
  data: ProductSalesDataPoint[]
}

// =============================================================================
// REVENUE BY PAYMENT METHOD (Pie Chart)
// =============================================================================

export interface RevenueByPaymentItem {
  paymentMethod: string
  label: string
  revenue: number
  count: number
}

export interface RevenueByPaymentResponse {
  data: RevenueByPaymentItem[]
}

// =============================================================================
// CHECKOUT UPSELL — buyer-driven mutations between initial cart and paid cart
// =============================================================================

export interface CheckoutUpsellProduct {
  productId: string
  productName: string
  imageUrl?: string | null
  units: number
  revenueCents: number
}

export interface CheckoutUpsellResponse {
  cartsWithMutations: number
  totalPaidCarts: number
  upsellCents: number
  downsellCents: number
  netCents: number
  topAdded: CheckoutUpsellProduct[]
  topRemoved: CheckoutUpsellProduct[]
}
