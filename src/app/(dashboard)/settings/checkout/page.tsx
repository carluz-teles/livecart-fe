"use client"

import Link from "next/link"
import {
  ShoppingCart,
  Clock,
  Package,
  Loader2,
  Pencil,
  MessageSquare,
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
import { DurationField } from "@/components/shared/DurationField"
import { useCheckoutSettings } from "@/hooks/settings/useCheckoutSettings"

export default function CheckoutSettingsPage() {
  const { isLoading, isSaving, form, onSubmit } = useCheckoutSettings()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = form

  const enabled = watch("enabled")
  const allowEdit = watch("allowEdit")
  const reserveStock = watch("reserveStock")
  const allowStorePickup = watch("allowStorePickup")

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
            Prazo do carrinho
          </CardTitle>
          <CardDescription>
            Padrão da loja para o prazo depois que a campanha fecha — o relógio só começa quando o evento termina, e cada evento pode ter o seu próprio prazo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md">
            <Label htmlFor="expirationMinutes">
              Prazo para finalizar após o evento
            </Label>
            <DurationField
              id="expirationMinutes"
              value={watch("expirationMinutes")}
              onChange={(v) =>
                setValue("expirationMinutes", v ?? 0, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              minMinutes={15}
              maxMinutes={43200}
            />
            {errors.expirationMinutes && (
              <p className="text-sm text-destructive">
                {errors.expirationMinutes.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              De 15 minutos a 30 dias. Não é inatividade: durante a campanha o
              carrinho nunca expira, e o relógio começa quando o evento fecha. O
              link de checkout usa o mesmo tempo.
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

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowStorePickup">Permitir retirada na loja</Label>
              <p className="text-sm text-muted-foreground">
                Oferece &ldquo;Retirar na loja&rdquo; (grátis) no checkout, com o
                endereço da loja. Também serve de alternativa quando não há
                integração de frete configurada.
              </p>
            </div>
            <Switch
              id="allowStorePickup"
              checked={allowStorePickup}
              onCheckedChange={(checked) =>
                setValue("allowStorePickup", checked, { shouldDirty: true })
              }
            />
          </div>

          <div className="space-y-2 max-w-xs">
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
            <p className="text-xs text-muted-foreground">
              Limite máximo que cada cliente pode comprar de um mesmo produto
            </p>
          </div>

          <div className="space-y-2 max-w-xs">
            <Label htmlFor="minInstallmentReais">
              Valor mínimo da parcela
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                R$
              </span>
              <Input
                id="minInstallmentReais"
                type="number"
                min={0}
                step="0.01"
                className="pl-9"
                {...register("minInstallmentReais", { valueAsNumber: true })}
              />
            </div>
            {errors.minInstallmentReais && (
              <p className="text-sm text-destructive">
                {errors.minInstallmentReais.message}
              </p>
            )}
            {/* O exemplo faz mais que a regra: "R$ 20" é abstrato, "12× de
                R$ 5,00 numa venda de R$ 60" é o que o lojista está pagando de
                MDR hoje sem perceber. */}
            <p className="text-xs leading-relaxed text-muted-foreground">
              O cartão não parcela abaixo deste valor. Com R$ 20, uma venda de
              R$ 60 oferece até 3×; sem mínimo, ela ofereceria 12× de R$ 5,00.
              Deixe 0 para não limitar. À vista sempre aparece.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: pointer to Comunicações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mensagens automáticas
          </CardTitle>
          <CardDescription>
            Mensagens enviadas pelo Instagram em cada etapa da jornada agora
            ficam em <Link href="/communications" className="font-medium text-primary hover:underline">Comunicações</Link>.
          </CardDescription>
        </CardHeader>
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
