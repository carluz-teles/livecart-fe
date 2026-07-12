// Checkout send method options
export type CheckoutSendMethod = 'public_link' | 'manual' | 'whatsapp' | 'instagram_dm'

// Cart settings configuration
export interface CartSettings {
  enabled: boolean
  expirationMinutes: number
  reserveStock: boolean
  allowStorePickup: boolean
  maxQuantityPerItem: number
  allowEdit: boolean
  checkoutSendMethods: CheckoutSendMethod[]
  // Automatic message settings
  realTimeCart: boolean
  sendExpirationReminder: boolean
  expirationReminderMinutes: number
}

// Default cart settings for new stores
export const DEFAULT_CART_SETTINGS: CartSettings = {
  enabled: true,
  expirationMinutes: 30,
  reserveStock: true,
  allowStorePickup: false,
  maxQuantityPerItem: 5,
  allowEdit: true,
  checkoutSendMethods: ['public_link', 'manual'],
  // Automatic message settings
  realTimeCart: true,
  sendExpirationReminder: true,
  expirationReminderMinutes: 15,
}

// Address structure
export interface StoreAddress {
  street: string
  number: string
  complement: string
  district: string
  city: string
  state: string
  zip: string
  country: string
  stateRegister: string
}

// Default package used to consolidate items on shipping quotes
import type { PackageFormat } from "./product.types"

export interface ShippingDefaults {
  packageWeightGrams: number
  packageFormat: PackageFormat
  // Default package dimensions used as a fallback when ERP imports come in
  // with weight only (common for clothing stores). All three are persisted
  // together — backend treats partial input as "fallback off" and stores
  // null for all of them.
  heightCm: number | null
  widthCm: number | null
  lengthCm: number | null
}

export const DEFAULT_SHIPPING_DEFAULTS: ShippingDefaults = {
  packageWeightGrams: 0,
  packageFormat: "box",
  heightCm: null,
  widthCm: null,
  lengthCm: null,
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
  cnpj: string | null
  cartSettings: CartSettings
  shippingDefaults: ShippingDefaults
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
  cnpj?: string
}

export interface UpdateCartSettingsPayload {
  enabled: boolean
  expirationMinutes: number
  reserveStock: boolean
  allowStorePickup: boolean
  maxQuantityPerItem: number
  allowEdit: boolean
  checkoutSendMethods: CheckoutSendMethod[]
  // Automatic message settings
  realTimeCart: boolean
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
