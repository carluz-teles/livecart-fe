import { apiClient } from "./client"
import type { PeriodUsage, StatementEntry, SubscriptionState } from "@/types"

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

  // Financeiro: resumo do ciclo (GMV, taxa de sucesso, créditos)
  getUsage: (storeId: string, token?: string | null) =>
    apiClient.get<PeriodUsage>(`/stores/${storeId}/billing/usage`, token),

  // Financeiro: extrato append-only (vendas, estornos, ajustes)
  getStatement: (storeId: string, page = 1, limit = 30, token?: string | null) =>
    apiClient.get<StatementEntry[]>(
      `/stores/${storeId}/billing/statement?page=${page}&limit=${limit}`,
      token
    ),
}
