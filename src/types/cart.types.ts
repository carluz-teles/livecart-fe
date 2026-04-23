import type { Pagination, Sorting, PaginatedResponse } from "./api.types"

export type CartStatus = "active" | "checkout" | "completed" | "expired"
export type OrderStatus = "active" | "checkout" | "completed" | "expired"
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage: string | null
  keyword: string
  size: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Cart {
  id: string
  token: string
  customerName: string
  customerPhone: string | null
  customerEmail: string | null
  status: CartStatus
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  liveSessionId: string
  liveTitle: string
  livePlatform: string
  customerHandle: string
  customerId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  items: OrderItem[]
  totalItems: number
  totalAmount: number
  paidAt: string | null
  createdAt: string
  expiresAt: string | null
}

export interface OrderComment {
  id: string
  text: string
  createdAt: string
}

export interface OrderDetail extends Order {
  comments: OrderComment[]
}

export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  avgTicket: number
}

export interface CartCheckoutPayload {
  customerName: string
  customerPhone: string
  customerEmail?: string
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
}

// Filters for order listing
export interface OrderFilters {
  status?: OrderStatus[]
  paymentStatus?: PaymentStatus[]
  liveSessionId?: string
  dateFrom?: string
  dateTo?: string
  totalMin?: number
  totalMax?: number
}

// Query params for listing orders
export interface OrderListParams {
  search?: string
  pagination?: Pagination
  sorting?: Sorting
  filters?: OrderFilters
}

// Response type for order listing
export type OrderListResponse = PaginatedResponse<Order>

// =============================================================================
// PUBLIC CHECKOUT TYPES
// =============================================================================

export interface PublicCheckoutItem {
  id: string
  productId: string
  name: string
  imageUrl: string | null
  keyword: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  waitlistedQuantity: number
}

export interface PublicCheckoutEvent {
  id: string
  title: string
  freeShipping: boolean
}

export interface PublicCheckoutSelectedShipping {
  serviceId: number
  serviceName: string
  carrier: string
  costCents: number
  realCostCents: number
  deadlineDays: number
  freeShipping: boolean
}

export interface PublicCheckoutStore {
  id: string
  name: string
  logoUrl: string | null
}

export interface PublicCheckoutSummary {
  subtotal: number
  shippingCost: number
  total: number
  totalItems: number
  hasShippingQuote: boolean
}

export interface PublicCheckoutCart {
  id: string
  token: string
  status: CartStatus
  customerEmail: string | null
  paymentStatus: PaymentStatus | null
  checkoutUrl: string | null
  platformHandle: string
  allowEdit: boolean
  maxQuantityPerItem: number
  expiresAt: string | null
  createdAt: string
  event: PublicCheckoutEvent
  store: PublicCheckoutStore
  items: PublicCheckoutItem[]
  summary: PublicCheckoutSummary
  shipping?: PublicCheckoutSelectedShipping | null
}

// =============================================================================
// SHIPPING QUOTE (public checkout)
// =============================================================================

export interface ShippingQuoteRequest {
  zipCode: string // digits; backend normalizes
}

export interface ShippingOption {
  id: number // Melhor Envio service_id
  service: string
  carrier: string
  carrierLogoUrl?: string | null
  priceCents: number // what the customer pays (0 when freeShipping=true)
  realPriceCents: number // actual cost (always populated)
  deadlineDays: number
  available: boolean
  error?: string
}

export interface ShippingQuoteResponse {
  quotedAt: string
  freeShipping: boolean
  options: ShippingOption[]
}

export interface SelectShippingMethodRequest {
  serviceId: number
}

export interface SelectShippingMethodResponse {
  shipping: PublicCheckoutSelectedShipping
  summary: PublicCheckoutSummary
}

export interface GenerateCheckoutRequest {
  email: string
}

export interface GenerateCheckoutResponse {
  checkoutUrl: string
  expiresAt: string | null
}

// =============================================================================
// TRANSPARENT CHECKOUT TYPES
// =============================================================================

export type PaymentProvider = "mercado_pago" | "pagarme"
export type PaymentMethod = "card" | "pix"

export interface CheckoutConfigResponse {
  provider: PaymentProvider
  publicKey: string
  availableMethods: PaymentMethod[]
  totalAmount: number
  currency: string
}

export interface ShippingAddressPayload {
  zipCode: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

export interface CheckoutCustomerInfo {
  email: string
  customerName: string
  customerDocument: string
  customerPhone?: string
  shippingAddress: ShippingAddressPayload
}

export interface ProcessCardPaymentRequest extends CheckoutCustomerInfo {
  token: string
  installments: number
  paymentMethodId?: string // For Mercado Pago
  issuerId?: string // For Mercado Pago
  deviceId?: string
}

export interface ProcessCardPaymentResponse {
  paymentId: string
  status: "approved" | "rejected" | "pending" | "in_process"
  statusDetail?: string
  message: string
  amount: number
  installments: number
  lastFourDigits?: string
  cardBrand?: string
}

export type GeneratePixRequest = CheckoutCustomerInfo

export interface GeneratePixResponse {
  paymentId: string
  qrCode: string
  qrCodeText: string
  amount: number
  expiresAt: string
  ticketUrl?: string
}

export interface PaymentStatusResponse {
  status: CartStatus
  paymentStatus: string
  paidAt: string | null
  message?: string
}
