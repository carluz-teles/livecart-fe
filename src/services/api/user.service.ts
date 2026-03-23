import { apiClient } from "./client"
import type { User, SyncUserPayload } from "@/types"

export const userService = {
  getMe: (token?: string | null) => apiClient.get<User>("/users/me", token),

  sync: (payload: SyncUserPayload, token?: string | null) =>
    apiClient.post<User>("/users/sync", payload, token),
}
