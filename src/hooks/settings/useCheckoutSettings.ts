"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import { useForm, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import {
  checkoutSettingsSchema,
  defaultTemplates,
  type CheckoutSettingsFormData,
} from "@/schemas/checkout-settings.schema"
import { storeService } from "@/services/api/store.service"
import { notificationService } from "@/services/api/notification.service"
import type { UpdateCartSettingsPayload } from "@/types/store.types"
import type { TemplateVariable, TemplateSettings } from "@/types/notification.types"

interface PreviewResult {
  preview: string
  charCount: number
  isValid: boolean
  error?: string
}

interface UseCheckoutSettingsReturn {
  // Loading states
  isLoading: boolean
  isSaving: boolean

  // Form
  form: UseFormReturn<CheckoutSettingsFormData>

  // Data
  storeId: string | null
  variables: TemplateVariable[]

  // Actions
  onSubmit: (data: CheckoutSettingsFormData) => Promise<void>
  handlePreview: (template: string) => Promise<PreviewResult>
}

export function useCheckoutSettings(): UseCheckoutSettingsReturn {
  const { getToken } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [variables, setVariables] = useState<TemplateVariable[]>([])

  const form = useForm<CheckoutSettingsFormData>({
    resolver: zodResolver(checkoutSettingsSchema),
    defaultValues: {
      // General
      enabled: true,
      allowEdit: true,

      // Expiration
      expirationMinutes: 30,

      // Limits
      reserveStock: true,
      maxQuantityPerItem: 5,

      // Real-time cart mode
      realTimeCart: true,

      // Expiration reminder
      sendExpirationReminder: true,
      expirationReminderMinutes: 15,

      // Templates
      templates: {
        checkout_immediate: {
          enabled: true,
          template: defaultTemplates.checkout_immediate,
        },
        item_added: {
          enabled: true,
          template: defaultTemplates.item_added,
        },
        checkout_reminder: {
          enabled: true,
          template: defaultTemplates.checkout_reminder,
        },
      },
    },
  })

  const { setValue } = form

  // Load settings from both APIs
  useEffect(() => {
    async function loadSettings() {
      try {
        const token = await getToken()
        const store = await storeService.getCurrent(token)
        setStoreId(store.id)

        // Load cart settings
        if (store.cartSettings) {
          const cs = store.cartSettings
          setValue("enabled", cs.enabled)
          setValue("allowEdit", cs.allowEdit ?? true)
          setValue("expirationMinutes", cs.expirationMinutes)
          setValue("reserveStock", cs.reserveStock)
          setValue("maxQuantityPerItem", cs.maxQuantityPerItem)

          // Real-time cart (new unified field)
          setValue("realTimeCart", cs.realTimeCart ?? true)

          // Expiration reminder
          setValue("sendExpirationReminder", cs.sendExpirationReminder ?? true)
          setValue("expirationReminderMinutes", cs.expirationReminderMinutes ?? 15)
        }

        // Load notification settings
        const notifSettings = await notificationService.getSettings(store.id, token)
        if (notifSettings) {
          if (notifSettings.checkout_immediate) {
            setValue("templates.checkout_immediate", {
              enabled: notifSettings.checkout_immediate.enabled,
              template: notifSettings.checkout_immediate.template,
            })
          }
          if (notifSettings.item_added) {
            setValue("templates.item_added", {
              enabled: notifSettings.item_added.enabled,
              template: notifSettings.item_added.template,
            })
          }
          if (notifSettings.checkout_reminder) {
            setValue("templates.checkout_reminder", {
              enabled: notifSettings.checkout_reminder.enabled,
              template: notifSettings.checkout_reminder.template,
            })
          }
        }

        // Load available variables
        const varsResponse = await notificationService.getVariables(store.id, token)
        setVariables(varsResponse.variables)
      } catch (error) {
        console.error("Failed to load checkout settings:", error)
        toast.error("Erro ao carregar configurações", {
          description: "Não foi possível carregar as configurações de checkout.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [getToken, setValue])

  // Preview handler
  const handlePreview = useCallback(
    async (template: string): Promise<PreviewResult> => {
      if (!storeId) {
        return {
          preview: template,
          charCount: template.length,
          isValid: false,
          error: "Store não carregada",
        }
      }

      try {
        const token = await getToken()
        const result = await notificationService.previewTemplate(
          storeId,
          template,
          token
        )
        return {
          preview: result.preview,
          charCount: result.preview.length,
          isValid: result.is_valid,
          error: result.error,
        }
      } catch (error) {
        console.error("Preview error:", error)
        return {
          preview: template,
          charCount: template.length,
          isValid: false,
          error: "Erro ao gerar prévia",
        }
      }
    },
    [getToken, storeId]
  )

  // Submit handler - saves to both APIs
  const onSubmit = async (data: CheckoutSettingsFormData) => {
    if (!storeId) return

    setIsSaving(true)
    try {
      const token = await getToken()

      // Extract cart settings payload (using new unified field names)
      const cartPayload: UpdateCartSettingsPayload = {
        enabled: data.enabled,
        expirationMinutes: data.expirationMinutes,
        reserveStock: data.reserveStock,
        maxQuantityPerItem: data.maxQuantityPerItem,
        allowEdit: data.allowEdit,
        checkoutSendMethods: ["public_link", "manual"],
        realTimeCart: data.realTimeCart,
        sendExpirationReminder: data.sendExpirationReminder,
        expirationReminderMinutes: data.expirationReminderMinutes,
      }

      // Extract notification settings payload
      const notificationPayload: {
        checkout_immediate?: TemplateSettings | null
        item_added?: TemplateSettings | null
        checkout_reminder?: TemplateSettings | null
      } = {
        checkout_immediate: data.templates.checkout_immediate,
        item_added: data.templates.item_added,
        checkout_reminder: data.templates.checkout_reminder,
      }

      // Save both in parallel
      await Promise.all([
        storeService.updateCartSettings(cartPayload, token, storeId),
        notificationService.updateSettings(storeId, notificationPayload, token),
      ])

      toast.success("Configurações salvas", {
        description: "Todas as configurações de checkout foram atualizadas.",
      })

      // Reset form state to mark as not dirty
      form.reset(data)
    } catch (error) {
      console.error("Failed to save checkout settings:", error)
      toast.error("Erro ao salvar", {
        description: "Não foi possível salvar as configurações.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return {
    isLoading,
    isSaving,
    form,
    storeId,
    variables,
    onSubmit,
    handlePreview,
  }
}
