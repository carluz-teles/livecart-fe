export interface User {
  id: string
  storeId: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: string
  status: string
  storeName: string
  storeSlug: string
  createdAt: string
  updatedAt: string
}

export interface UserStore {
  id: string
  storeId: string
  role: string
  status: string
  storeName: string
  storeSlug: string
  createdAt: string
}

export interface SyncUserPayload {
  storeName: string
  storeSlug: string
}
