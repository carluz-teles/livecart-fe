export interface User {
  id: string
  storeId: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: string
  storeName: string
  storeSlug: string
  createdAt: string
  updatedAt: string
}

export interface SyncUserPayload {
  storeName: string
  storeSlug: string
}
