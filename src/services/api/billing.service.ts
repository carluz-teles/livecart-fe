import { apiClient } from "./client"
import type { SubscriptionState } from "@/types"

export const billingService = {
  // Snapshot do paywall/assinatura (PRD 007)
  getSubscription: (storeId: string, token?: string | null) =>
    apiClient.get<SubscriptionState>(`/stores/${storeId}/billing/subscription`, token),

  // Abre o Stripe Checkout (setup) para contratar o plano; retorna a URL hospedada
  createCheckout: (storeId: string, plan: "start" | "grow" | "scale", token?: string | null) =>
    apiClient.post<{ url: string }>(`/stores/${storeId}/billing/checkout`, { plan }, token),
}
