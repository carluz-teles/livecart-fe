import type { Pagination, Sorting, PaginatedResponse } from "./api.types"
import type { PackageFormat } from "./product.types"
import type { Shipment, ShipmentStatus } from "./shipment.types"

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
  // Per-item physical dimensions. Backend always sends these; 0 means the
  // product has no dimensions registered (NOT "zero grams" / "zero cm").
  weightGrams: number
  heightCm: number
  widthCm: number
  lengthCm: number
  packageFormat: PackageFormat
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

export interface OrderItemPreview {
  productName: string
  productImage: string | null
  quantity: number
}

export interface Order {
  id: string
  // Per-store sequential order number (starts at 1000 for each store). UI
  // surfaces it as "#{shortId}". The UUID still owns the URL key — short_id is
  // only the human-friendly handle.
  shortId: number
  liveSessionId: string
  liveTitle: string
  livePlatform: string
  customerHandle: string
  customerId: string
  // Empty until the buyer fills the checkout form.
  customerName: string
  customerEmail: string
  // Mirrors the live event's freeShipping flag.
  freeShipping: boolean
  status: OrderStatus
  paymentStatus: PaymentStatus
  // Latest shipment status, "" when no shipment has been created yet.
  shipmentStatus: ShipmentStatus | ""
  // True when the buyer picked a shipping service at checkout — even when no
  // shipment row was created yet. Lets the list show "Aguardando emissão"
  // instead of "Sem envio" between checkout and shipment creation.
  hasShipping: boolean
  items: OrderItem[]
  // Lightweight preview for the list page (avatar stack); empty when full
  // items are loaded (detail).
  itemsPreview: OrderItemPreview[]
  totalItems: number
  totalAmount: number
  paidAt: string | null
  createdAt: string
  expiresAt: string | null
  // True only for the buyer's earliest paid order in this store.
  isFirstPurchase: boolean
}

export interface OrderComment {
  id: string
  text: string
  createdAt: string
}

export interface OrderCustomer {
  name: string
  email: string
  document: string
  phone?: string
}

