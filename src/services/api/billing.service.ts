import { apiClient } from "./client"
import type { SubscriptionState } from "@/types"

export const billingService = {
  // Snapshot do paywall/assinatura (PRD 007)
  getSubscription: (storeId: string, token?: string | null) =>
    apiClient.get<SubscriptionState>(`/stores/${storeId}/billing/subscription`, token),

  // Abre o Stripe Checkout (setup) para contratar o plano; retorna a URL hospedada
  createCheckout: (storeId: string, plan: "start" | "grow" | "scale", token?: string | null) =>
    apiClient.post<{ url: string }>(`/stores/${storeId}/billing/checkout`, { plan }, token),

  // Stripe Customer Portal (cartão, faturas, cancelamento)
  createPortal: (storeId: string, token?: string | null) =>
    apiClient.post<{ url: string }>(`/stores/${storeId}/billing/portal`, {}, token),

  // Upgrade imediato (proração) / downgrade agendado pro fim do ciclo
  changePlan: (storeId: string, plan: "start" | "grow" | "scale", token?: string | null) =>
    apiClient.post<SubscriptionState>(`/stores/${storeId}/billing/change-plan`, { plan }, token),
}
