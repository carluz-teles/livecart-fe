"use client"

import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth, useUser } from "@clerk/nextjs"
import { toast } from "sonner"

import { notificationService } from "@/services/api/notification.service"
import { useStore } from "@/hooks/store/useStore"
import { NOTIFICATION_META } from "@/lib/communications"
import type {
  AvailableVariablesResponse,
  EmailTemplateSettings,
  NotificationSettings,
  PostPaymentNotificationType,
  TemplateVariable,
} from "@/types/notification.types"

import { communicationsKeys } from "./keys"

interface SaveEmailPayload {
  enabled: boolean
  subject: string
  bodyHTML: string
}

interface UseEmailCommunicationResult {
  isLoading: boolean
  meta: typeof NOTIFICATION_META[PostPaymentNotificationType]
  template: EmailTemplateSettings | null
  variables: TemplateVariable[]
  storeId?: string
  // Auto-fill recipient for the test send dialog. Pulled from Clerk's
  // primary email so the lojista doesn't have to type it.
  ownerEmail?: string
  save: (payload: SaveEmailPayload) => Promise<void>
  isSaving: boolean
  sendTest: (recipientEmail: string, draft: SaveEmailPayload) => Promise<void>
  isSendingTest: boolean
}

// Hook for the post-payment email notification editor (payment_confirmed,
// shipped, delivered). Mirrors useCommunication but the wire shape is
// EmailTemplateSettings instead of TemplateSettings.
export function useEmailCommunication(
  type: PostPaymentNotificationType,
): UseEmailCommunicationResult {
  const { getToken } = useAuth()
  const { user } = useUser()
  const qc = useQueryClient()
  const storeQuery = useStore()
  const storeId = storeQuery.data?.id
  const meta = NOTIFICATION_META[type]

  const settingsQuery = useQuery<NotificationSettings>({
    queryKey: [...communicationsKeys.settings(), storeId ?? ""],
    queryFn: async () => {
      const token = await getToken()
      return notificationService.getSettings(storeId!, token)
    },
    enabled: !!storeId,
  })

  const variablesQuery = useQuery<AvailableVariablesResponse>({
    queryKey: [...communicationsKeys.variables(), storeId ?? ""],
    queryFn: async () => {
      const token = await getToken()
      return notificationService.getVariables(storeId!, token)
    },
    enabled: !!storeId,
    staleTime: 1000 * 60 * 30,
  })

  const template = useMemo<EmailTemplateSettings | null>(() => {
    const s = settingsQuery.data
    if (!s) return null
    return s[type] ?? null
  }, [settingsQuery.data, type])

  const saveMutation = useMutation({
    mutationFn: async (payload: SaveEmailPayload) => {
      if (!storeId) throw new Error("Store não carregada")
      const token = await getToken()

      const current = settingsQuery.data
      const updated: EmailTemplateSettings = {
        enabled: payload.enabled,
        subject: payload.subject,
        body_html: payload.bodyHTML,
      }

      await notificationService.updateSettings(
        storeId,
        {
          checkout_immediate: current?.checkout_immediate ?? null,
          item_added: current?.item_added ?? null,
          checkout_reminder: current?.checkout_reminder ?? null,
          payment_confirmed:
            type === "payment_confirmed"
              ? updated
              : current?.payment_confirmed ?? null,
          shipped: type === "shipped" ? updated : current?.shipped ?? null,
          delivered: type === "delivered" ? updated : current?.delivered ?? null,
        },
        token,
      )
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: communicationsKeys.settings() })
      toast.success("Email salvo")
    },
    onError: () => toast.error("Erro ao salvar"),
  })

  const sendTestMutation = useMutation({
    mutationFn: async ({
      recipientEmail,
      draft,
    }: {
      recipientEmail: string
      draft: SaveEmailPayload
    }) => {
      if (!storeId) throw new Error("Store não carregada")
      const token = await getToken()
      await notificationService.sendTestEmail(
        storeId,
        {
          type,
          subject: draft.subject,
          body_html: draft.bodyHTML,
          recipient_email: recipientEmail,
        },
        token,
      )
    },
    onSuccess: () => toast.success("Email de teste enviado"),
    onError: () => toast.error("Falha ao enviar email de teste"),
  })

  return {
    isLoading: storeQuery.isLoading || settingsQuery.isLoading || variablesQuery.isLoading,
    meta,
    template,
    variables: variablesQuery.data?.variables ?? [],
    storeId,
    ownerEmail: user?.primaryEmailAddress?.emailAddress,
    save: async (payload) => {
      await saveMutation.mutateAsync(payload)
    },
    isSaving: saveMutation.isPending,
    sendTest: async (recipientEmail, draft) => {
      await sendTestMutation.mutateAsync({ recipientEmail, draft })
    },
    isSendingTest: sendTestMutation.isPending,
  }
}
