"use client"

import { useIntegrations } from "@/hooks/integration"
import { useProductStats } from "@/hooks/product"

export type GettingStartedItemID = "store" | "instagram" | "payment" | "product"

export interface GettingStartedItem {
  id: GettingStartedItemID
  done: boolean
  href: string
}

// Checklist de ativação pós-onboarding: deriva o progresso do que já existe
// (integrações ativas + contagem de produtos) — nenhum estado novo no BE.
// Some quando completo.
export function useGettingStarted() {
  const { data: integrations, isLoading: integrationsLoading } = useIntegrations()
  const { data: productStats, isLoading: productsLoading } = useProductStats()

  const isLoading = integrationsLoading || productsLoading

  const active = (integrations?.data ?? []).filter((i) => i.status === "active")
  const hasInstagram = active.some((i) => i.provider === "instagram")
  const hasPayment = active.some((i) => i.type === "payment")
  const hasProduct = (productStats?.totalProducts ?? 0) > 0

  const items: GettingStartedItem[] = [
    { id: "store", done: true, href: "/settings/organization" },
    { id: "instagram", done: hasInstagram, href: "/settings/integrations" },
    { id: "payment", done: hasPayment, href: "/settings/integrations" },
    { id: "product", done: hasProduct, href: "/products" },
  ]

  const doneCount = items.filter((i) => i.done).length

  return {
    items,
    doneCount,
    total: items.length,
    isComplete: doneCount === items.length,
    isLoading,
  }
}
