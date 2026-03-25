// Cart settings configuration
export interface CartSettings {
  enabled: boolean
  expirationMinutes: number
  reserveStock: boolean
  maxItems: number
  maxQuantityPerItem: number
  notifyBeforeExpiration: boolean
}

// Default cart settings for new stores
export const DEFAULT_CART_SETTINGS: CartSettings = {
  enabled: true,
  expirationMinutes: 30,
  reserveStock: true,
  maxItems: 0,
  maxQuantityPerItem: 5,
  notifyBeforeExpiration: true,
}

export interface Store {
  id: string
  name: string
  slug: string
  active: boolean
  whatsappNumber: string | null
  emailAddress: string | null
  smsNumber: string | null
  cartSettings: CartSettings
  createdAt: string
}

export interface UpdateStorePayload {
  name: string
  whatsappNumber?: string
  emailAddress?: string
  smsNumber?: string
}

export interface UpdateCartSettingsPayload {
  enabled: boolean
  expirationMinutes: number
  reserveStock: boolean
  maxItems: number
  maxQuantityPerItem: number
  notifyBeforeExpiration: boolean
}

// Create store types
export interface CreateStorePayload {
  name: string
  slug: string
}

export interface CreateStoreResponse {
  id: string
  name: string
  slug: string
  clerkOrgId: string
  createdAt: string
}
