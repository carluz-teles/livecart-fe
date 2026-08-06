import { apiClient } from "./client"
import type { SyncUserResponse, User } from "@/types"

// Helper to convert SyncUserResponse to User
function toUser(response: SyncUserResponse): User {
  return {
    clerkUserId: response.clerkUserId,
    membership: response.membership,
    state: response.state,
    // Paywall (PRD 007): sem isto o TrialBanner nunca vê a assinatura
    subscription: response.subscription ?? null,
    pendingInvitations: response.pendingInvitations ?? [],
  }
}

export const userService = {
  // Sync user - returns single membership and state (1 user = 1 store)
  // This is the main endpoint to get user data
  sync: async (token?: string | null): Promise<User> => {
    const response = await apiClient.post<SyncUserResponse>("/users/sync", {}, token)
    return toUser(response)
  },
}
