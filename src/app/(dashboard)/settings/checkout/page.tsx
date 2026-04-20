"use client"

import {
  ShoppingCart,
  Clock,
  Package,
  Loader2,
  Pencil,
  MessageSquare,
  Zap,
  Radio,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { InlineTemplateEditor } from "@/components/settings/InlineTemplateEditor"
import { useCheckoutSettings } from "@/hooks/settings/useCheckoutSettings"
import { defaultTemplates } from "@/schemas/checkout-settings.schema"

export default function CheckoutSettingsPage() {
  const {
    isLoading,
    isSaving,
    form,
    variables,
    onSubmit,
    handlePreview,
  } = useCheckoutSettings()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = form

  // Watch values for controlled components
  const enabled = watch("enabled")
  const allowEdit = watch("allowEdit")
  const reserveStock = watch("reserveStock")
  const realTimeCart = watch("realTimeCart")
  const sendOnLiveEnd = watch("sendOnLiveEnd")
  const sendExpirationReminder = watch("sendExpirationReminder")
  const templates = watch("templates")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section 1: General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Configurações gerais
          </CardTitle>
          <CardDescription>
            Controle básico do carrinho e checkout
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Carrinho ativo</Label>
              <p className="text-sm text-muted-foreground">
                Quando desativado, clientes não podem adicionar produtos
              </p>
            </div>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={(checked) =>
                setValue("enabled", checked, { shouldDirty: true })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowEdit" className="flex items-center gap-2">
                <Pencil className="h-4 w-4 text-muted-foreground" />
                Permitir edição no checkout
              </Label>
              <p className="text-sm text-muted-foreground">
                Cliente pode remover itens ou alterar quantidades
              </p>
            </div>
            <Switch
              id="allowEdit"
              checked={allowEdit}
              onCheckedChange={(checked) =>
                setValue("allowEdit", checked, { shouldDirty: true })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Expiration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tempo de expiração
          </CardTitle>
          <CardDescription>
            Configure quanto tempo o carrinho fica válido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="expirationMinutes">
              Expiração do carrinho (minutos)
            </Label>
            <Input
              id="expirationMinutes"
              type="number"
              min={5}
              max={1440}
              {...register("expirationMinutes", { valueAsNumber: true })}
            />
            {errors.expirationMinutes && (
              <p className="text-sm text-destructive">
                {errors.expirationMinutes.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              5 minutos até 24 horas. O link de checkout usa o mesmo tempo.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Limits */}
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
              onCheckedChange={(checked) =>
                setValue("reserveStock", checked, { shouldDirty: true })
              }
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
                <p className="text-sm text-destructive">
                  {errors.maxItems.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">0 = sem limite</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxQuantityPerItem">
                Quantidade máxima por item
              </Label>
              <Input
                id="maxQuantityPerItem"
                type="number"
                min={1}
                {...register("maxQuantityPerItem", { valueAsNumber: true })}
              />
              {errors.maxQuantityPerItem && (
                <p className="text-sm text-destructive">
                  {errors.maxQuantityPerItem.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Automatic Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mensagens automáticas
          </CardTitle>
          <CardDescription>
            Configure quando e o que enviar para seus clientes via Instagram DM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Real-time Cart */}
          <div className="rounded-lg border bg-card">
            <div className="flex items-start justify-between gap-4 p-4">
              <div className="space-y-0.5">
                <Label
                  htmlFor="realTimeCart"
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Carrinho em tempo real
                </Label>
                <p className="text-sm text-muted-foreground">
                  Envia mensagem toda vez que o cliente adiciona um item
                </p>
              </div>
              <Switch
                id="realTimeCart"
                checked={realTimeCart}
                onCheckedChange={(checked) =>
                  setValue("realTimeCart", checked, { shouldDirty: true })
                }
              />
            </div>

            {realTimeCart && (
              <div className="border-t px-4 pb-4 pt-3 space-y-4">
                {/* Template: First Item */}
                <InlineTemplateEditor
                  id="first-item"
                  label="Primeiro item"
                  description="Enviada quando o cliente adiciona o primeiro item"
                  enabled={templates.checkout_immediate?.enabled ?? true}
                  onEnabledChange={(checked) =>
                    setValue("templates.checkout_immediate.enabled", checked, {
                      shouldDirty: true,
                    })
                  }
                  template={templates.checkout_immediate?.template ?? ""}
                  defaultTemplate={defaultTemplates.checkout_immediate}
                  onTemplateChange={(template) =>
                    setValue("templates.checkout_immediate.template", template, {
                      shouldDirty: true,
                    })
                  }
                  variables={variables}
                  onPreview={handlePreview}
                />

                {/* Template: New Items */}
                <InlineTemplateEditor
                  id="new-items"
                  label="Novos itens"
                  description="Enviada quando o cliente adiciona mais itens"
                  enabled={templates.item_added?.enabled ?? true}
                  onEnabledChange={(checked) =>
                    setValue("templates.item_added.enabled", checked, {
                      shouldDirty: true,
                    })
                  }
                  template={templates.item_added?.template ?? ""}
                  defaultTemplate={defaultTemplates.item_added}
                  onTemplateChange={(template) =>
                    setValue("templates.item_added.template", template, {
                      shouldDirty: true,
                    })
                  }
                  variables={variables}
                  onPreview={handlePreview}
                />

                {/* Cooldown */}
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="messageCooldownSeconds">
                      Intervalo mínimo entre mensagens (segundos)
                    </Label>
                    <Input
                      id="messageCooldownSeconds"
                      type="number"
                      min={0}
                      max={300}
                      className="max-w-[200px]"
                      {...register("messageCooldownSeconds", {
                        valueAsNumber: true,
                      })}
                    />
                    {errors.messageCooldownSeconds && (
                      <p className="text-sm text-destructive">
                        {errors.messageCooldownSeconds.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Evita spam de mensagens. 0 = sem limite
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* End of Live */}
          <div className="rounded-lg border bg-card">
            <div className="flex items-start justify-between gap-4 p-4">
              <div className="space-y-0.5">
                <Label
                  htmlFor="sendOnLiveEnd"
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <Radio className="h-4 w-4 text-red-500" />
                  Mensagem ao fim da live
                </Label>
                <p className="text-sm text-muted-foreground">
                  Envia o carrinho completo quando você finalizar a live
                </p>
              </div>
              <Switch
                id="sendOnLiveEnd"
                checked={sendOnLiveEnd}
                onCheckedChange={(checked) =>
                  setValue("sendOnLiveEnd", checked, { shouldDirty: true })
                }
              />
            </div>

            {sendOnLiveEnd && (
              <div className="border-t px-4 pb-4 pt-3">
                <p className="text-sm text-muted-foreground mb-2">
                  Usa o template de &quot;Novos itens&quot; com o resumo do carrinho
                </p>
              </div>
            )}
          </div>

          {/* Expiration Reminder */}
          <InlineTemplateEditor
            id="expiration-reminder"
            label="Lembrete de expiração"
            description="Enviada alguns minutos antes do carrinho expirar"
            enabled={sendExpirationReminder}
            onEnabledChange={(checked) =>
              setValue("sendExpirationReminder", checked, { shouldDirty: true })
            }
            template={templates.checkout_reminder?.template ?? ""}
            defaultTemplate={defaultTemplates.checkout_reminder}
            onTemplateChange={(template) =>
              setValue("templates.checkout_reminder.template", template, {
                shouldDirty: true,
              })
            }
            variables={variables}
            onPreview={handlePreview}
            additionalFields={
              sendExpirationReminder && (
                <div className="space-y-2">
                  <Label
                    htmlFor="expirationReminderMinutes"
                    className="text-sm"
                  >
                    Enviar lembrete X minutos antes
                  </Label>
                  <Input
                    id="expirationReminderMinutes"
                    type="number"
                    min={1}
                    max={60}
                    className="max-w-[200px]"
                    {...register("expirationReminderMinutes", {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.expirationReminderMinutes && (
                    <p className="text-sm text-destructive">
                      {errors.expirationReminderMinutes.message}
                    </p>
                  )}
                </div>
              )
            }
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end sticky bottom-4">
        <Button
          type="submit"
          disabled={isSaving || !isDirty}
          className="shadow-lg"
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar alterações
        </Button>
      </div>
    </form>
  )
}
