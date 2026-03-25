import { apiClient } from "./client"
import type { Store, UpdateStorePayload, UpdateCartSettingsPayload } from "@/types/store.types"

export const storeService = {
  getCurrent: (token?: string | null) => apiClient.get<Store>("/stores/me", token),

  update: (payload: UpdateStorePayload, token?: string | null) =>
    apiClient.put<Store>("/stores/me", payload, token),

  updateCartSettings: (payload: UpdateCartSettingsPayload, token?: string | null) =>
    apiClient.put<Store>("/stores/me/cart-settings", payload, token),
}
