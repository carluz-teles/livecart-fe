"use client"

import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"

import { notificationService } from "@/services/api/notification.service"
import { storeService } from "@/services/api/store.service"
import { useStore } from "@/hooks/store/useStore"
import { storeKeys } from "@/hooks/store/useStore"
import { NOTIFICATION_META } from "@/lib/communications"
import type {
  AvailableVariablesResponse,
  CartNotificationType,
  NotificationSettings,
  NotificationType,
  TemplateSettings,
  TemplateVariable,
} from "@/types/notification.types"
import type { CartSettings, UpdateCartSettingsPayload } from "@/types/store.types"

import { communicationsKeys } from "./keys"

interface SavePayload {
  enabled: boolean
  template: string
  // Only relevant for checkout_reminder
  expirationReminderMinutes?: number
}

interface UseCommunicationResult {
  isLoading: boolean
  meta: typeof NOTIFICATION_META[NotificationType]
  template: TemplateSettings | null
  variables: TemplateVariable[]
  cartSettings?: CartSettings
  storeId?: string
  save: (payload: SavePayload) => Promise<void>
  isSaving: boolean
}

// useCommunication is the hook for the original Instagram-DM cart-flow
// notifications. Post-payment (email) types use useEmailCommunication
// because their shape (subject + body_html) is different.
export function useCommunication(type: CartNotificationType): UseCommunicationResult {
  const { getToken } = useAuth()
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
    queryKey: [...communicationsKeys.variables(type), storeId ?? ""],
    queryFn: async () => {
      const token = await getToken()
      return notificationService.getVariables(storeId!, token, type)
    },
    enabled: !!storeId,
    staleTime: 1000 * 60 * 30,
  })

  const template = useMemo<TemplateSettings | null>(() => {
    const s = settingsQuery.data
    if (!s) return null
    return s[type] ?? null
  }, [settingsQuery.data, type])

  const saveMutation = useMutation({
    mutationFn: async (payload: SavePayload) => {
      if (!storeId) throw new Error("Store não carregada")
      const token = await getToken()

      const current = settingsQuery.data
      const merged = {
        checkout_immediate: current?.checkout_immediate ?? null,
        item_added: current?.item_added ?? null,
        checkout_reminder: current?.checkout_reminder ?? null,
        payment_confirmed: current?.payment_confirmed ?? null,
        shipped: current?.shipped ?? null,
        delivered: current?.delivered ?? null,
      }
      merged[type] = { enabled: payload.enabled, template: payload.template }

      // Save the templates (preserves email-side fields untouched).
      await notificationService.updateSettings(
        storeId,
        {
          checkout_immediate: merged.checkout_immediate,
          item_added: merged.item_added,
          checkout_reminder: merged.checkout_reminder,
          payment_confirmed: merged.payment_confirmed,
          shipped: merged.shipped,
          delivered: merged.delivered,
        },
        token,
      )

      // For checkout_reminder, also update the trigger minutes on the store.
      // realTimeCart is now derived from per-card toggles for checkout_immediate
      // / item_added; sendExpirationReminder mirrors checkout_reminder.enabled.
      const cart = storeQuery.data?.cartSettings
      if (cart) {
        const cartPayload: UpdateCartSettingsPayload = {
          enabled: cart.enabled,
          expirationMinutes: cart.expirationMinutes,
          reserveStock: cart.reserveStock,
          allowStorePickup: cart.allowStorePickup ?? false,
          maxQuantityPerItem: cart.maxQuantityPerItem,
          allowEdit: cart.allowEdit,
          checkoutSendMethods: cart.checkoutSendMethods,
          realTimeCart:
            (merged.checkout_immediate?.enabled ?? false) ||
            (merged.item_added?.enabled ?? false),
          sendExpirationReminder: merged.checkout_reminder?.enabled ?? false,
          expirationReminderMinutes:
            type === "checkout_reminder" && payload.expirationReminderMinutes != null
              ? payload.expirationReminderMinutes
              : cart.expirationReminderMinutes,
        }
        await storeService.updateCartSettings(cartPayload, token, storeId)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: communicationsKeys.settings() })
      qc.invalidateQueries({ queryKey: storeKeys.current() })
      toast.success("Comunicação salva")
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message ?? "Erro ao salvar")
          : "Erro ao salvar"
      toast.error(msg)
    },
  })

  return {
    isLoading: storeQuery.isLoading || settingsQuery.isLoading || variablesQuery.isLoading,
    meta,
    template,
    variables: variablesQuery.data?.variables ?? [],
    cartSettings: storeQuery.data?.cartSettings,
    storeId,
    save: async (payload) => {
      await saveMutation.mutateAsync(payload)
    },
    isSaving: saveMutation.isPending,
  }
}
