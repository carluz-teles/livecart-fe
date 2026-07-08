// Membership represents a user's single membership to a store (1 user = 1 store)
export interface Membership {
  id: string
  storeId: string
  storeName: string
  storeSlug: string
  storeLogoUrl: string | null
  role: string
  status: string
  email: string
  name: string | null
  avatarUrl: string | null
  createdAt: string
}

// SyncUserResponse from POST /users/sync
// Single store model: returns one membership (or null)
export interface SyncUserResponse {
  userId: string
  clerkUserId: string
  email: string
  name: string | null
  avatarUrl: string | null
  membership: Membership | null // Single membership (1 user = 1 store)
  state: "no_store" | "ready"
  subscription?: SubscriptionState | null // paywall (PRD 007)
}

// SubscriptionState — snapshot do paywall/assinatura (PRD 007)
export interface SubscriptionState {
  status: "trialing" | "active" | "past_due" | "paused" | "unpaid" | "canceled" | string
  plan: "start" | "grow" | "scale" | "enterprise" | string
  trialEndsAt?: string
  trialDaysLeft: number
  currentPeriodEnd?: string
  cancelAtPeriodEnd: boolean
  graceUntil?: string
  hasPaymentMethod: boolean
  blocked: boolean
}

// User represents the current user with their store context
// Simplified for single-store model
export interface User {
  clerkUserId: string
  // Current membership (or null if no store)
  membership: Membership | null
  // State
  state: "no_store" | "ready"
  subscription?: SubscriptionState | null // paywall (PRD 007)
}

// Legacy alias for backward compatibility
export type SyncUserPayload = Record<string, never>
