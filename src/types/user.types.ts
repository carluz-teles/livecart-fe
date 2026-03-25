// Membership represents a user's membership to a store
export interface Membership {
  id: string
  storeId: string
  userId: string
  storeName: string
  storeSlug: string
  role: string
  status: string
  email: string
  name: string | null
  avatarUrl: string | null
  lastAccessedAt: string | null
  createdAt: string
}

// SyncUserResponse from POST /users/sync
export interface SyncUserResponse {
  userId: string
  clerkUserId: string
  email: string
  name: string | null
  avatarUrl: string | null
  memberships: Membership[]
  lastAccessedStoreId: string | null
  state: "no_store" | "ready"
}

// User represents the current user with their active store context
// This is derived from SyncUserResponse for convenience in the frontend
export interface User {
  clerkUserId: string
  // Current membership (last accessed or first)
  membership: Membership | null
  // All memberships
  memberships: Membership[]
  // State
  state: "no_store" | "ready"
}

// UserStore for listing stores (from GET /users/me/stores)
export interface UserStore {
  id: string
  storeId: string
  userId: string
  storeName: string
  storeSlug: string
  role: string
  status: string
  email: string
  name: string | null
  avatarUrl: string | null
  lastAccessedAt: string | null
  createdAt: string
}

// Legacy alias for backward compatibility
export type SyncUserPayload = Record<string, never>
