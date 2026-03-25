import { apiClient } from "./client"
import type { SyncUserResponse, UserStore, User } from "@/types"

// Helper to convert SyncUserResponse to User
function toUser(response: SyncUserResponse): User {
  const membership =
    response.memberships.find((m) => m.storeId === response.lastAccessedStoreId) ||
    response.memberships[0] ||
    null

  return {
    clerkUserId: response.clerkUserId,
    membership,
    memberships: response.memberships,
    state: response.state,
  }
}

export const userService = {
  // Sync user - returns all memberships and state
  // This is the main endpoint to get user data
  sync: async (token?: string | null): Promise<User> => {
    const response = await apiClient.post<SyncUserResponse>("/users/sync", {}, token)
    return toUser(response)
  },

  // Get all stores for the user
  getStores: (token?: string | null) =>
    apiClient.get<{ stores: UserStore[] }>("/users/me/stores", token),

  // Select active store
  selectStore: (storeId: string, token?: string | null) =>
    apiClient.post<void>("/users/me/select-store", { storeId }, token),
}
