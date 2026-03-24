import { apiClient } from "./client"
import type { User, UserStore, SyncUserPayload } from "@/types"

export const userService = {
  getMe: (token?: string | null) => apiClient.get<User>("/users/me", token),

  getStores: (token?: string | null) =>
    apiClient.get<{ data: UserStore[] }>("/users/me/stores", token),

  sync: (payload: SyncUserPayload, token?: string | null) =>
    apiClient.post<User>("/users/sync", payload, token),
}
