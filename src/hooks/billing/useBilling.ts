"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { billingService } from "@/services/api/billing.service"
import { useStoreId } from "@/hooks/useUser"
import type { BillingInterval } from "@/types"

export const billingKeys = {
  subscription: (storeId: string) => ["billing", "subscription", storeId] as const,
}

interface UseSubscriptionOptions {
  // Polling (ex.: aguardando o webhook da Stripe ativar a assinatura)
  refetchInterval?: number | false
}

export function useSubscription(options?: UseSubscriptionOptions) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: billingKeys.subscription(storeId ?? ""),
    queryFn: async () => {
      const token = await getToken()
      return billingService.getSubscription(storeId!, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
    refetchInterval: options?.refetchInterval ?? false,
  })
}

// Cria a sessão de Checkout e redireciona pra página hospedada da Stripe.
export function useStartCheckout() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()

  return useMutation({
    mutationFn: async (interval: BillingInterval) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return billingService.createCheckout(storeId, interval, token)
    },
    onSuccess: ({ url }) => {
      if (url) window.location.href = url
    },
  })
}


// Abre o Customer Portal da Stripe (cartão, faturas, cancelamento).
export function useOpenPortal() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()

  return useMutation({
    mutationFn: async () => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return billingService.createPortal(storeId, token)
    },
    onSuccess: ({ url }) => {
      if (url) window.location.href = url
    },
  })
}

export function usePeriodUsage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: ["billing", "usage", storeId ?? ""],
    queryFn: async () => {
      const token = await getToken()
      return billingService.getUsage(storeId!, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}

export function useStatement(page = 1) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: ["billing", "statement", storeId ?? "", page],
    queryFn: async () => {
      const token = await getToken()
      return billingService.getStatement(storeId!, page, 30, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
