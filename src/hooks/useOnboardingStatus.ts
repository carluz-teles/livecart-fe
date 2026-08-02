"use client"

import { useMemo } from "react"
import { useUser } from "@/hooks/useUser"
import { useIntegrations } from "@/hooks/integration/useIntegrations"
import { useEventStats } from "@/hooks/event/useEventStats"
import { useProductStats } from "@/hooks/product"

export interface OnboardingTask {
  id: string
  title: string
  description: string
  completed: boolean
  href?: string
}

export interface OnboardingStatus {
  tasks: OnboardingTask[]
  completedCount: number
  totalCount: number
  percentage: number
  isComplete: boolean
  isLoading: boolean
}

// FONTE ÚNICA da ativação pós-onboarding — consumida pelo checklist do
// Header e pelo card "Primeiros passos" do dashboard (mesmos passos, mesma
// copy, mesmo progresso). Os 5 passos são o caminho crítico até a primeira
// live que vende; opcionais (ERP) e coisas que já nascem prontas
// (notificações têm defaults habilitados) ficam de fora.
export function useOnboardingStatus(): OnboardingStatus {
  const { user, isLoading: userLoading } = useUser()

  const { data: integrations, isLoading: integrationsLoading } = useIntegrations()
  const { data: eventStats, isLoading: eventsLoading } = useEventStats()
  const { data: productStats, isLoading: productsLoading } = useProductStats()

  const tasks = useMemo<OnboardingTask[]>(() => {
    const active = (integrations?.data ?? []).filter((i) => i.status === "active")
    const storeCreated = user?.state === "ready"
    const hasInstagram = active.some((i) => i.provider === "instagram")
    const hasPayment = active.some((i) => i.type === "payment")
    const hasProduct = (productStats?.totalProducts ?? 0) > 0
    const hasEvents = (eventStats?.totalEvents ?? eventStats?.totalLives ?? 0) > 0

    return [
      {
        id: "store",
        title: "Criar sua loja",
        description: "Loja configurada e pronta",
        completed: storeCreated,
      },
      {
        id: "instagram",
        title: "Conectar o Instagram",
        description: "Pra detectar os pedidos nos comentários da live",
        completed: hasInstagram,
        href: "/settings/integrations",
      },
      {
        id: "payment",
        title: "Conectar um meio de pagamento",
        description: "PIX e cartão no checkout (Mercado Pago ou Pagar.me)",
        completed: hasPayment,
        href: "/settings/integrations",
      },
      {
        id: "product",
        title: "Cadastrar o primeiro produto",
        description: "Com a palavra-chave que o público comenta na live",
        completed: hasProduct,
        href: "/products",
      },
      {
        id: "event",
        title: "Criar a primeira live",
        description: "Agende o evento da sua primeira transmissão",
        completed: hasEvents,
        href: "/events",
      },
    ]
  }, [user, integrations, eventStats, productStats])

  const completedCount = tasks.filter((t) => t.completed).length
  const totalCount = tasks.length
  const percentage = Math.round((completedCount / totalCount) * 100)

  return {
    tasks,
    completedCount,
    totalCount,
    percentage,
    isComplete: completedCount === totalCount,
    isLoading: userLoading || integrationsLoading || eventsLoading || productsLoading,
  }
}
