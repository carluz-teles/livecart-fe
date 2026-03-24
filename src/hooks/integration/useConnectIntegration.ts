"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import { integrationKeys } from "./useIntegrations"
import type { IntegrationProvider, CreateIntegrationPayload } from "@/types/integration"

// Hook for OAuth-based connections (Mercado Pago)
export function useConnectOAuth() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()

  return useMutation({
    mutationFn: async (provider: IntegrationProvider) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      const response = await integrationService.getOAuthURL(storeId, provider, token)
      return response
    },
    onSuccess: (data) => {
      // Redirect to OAuth provider
      window.location.href = data.authUrl
    },
  })
}

// Hook for API key-based connections (Tiny)
export function useConnectApiKey() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateIntegrationPayload) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return integrationService.create(storeId, payload, token)
    },
    onSuccess: () => {
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: integrationKeys.list(storeId) })
      }
    },
  })
}
