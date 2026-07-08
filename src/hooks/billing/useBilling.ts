"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { billingService } from "@/services/api/billing.service"
import { useStoreId } from "@/hooks/useUser"

export const billingKeys = {
  subscription: (storeId: string) => ["billing", "subscription", storeId] as const,
}

export function useSubscription() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: billingKeys.subscription(storeId ?? ""),
    queryFn: async () => {
      const token = await getToken()
      return billingService.getSubscription(storeId!, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}

// Cria a sessão de Checkout e redireciona pra página hospedada da Stripe.
export function useStartCheckout() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()

  return useMutation({
    mutationFn: async (plan: "start" | "grow" | "scale") => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return billingService.createCheckout(storeId, plan, token)
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

// Upgrade imediato (com proração) ou downgrade agendado pro próximo ciclo.
export function useChangePlan() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (plan: "start" | "grow" | "scale") => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return billingService.changePlan(storeId, plan, token)
    },
    onSuccess: () => {
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: billingKeys.subscription(storeId) })
      }
    },
  })
}
