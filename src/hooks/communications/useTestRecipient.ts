"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"

import { notificationService } from "@/services/api/notification.service"
import { useStore } from "@/hooks/store/useStore"
import type {
  NotificationType,
  SendTestPayload,
  TestRecipient,
} from "@/types/notification.types"

import { communicationsKeys } from "./keys"

export function useTestRecipient(options: { pollWhileSetupActive?: boolean } = {}) {
  const { getToken } = useAuth()
  const storeQuery = useStore()
  const storeId = storeQuery.data?.id

  return useQuery<TestRecipient>({
    queryKey: [...communicationsKeys.testRecipient(), storeId ?? ""],
    queryFn: async () => {
      const token = await getToken()
      return notificationService.getTestRecipient(storeId!, token)
    },
    enabled: !!storeId,
    refetchInterval: (query) => {
      if (!options.pollWhileSetupActive) return false
      const data = query.state.data
      return data?.setup_code_active ? 3000 : false
    },
  })
}

export function useStartTestSetup() {
  const { getToken } = useAuth()
  const qc = useQueryClient()
  const storeQuery = useStore()
  const storeId = storeQuery.data?.id

  return useMutation({
    mutationFn: async () => {
      if (!storeId) throw new Error("Store não carregada")
      const token = await getToken()
      return notificationService.startTestSetup(storeId, token)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: communicationsKeys.testRecipient() })
    },
  })
}

export function useTestNotification() {
  const { getToken } = useAuth()
  const storeQuery = useStore()
  const storeId = storeQuery.data?.id

  return useMutation({
    mutationFn: async (vars: { type: NotificationType; template: string }) => {
      if (!storeId) throw new Error("Store não carregada")
      const token = await getToken()
      const payload: SendTestPayload = { type: vars.type, template: vars.template }
      return notificationService.sendTest(storeId, payload, token)
    },
    onSuccess: () => {
      toast.success("Notificação de teste enviada")
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message ?? "Erro ao enviar teste")
          : "Erro ao enviar teste"
      toast.error(msg)
    },
  })
}
