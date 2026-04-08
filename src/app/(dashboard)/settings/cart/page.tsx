"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  ShoppingCart,
  Clock,
  Package,
  Loader2,
  Pencil,
  Link,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { storeService } from "@/services/api/store.service"
import type { UpdateCartSettingsPayload } from "@/types/store.types"

const cartSettingsSchema = z.object({
  enabled: z.boolean(),
  expirationMinutes: z.number().min(5, "Mínimo de 5 minutos").max(1440, "Máximo de 24 horas"),
  reserveStock: z.boolean(),
  maxItems: z.number().min(0, "Deve ser 0 ou maior"),
  maxQuantityPerItem: z.number().min(1, "Mínimo de 1 item"),
  notifyBeforeExpiration: z.boolean(),
  allowEdit: z.boolean(),
  autoSendCheckoutLinks: z.boolean(),
  checkoutLinkExpiryHours: z.number().min(1, "Mínimo de 1 hora").max(168, "Máximo de 7 dias"),
})

type CartSettingsFormData = z.infer<typeof cartSettingsSchema>

export default function CartSettingsPage() {
  const { getToken } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [storeId, setStoreId] = useState<string | null>(null)

  const form = useForm<CartSettingsFormData>({
    resolver: zodResolver(cartSettingsSchema),
    defaultValues: {
      enabled: true,
      expirationMinutes: 30,
      reserveStock: true,
      maxItems: 0,
      maxQuantityPerItem: 5,
      notifyBeforeExpiration: true,
      allowEdit: true,
      autoSendCheckoutLinks: false,
      checkoutLinkExpiryHours: 48,
    },
  })

  const { register, handleSubmit, setValue, watch, formState: { errors, isDirty } } = form

  // Watch all values for controlled components
  const enabled = watch("enabled")
  const reserveStock = watch("reserveStock")
  const notifyBeforeExpiration = watch("notifyBeforeExpiration")
  const allowEdit = watch("allowEdit")
  const autoSendCheckoutLinks = watch("autoSendCheckoutLinks")

  // Load current settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const token = await getToken()
        const store = await storeService.getCurrent(token)
        setStoreId(store.id)

        if (store.cartSettings) {
          const settings = store.cartSettings
          setValue("enabled", settings.enabled)
          setValue("expirationMinutes", settings.expirationMinutes)
          setValue("reserveStock", settings.reserveStock)
          setValue("maxItems", settings.maxItems)
          setValue("maxQuantityPerItem", settings.maxQuantityPerItem)
          setValue("notifyBeforeExpiration", settings.notifyBeforeExpiration)
          setValue("allowEdit", settings.allowEdit ?? true)
          setValue("autoSendCheckoutLinks", settings.autoSendCheckoutLinks ?? false)
          setValue("checkoutLinkExpiryHours", settings.checkoutLinkExpiryHours ?? 48)
        }
      } catch (error) {
        console.error("Failed to load cart settings:", error)
        toast.error("Erro ao carregar configurações", {
          description: "Não foi possível carregar as configurações do carrinho.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [getToken, setValue])

  const onSubmit = async (data: CartSettingsFormData) => {
    setIsSaving(true)
    try {
      const token = await getToken()
      const payload: UpdateCartSettingsPayload = {
        enabled: data.enabled,
        expirationMinutes: data.expirationMinutes,
        reserveStock: data.reserveStock,
        maxItems: data.maxItems,
        maxQuantityPerItem: data.maxQuantityPerItem,
        notifyBeforeExpiration: data.notifyBeforeExpiration,
        allowEdit: data.allowEdit,
        autoSendCheckoutLinks: data.autoSendCheckoutLinks,
        checkoutLinkExpiryHours: data.checkoutLinkExpiryHours,
      }

      await storeService.updateCartSettings(payload, token, storeId ?? undefined)

      toast.success("Configurações salvas", {
        description: "As configurações do carrinho foram atualizadas com sucesso.",
      })

      // Reset form state to mark as not dirty
      form.reset(data)
    } catch (error) {
      console.error("Failed to save cart settings:", error)
      toast.error("Erro ao salvar", {
        description: "Não foi possível salvar as configurações do carrinho.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Cart Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Status do carrinho
          </CardTitle>
          <CardDescription>
            Ative ou desative o carrinho de compras da sua loja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Carrinho ativo</Label>
              <p className="text-sm text-muted-foreground">
                Quando desativado, clientes não podem adicionar produtos ao carrinho
              </p>
            </div>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={(checked) => setValue("enabled", checked, { shouldDirty: true })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Expiration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tempo de expiração
          </CardTitle>
          <CardDescription>
            Configure quanto tempo um carrinho fica ativo antes de expirar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="expirationMinutes">Tempo de expiração (minutos)</Label>
            <Input
              id="expirationMinutes"
              type="number"
              min={5}
              max={1440}
              {...register("expirationMinutes", { valueAsNumber: true })}
            />
            {errors.expirationMinutes && (
              <p className="text-sm text-destructive">{errors.expirationMinutes.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Após este tempo, o carrinho será automaticamente esvaziado (5 min - 24 horas)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifyBeforeExpiration">Notificar antes de expirar</Label>
              <p className="text-sm text-muted-foreground">
                Enviar lembrete ao cliente antes do carrinho expirar
              </p>
            </div>
            <Switch
              id="notifyBeforeExpiration"
              checked={notifyBeforeExpiration}
              onCheckedChange={(checked) => setValue("notifyBeforeExpiration", checked, { shouldDirty: true })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stock & Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Estoque e limites
          </CardTitle>
          <CardDescription>
            Configure reserva de estoque e limites de quantidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reserveStock">Reservar estoque</Label>
              <p className="text-sm text-muted-foreground">
                Reserva o estoque enquanto o produto está no carrinho
              </p>
            </div>
            <Switch
              id="reserveStock"
              checked={reserveStock}
              onCheckedChange={(checked) => setValue("reserveStock", checked, { shouldDirty: true })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxItems">Máximo de itens no carrinho</Label>
              <Input
                id="maxItems"
                type="number"
                min={0}
                {...register("maxItems", { valueAsNumber: true })}
              />
              {errors.maxItems && (
                <p className="text-sm text-destructive">{errors.maxItems.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                0 = sem limite
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxQuantityPerItem">Quantidade máxima por item</Label>
              <Input
                id="maxQuantityPerItem"
                type="number"
                min={1}
                {...register("maxQuantityPerItem", { valueAsNumber: true })}
              />
              {errors.maxQuantityPerItem && (
                <p className="text-sm text-destructive">{errors.maxQuantityPerItem.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cart Editing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edição do carrinho
          </CardTitle>
          <CardDescription>
            Permissões de edição para o cliente na página de checkout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowEdit">Permitir edição</Label>
              <p className="text-sm text-muted-foreground">
                Cliente pode remover itens ou alterar quantidades no checkout
              </p>
            </div>
            <Switch
              id="allowEdit"
              checked={allowEdit}
              onCheckedChange={(checked) => setValue("allowEdit", checked, { shouldDirty: true })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Checkout Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Links de checkout
          </CardTitle>
          <CardDescription>
            Configure como os links de checkout são gerados e enviados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoSendCheckoutLinks">Envio automático</Label>
              <p className="text-sm text-muted-foreground">
                Enviar links de checkout automaticamente quando a live terminar
              </p>
            </div>
            <Switch
              id="autoSendCheckoutLinks"
              checked={autoSendCheckoutLinks}
              onCheckedChange={(checked) => setValue("autoSendCheckoutLinks", checked, { shouldDirty: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkoutLinkExpiryHours">Tempo de expiração do link (horas)</Label>
            <Input
              id="checkoutLinkExpiryHours"
              type="number"
              min={1}
              max={168}
              {...register("checkoutLinkExpiryHours", { valueAsNumber: true })}
            />
            {errors.checkoutLinkExpiryHours && (
              <p className="text-sm text-destructive">{errors.checkoutLinkExpiryHours.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Após este tempo, o link de checkout expira (1 - 168 horas)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving || !isDirty}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar alterações
        </Button>
      </div>
    </form>
  )
}
