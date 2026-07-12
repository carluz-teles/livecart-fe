"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useForm, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import {
  checkoutSettingsSchema,
  type CheckoutSettingsFormData,
} from "@/schemas/checkout-settings.schema"
import { storeService } from "@/services/api/store.service"
import type { UpdateCartSettingsPayload } from "@/types/store.types"

interface UseCheckoutSettingsReturn {
  isLoading: boolean
  isSaving: boolean
  form: UseFormReturn<CheckoutSettingsFormData>
  storeId: string | null
  onSubmit: (data: CheckoutSettingsFormData) => Promise<void>
}

export function useCheckoutSettings(): UseCheckoutSettingsReturn {
  const { getToken } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [storeId, setStoreId] = useState<string | null>(null)

  const form = useForm<CheckoutSettingsFormData>({
    resolver: zodResolver(checkoutSettingsSchema),
    defaultValues: {
      enabled: true,
      allowEdit: true,
      expirationMinutes: 30,
      reserveStock: true,
      allowStorePickup: false,
      maxQuantityPerItem: 5,
    },
  })

  const { setValue } = form

  useEffect(() => {
    async function loadSettings() {
      try {
        const token = await getToken()
        const store = await storeService.getCurrent(token)
        setStoreId(store.id)

        if (store.cartSettings) {
          const cs = store.cartSettings
          setValue("enabled", cs.enabled)
          setValue("allowEdit", cs.allowEdit ?? true)
          setValue("expirationMinutes", cs.expirationMinutes)
          setValue("reserveStock", cs.reserveStock)
          setValue("allowStorePickup", cs.allowStorePickup ?? false)
          setValue("maxQuantityPerItem", cs.maxQuantityPerItem)
        }
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

  const onSubmit = async (data: CheckoutSettingsFormData) => {
    if (!storeId) return

    setIsSaving(true)
    try {
      const token = await getToken()

      // Load the current cart settings first so we don't clobber the
      // notification-trigger fields owned by the Communications editor.
      const store = await storeService.getCurrent(token)
      const cs = store.cartSettings

      const cartPayload: UpdateCartSettingsPayload = {
        enabled: data.enabled,
        expirationMinutes: data.expirationMinutes,
        reserveStock: data.reserveStock,
        allowStorePickup: data.allowStorePickup,
        maxQuantityPerItem: data.maxQuantityPerItem,
        allowEdit: data.allowEdit,
        checkoutSendMethods: cs.checkoutSendMethods ?? ["public_link", "manual"],
        realTimeCart: cs.realTimeCart,
        sendExpirationReminder: cs.sendExpirationReminder,
        expirationReminderMinutes: cs.expirationReminderMinutes,
      }

      await storeService.updateCartSettings(cartPayload, token, storeId)

      toast.success("Configurações salvas")
      form.reset(data)
    } catch (error) {
      console.error("Failed to save checkout settings:", error)
      toast.error("Erro ao salvar")
    } finally {
      setIsSaving(false)
    }
  }

  return {
    isLoading,
    isSaving,
    form,
    storeId,
    onSubmit,
  }
}