// Snapshot of the store on the order — shape is distinct from the global
// Store type because this one always carries CNPJ/address non-null.
export interface OrderStoreAddress {
  zipCode: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

export interface OrderStore {
  id: string
  name: string
  logoUrl: string | null
  document: string
  email: string
  phone: string
  address: OrderStoreAddress
  shippingDefaults: {
    packageWeightGrams: number
    packageFormat: PackageFormat
    heightCm: number | null
    widthCm: number | null
    lengthCm: number | null
  }
}

export interface OrderDetail extends Order {
  // Cart token; the public buyer link is `${origin}/cart/${token}`. Used by
  // the admin "copiar link do checkout" action.
  token: string
  comments: OrderComment[]
  // Contact + address are null until the buyer fills them at checkout.
  customer: OrderCustomer | null
  shippingAddress: ShippingAddressPayload | null
  // Null until the buyer picks a freight option.
  shipping: PublicCheckoutSelectedShipping | null
  // Null until POST /shipments is called for this order.
  shipment: Shipment | null
  // Always present — backend snapshots the store onto the order.
  store: OrderStore
  // Lifecycle of the post-payment Tiny order creation. Drives the "tentar
  // novamente" banner on the order detail page when CreateOrder failed and
  // the cart's stock stayed reserved.
  erpFinalisation: ERPFinalisation | null
}

// Mirror of integration.Service finalisation state. Status `failed` means
// the cart still owns the unit (reservation re-created) and the merchant
// can retry via POST /orders/:id/retry-erp.
export interface ERPFinalisation {
  status: "pending" | "done" | "failed"
  lastError?: string
  lastAttemptAt?: string
  attemptsCount: number
  canRetry: boolean
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
  // Tri-state: undefined = ignore; true = only orders with at least one shipment;
  // false = only orders without any shipment. Service layer serializes as
  // "true"/"false" strings because buildQueryString omits boolean false.
  hasShipment?: boolean
  // Filter by latest shipment status (normalized enum). Implies hasShipment=true.
  shipmentStatus?: ShipmentStatus[]
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
// CART MUTATIONS / UPSELL (dashboard)
// =============================================================================

export type CartMutationType =
  | "item_added"
  | "item_removed"
  | "quantity_increased"
  | "quantity_decreased"

export type CartMutationSource = "buyer_checkout" | "live_add" | "merchant"

export interface OrderUpsellItem {
  productId: string
  name: string
  keyword?: string
  imageUrl?: string | null
  quantity: number
  unitPrice: number
}

export interface OrderUpsellMutation {
  id: string
  productId: string
  productName: string
  keyword?: string
  imageUrl?: string | null
  mutationType: CartMutationType
  quantityBefore: number
  quantityAfter: number
  unitPrice: number
  source: CartMutationSource
  createdAt: string
}

export interface OrderUpsellSummary {
  hasSnapshot: boolean
  snapshotTakenAt?: string
  initialSubtotalCents: number
  finalSubtotalCents: number
  deltaCents: number
  mutationCount: number
  initialItems: OrderUpsellItem[]
  mutations: OrderUpsellMutation[]
}

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
  /** Available stock for the SKU (product.stock at read time). The UI uses
   *  this together with maxQuantityPerItem to disable the "+" button when the
   *  buyer would exceed either limit. */
  availableStock: number
}

export interface PublicCheckoutEvent {
  id: string
  title: string
  freeShipping: boolean
  /** Discount percent (0-100) applied at checkout when the buyer pays with
   *  Pix. 0 disables the feature. */
  pixDiscountPercent: number
}

export interface PublicCheckoutSelectedShipping {
  provider: string // "melhor_envio" | "smartenvios" | future providers
  serviceId: string // opaque — Melhor Envio returns int-as-string, SmartEnvios returns ObjectId
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
  // Absolute coupon discount in cents (0 when none). `total` already reflects
  // the subtraction; this is exposed so the FE can show the "−R$ X" line.
  couponDiscount: number
  // Configured event-level Pix discount (0 when disabled). Applied
  // conditionally at payment time when the buyer picks Pix; `total` does NOT
  // subtract it.
  pixDiscountPercent: number
  // Absolute Pix discount in cents that *would* apply if the buyer pays with
  // Pix. Pre-computed by the backend off (subtotal − couponDiscount) so the
  // FE can preview the discounted total without re-running the math.
  pixDiscountCents: number
  total: number
  totalItems: number
  hasShippingQuote: boolean
}

// AppliedCoupon mirrors the BE snapshot of the coupon currently attached to
// the cart. Absent when no coupon is applied.
//
// `type` and `maxDiscountCents` carry the context the checkout uses to
// explain partial free-shipping discounts:
//   - `maxDiscountCents > 0` means the merchant set a ceiling.
//   - `discountCents < shipping.costCents` means either the cheapest
//     available service or the merchant cap clamped the refund — the FE
//     renders the matching reason inline on the applied tile.
export interface AppliedCoupon {
  code: string
  type?: "percent" | "fixed" | "free_shipping"
  discountCents: number
  maxDiscountCents?: number
  // Threshold the cart subtotal must keep meeting for the coupon to stay
  // applied. The buyer sees this referenced in the auto-removal toast
  // ("compra mínima de R$ X não atingida") when an item edit drops them
  // below it. 0 / undefined when the merchant didn't set a min purchase.
  minPurchaseCents?: number
}

// ApplyCouponResponse is what POST /api/public/checkout/:token/coupon returns
// after a successful apply. Contains the new totals so the FE doesn't need a
// second round-trip.
export interface ApplyCouponResponse {
  code: string
  type: "percent" | "fixed" | "free_shipping"
  appliedValueCents: number
  // Merchant-set ceiling for free-shipping coupons (0 when uncapped, omitted
  // for percent / fixed). Surfaced so the apply call can hydrate the cart's
  // appliedCoupon optimistically without a refetch round-trip.
  maxDiscountCents?: number
  subtotalCents: number
  shippingCostCents: number
  newTotalCents: number
}

export interface PublicCheckoutCustomer {
  name: string
  document: string // CPF, digits only
  phone?: string
  email: string
}

export interface PublicCheckoutPayment {
  method: PaymentMethod
  paidAt: string
  // Gateway transaction id. Populated for every paid cart (PIX and card).
  paymentId: string
  // Card-only fields. Older paid carts may not have these even when method==="card".
  installments?: number
  cardBrand?: string
  lastFourDigits?: string
  // Acquirer authorization code / NSU. Card only; absent on PIX. Some
  // acquirers return neither auth code nor NSU — backend omits in that case.
  authorizationCode?: string
}

export interface PublicCheckoutCart {
  id: string
  token: string
  status: CartStatus
  customerEmail: string | null
  paymentStatus: PaymentStatus | null
  paidAt: string | null
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
  // Populated when paymentStatus === "paid" (post-payment receipt) OR when the
  // backend prefills from the buyer's last paid order on this store
  // (returning-buyer flow). `isReturningCustomer` distinguishes the second case.
  customer?: PublicCheckoutCustomer | null
  shippingAddress?: ShippingAddressPayload | null
  isReturningCustomer?: boolean
  payment?: PublicCheckoutPayment | null
  appliedCoupon?: AppliedCoupon | null
}

// =============================================================================
// SHIPPING QUOTE (public checkout)
// =============================================================================

export interface ShippingQuoteRequest {
  zipCode: string // digits; backend normalizes
}

export interface ShippingOption {
  id: string // opaque service id; never parseInt this — SmartEnvios returns hex ObjectIds
  provider: string // "melhor_envio" | "smartenvios" | future providers
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
  serviceId: string
  zipCode: string // same CEP used in the quote; backend normalizes hyphen
  // Optional when only one shipping provider is active — backend infers. Always
  // send it when the quote carries provider info so multi-provider stores work.
  provider?: string
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
