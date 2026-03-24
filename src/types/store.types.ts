export interface Store {
  id: string
  name: string
  slug: string
  active: boolean
  whatsappNumber: string | null
  emailAddress: string | null
  smsNumber: string | null
  createdAt: string
}

export interface UpdateStorePayload {
  name: string
  whatsappNumber?: string
  emailAddress?: string
  smsNumber?: string
}
