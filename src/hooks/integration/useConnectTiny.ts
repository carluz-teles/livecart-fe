"use client"

import { useMutation } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"

interface TinyCredentials {
  clientId: string
  clientSecret: string
}

/**
 * Hook for connecting Tiny ERP integration.
 * Handles the two-step process: save credentials, then start OAuth flow.
 */
export function useConnectTiny() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()

  return useMutation({
    mutationFn: async (credentials: TinyCredentials) => {
      if (!storeId) throw new Error("Store ID not found")
      if (!credentials.clientId.trim() || !credentials.clientSecret.trim()) {
        throw new Error("Client ID and Client Secret are required")
      }

      const token = await getToken()

      // Step 1: Create integration with credentials
      await integrationService.create(
        storeId,
        {
          type: "erp",
          provider: "tiny",
          credentials: {
            client_id: credentials.clientId,
            client_secret: credentials.clientSecret,
          },
        },
        token
      )

      // Step 2: Get OAuth URL and return it
      const oauthResponse = await integrationService.getOAuthURL(storeId, "tiny", token)
      return oauthResponse
    },
    onSuccess: (data) => {
      // Redirect to OAuth provider
      window.location.href = data.authUrl
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Falha ao conectar Tiny"
      toast.error(message)
    },
  })
}
