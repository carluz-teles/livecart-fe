import type { Pagination, Sorting, PaginatedResponse } from "./api.types"

export interface CustomerShippingAddress {
  zipCode?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
}

export interface Customer {
  id: string
  handle: string
  email?: string | null
  phone?: string | null
  // Captured at the most recent checkout. Empty until the buyer fills the
  // public cart form.
  name?: string | null
  document?: string | null
  totalOrders: number
  totalSpent: number
  lastOrderAt: string | null
  firstOrderAt: string | null
  // Last destination the buyer typed at checkout. Null until any cart of
  // theirs has shipping info.
  lastShippingAddress?: CustomerShippingAddress | null
}

// Lightweight order summary returned by the customer-detail drawer.
export interface CustomerOrder {
  id: string
  shortId: number
  status: string
  paymentStatus: string | null
  totalItems: number
  totalValue: number
  paidAt: string | null
  createdAt: string | null
}

export interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  avgSpentPerCustomer: number
}

// Filters for customer listing
export interface CustomerFilters {
  hasOrders?: boolean
  orderCountMin?: number
  orderCountMax?: number
  totalSpentMin?: number
  totalSpentMax?: number
  dateFrom?: string
  dateTo?: string
}

// Query params for listing customers
export interface CustomerListParams {
  search?: string
  pagination?: Pagination
  sorting?: Sorting
  filters?: CustomerFilters
}

// Response type for customer listing
export type CustomerListResponse = PaginatedResponse<Customer>

// Blocked handle (a customer prevented from purchasing). Lives in its own
// table on the backend: customers are not deleted when blocked — purchases
// are filtered at the comment-processor layer, and any open cart they have
// gets soft-cancelled with cancelled_reason='customer_blocked'.
export interface BlockedHandle {
  id: string
  handle: string
  reason?: string | null
  blockedAt: string
  unblockedAt?: string | null
  blockedByUserId?: string | null
}

export interface BlockedHandlesResponse {
  data: BlockedHandle[]
  total: number
}

export interface BlockHandlePayload {
  handle: string
  reason?: string
}

// VipHandle — cliente VIP: carrinho que nunca expira e acumula compras de
// vários eventos num só carrinho, até ser pago ou cancelado. Oposto do bloqueio.
export interface VipHandle {
  id: string
  handle: string
  addedAt: string
  removedAt?: string | null
  addedByUserId?: string | null
  cartsUpdated?: number
  // Quantos carrinhos abertos foram fundidos no eterno na promoção.
  cartsMerged?: number
  // Quantos ficaram de fora da fusão por já terem pedido no ERP — esses seguem
  // com prazo, e portanto seguem expirando.
  cartsSkipped?: number
  // O @ virou VIP, mas os carrinhos que ele já tinha não foram consolidados.
  activationFailed?: boolean
}

export interface VipHandlesResponse {
  data: VipHandle[]
  total: number
}

export interface AddVipPayload {
  handle: string
}

// SeenHandle é um arroba que já mandou mensagem nas lives da loja. NÃO é um
// Customer: a plateia inclui quem só comentou e nunca comprou — e é justamente
// esse o caso a bloquear (a conta secundária da própria loja, que instrui a
// audiência e acaba gerando pedido).
export interface SeenHandle {
  handle: string
  // Todas as mensagens dele nas lives da loja.
  messageCount: number
  // Quantas viraram item no carrinho. Junto com messageCount é o sinal que
  // separa a conta de instrução da compradora de verdade.
  orderMessageCount: number
  lastSeenAt?: string | null
  blocked: boolean
}
