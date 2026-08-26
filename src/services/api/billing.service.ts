import { apiClient } from "./client"
import type { BillingInterval, PeriodUsage, StatementEntry, SubscriptionState } from "@/types"

export const billingService = {
  // Snapshot do paywall/assinatura (PRD 007)
  getSubscription: (storeId: string, token?: string | null) =>
    apiClient.get<SubscriptionState>(`/stores/${storeId}/billing/subscription`, token),

  // Abre o Stripe Checkout (setup) para contratar o plano Pro no intervalo escolhido; retorna a URL hospedada
  createCheckout: (storeId: string, interval: BillingInterval, token?: string | null) =>
    apiClient.post<{ url: string }>(`/stores/${storeId}/billing/checkout`, { interval }, token),

  // Stripe Customer Portal (cartão, faturas, cancelamento, troca de intervalo)
  createPortal: (storeId: string, token?: string | null) =>
    apiClient.post<{ url: string }>(`/stores/${storeId}/billing/portal`, {}, token),

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
