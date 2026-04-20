"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { useUser, useStoreId } from "@/hooks/useUser"
import { useIntegrations } from "@/hooks/integration/useIntegrations"
import { useEventStats } from "@/hooks/event/useEventStats"
import { notificationService } from "@/services/api/notification.service"

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

export function useOnboardingStatus(): OnboardingStatus {
  const { user, isLoading: userLoading } = useUser()
  const { storeId } = useStoreId()
  const { getToken, isLoaded: authLoaded, isSignedIn } = useAuth()

  // Fetch all required data
  const { data: integrations, isLoading: integrationsLoading } = useIntegrations()
  const { data: eventStats, isLoading: eventsLoading } = useEventStats()

  // Fetch notification settings
  const { data: notificationSettings, isLoading: notificationsLoading } = useQuery({
    queryKey: ["onboarding", "notifications", storeId],
    queryFn: async () => {
      const token = await getToken()
      return notificationService.getSettings(storeId!, token)
    },
    enabled: authLoaded && isSignedIn && !!storeId,
  })

  // Derive task completion status
  const tasks = useMemo<OnboardingTask[]>(() => {
    // Task 1: Create store
    const storeCreated = user?.state === "ready"

    // Task 2: Connect payment
    const hasPayment = integrations?.data?.some(
      (i) => i.type === "payment" && i.status === "active"
    ) ?? false

    // Task 3: Connect ERP
    const hasERP = integrations?.data?.some(
      (i) => i.type === "erp" && i.status === "active"
    ) ?? false

    // Task 4: Connect Instagram
    const hasInstagram = integrations?.data?.some(
      (i) => i.provider === "instagram" && i.status === "active"
    ) ?? false

    // Task 5: Create first event
    const hasEvents = (eventStats?.totalLives ?? 0) > 0

    // Task 6: Configure notifications
    const hasNotifications =
      notificationSettings?.checkout_immediate?.enabled ||
      notificationSettings?.item_added?.enabled ||
      notificationSettings?.checkout_reminder?.enabled ||
      false

    return [
      {
        id: "store",
        title: "Criar loja",
        description: "Configure os dados básicos da sua loja",
        completed: storeCreated,
        // No href - this is done in onboarding wizard
      },
      {
        id: "payment",
        title: "Conectar pagamento",
        description: "Configure o Mercado Pago ou Pagar.me",
        completed: hasPayment,
        href: "/settings/integrations",
      },
      {
        id: "erp",
        title: "Integrar ERP",
        description: "Conecte o Bling ou Tiny para importar produtos",
        completed: hasERP,
        href: "/settings/integrations",
      },
      {
        id: "instagram",
        title: "Conectar Instagram",
        description: "Vincule sua conta do Instagram",
        completed: hasInstagram,
        href: "/settings/integrations",
      },
      {
        id: "event",
        title: "Criar primeiro evento",
        description: "Crie um evento para sua primeira live",
        completed: hasEvents,
        href: "/events",
      },
      {
        id: "notifications",
        title: "Configurar notificações",
        description: "Personalize as mensagens enviadas aos clientes",
        completed: hasNotifications,
        href: "/settings/checkout",
      },
    ]
  }, [user, integrations, eventStats, notificationSettings])

  // Calculate completion stats
  const completedCount = tasks.filter((t) => t.completed).length
  const totalCount = tasks.length
  const percentage = Math.round((completedCount / totalCount) * 100)
  const isComplete = completedCount === totalCount

  // Combined loading state
  const isLoading =
    userLoading ||
    integrationsLoading ||
    eventsLoading ||
    notificationsLoading

  return {
    tasks,
    completedCount,
    totalCount,
    percentage,
    isComplete,
    isLoading,
  }
}
