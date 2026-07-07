"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import { integrationKeys } from "./useIntegrations"
import type { ApiError, ConnectWhatsAppPayload, WhatsAppStatus } from "@/types"

export const whatsappKeys = {
  status: (storeId: string) => ["integrations", "whatsapp", "status", storeId] as const,
}

// Sender/template state for the connect wizard. 404 means "not connected yet"
// — surfaced as data=null instead of an error so the wizard can show step 1.
export function useWhatsAppStatus(options?: { enabled?: boolean; refetchInterval?: number }) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: whatsappKeys.status(storeId ?? ""),
    queryFn: async (): Promise<WhatsAppStatus | null> => {
      const token = await getToken()
      try {
        return await integrationService.getWhatsAppStatus(storeId!, token)
      } catch (err) {
        if ((err as ApiError)?.status === 404) return null
        throw err
      }
    },
    enabled:
      isLoaded && isSignedIn && !storeLoading && !!storeId && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
  })
}

export function useConnectWhatsApp() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ConnectWhatsAppPayload): Promise<WhatsAppStatus> => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return integrationService.connectWhatsApp(storeId, payload, token)
    },
    onSuccess: () => {
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: whatsappKeys.status(storeId) })
      }
      queryClient.invalidateQueries({ queryKey: integrationKeys.lists() })
    },
  })
}

export function useVerifyWhatsApp() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (code: string): Promise<WhatsAppStatus> => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return integrationService.verifyWhatsApp(storeId, code, token)
    },
    onSuccess: () => {
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: whatsappKeys.status(storeId) })
      }
      queryClient.invalidateQueries({ queryKey: integrationKeys.lists() })
    },
  })
}

export function useSendWhatsAppTest() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()

  return useMutation({
    mutationFn: async (to: string) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return integrationService.sendWhatsAppTest(storeId, to, token)
    },
  })
}
