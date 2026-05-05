export type CouponType = "percent" | "fixed" | "free_shipping"

export interface Coupon {
  id: string
  eventId: string
  code: string
  type: CouponType
  // Set when type === "fixed"; 0 otherwise.
  valueCents: number
  // Set when type === "percent"; basis points (1000 = 10%). 0 otherwise.
  percentBps: number
  // null when uses are unlimited.
  maxUses: number | null
  usedCount: number
  minPurchaseCents: number
  validFrom: string | null
  validUntil: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCouponPayload {
  code: string
  type: CouponType
  valueCents: number
  percentBps: number
  maxUses?: number | null
  minPurchaseCents: number
  validFrom?: string | null
  validUntil?: string | null
  active: boolean
}

// All fields optional — partial PATCH. Code is intentionally omitted; the
// backend forbids editing the code so existing redemptions stay valid.
export interface UpdateCouponPayload {
  type?: CouponType
  valueCents?: number
  percentBps?: number
  maxUses?: number | null
  minPurchaseCents?: number
  validFrom?: string | null
  validUntil?: string | null
  active?: boolean
}
