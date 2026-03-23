export interface User {
  id: string
  store_id: string
  email: string
  name: string | null
  avatar_url: string | null
  role: string
  store_name: string
  store_slug: string
  created_at: string
  updated_at: string
}

export interface SyncUserPayload {
  store_name: string
  store_slug: string
}
