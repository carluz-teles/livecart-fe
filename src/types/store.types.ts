// Checkout send method options
export type CheckoutSendMethod = 'public_link' | 'manual' | 'whatsapp' | 'instagram_dm'

// Cart settings configuration
export interface CartSettings {
  enabled: boolean
  expirationMinutes: number
  reserveStock: boolean
  maxItems: number
  maxQuantityPerItem: number
  notifyBeforeExpiration: boolean
  allowEdit: boolean
  // Checkout settings
  autoSendCheckoutLinks: boolean
  checkoutLinkExpiryHours: number
  checkoutSendMethods: CheckoutSendMethod[]
  // Automatic message settings
  sendOnFirstItem: boolean
  sendOnNewItems: boolean
  messageCooldownSeconds: number
  sendExpirationReminder: boolean
  expirationReminderMinutes: number
}

// Default cart settings for new stores
export const DEFAULT_CART_SETTINGS: CartSettings = {
  enabled: true,
  expirationMinutes: 30,
  reserveStock: true,
  maxItems: 0,
  maxQuantityPerItem: 5,
  notifyBeforeExpiration: true,
  allowEdit: true,
  autoSendCheckoutLinks: false,
  checkoutLinkExpiryHours: 48,
  checkoutSendMethods: ['public_link', 'manual'],
  // Automatic message settings
  sendOnFirstItem: true,
  sendOnNewItems: true,
  messageCooldownSeconds: 30,
  sendExpirationReminder: true,
  expirationReminderMinutes: 15,
}

// Address structure
export interface StoreAddress {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

export interface Store {
  id: string
  name: string
  slug: string
  active: boolean
  whatsappNumber: string | null
  emailAddress: string | null
  smsNumber: string | null
  description: string | null
  website: string | null
  logoUrl: string | null
  address: StoreAddress | null
  cartSettings: CartSettings
  createdAt: string
}

export interface UpdateStorePayload {
  name: string
  whatsappNumber?: string
  emailAddress?: string
  smsNumber?: string
  description?: string
  website?: string
  logoUrl?: string
  address?: StoreAddress
}

export interface UpdateCartSettingsPayload {
  enabled: boolean
  expirationMinutes: number
  reserveStock: boolean
  maxItems: number
  maxQuantityPerItem: number
  notifyBeforeExpiration: boolean
  allowEdit: boolean
  autoSendCheckoutLinks: boolean
  checkoutLinkExpiryHours: number
  checkoutSendMethods: CheckoutSendMethod[]
  // Automatic message settings
  sendOnFirstItem: boolean
  sendOnNewItems: boolean
  messageCooldownSeconds: number
  sendExpirationReminder: boolean
  expirationReminderMinutes: number
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
  createdAt: string
}
