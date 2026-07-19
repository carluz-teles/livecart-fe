"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Percent, Tag, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { couponFormSchema, type CouponFormData } from "@/schemas/coupon.schema"
import type {
  Coupon,
  CouponType,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "@/types"

interface EventCouponsFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupon?: Coupon | null // edit mode when set
  isPending: boolean
  onCreate?: (payload: CreateCouponPayload) => void
  onUpdate?: (payload: UpdateCouponPayload) => void
}

const TYPES: {
  value: CouponType
  label: string
  hint: string
  icon: typeof Percent
}[] = [
  {
    value: "percent",
    label: "Percentual",
    hint: "Desconto em % sobre o subtotal",
    icon: Percent,
  },
  {
    value: "fixed",
    label: "Valor fixo",
    hint: "Desconto em reais",
    icon: Tag,
  },
  {
    value: "free_shipping",
    label: "Frete grátis",
    hint: "Cobre o frete mais barato disponível",
    icon: Truck,
  },
]

const DEFAULTS: CouponFormData = {
  code: "",
  type: "percent",
  percentValue: "10",
  fixedValueBrl: "",
  freeShippingMaxBrl: "",
  maxUses: "",
  minPurchaseBrl: "",
  validFrom: "",
  validUntil: "",
  active: true,
}

function couponToFormData(c: Coupon): CouponFormData {
  // valueCents is shared with `fixed` (the discount amount) and
  // `free_shipping` (the optional ceiling). The form mirrors it into the
  // matching field based on the coupon's type so the merchant edits the
  // right input.
  const isShipping = c.type === "free_shipping"
  return {
    code: c.code,
    type: c.type,
    percentValue: c.percentBps ? String(c.percentBps / 100) : "",
    fixedValueBrl:
      !isShipping && c.valueCents ? (c.valueCents / 100).toFixed(2) : "",
    freeShippingMaxBrl:
      isShipping && c.valueCents ? (c.valueCents / 100).toFixed(2) : "",
    maxUses: c.maxUses != null ? String(c.maxUses) : "",
    minPurchaseBrl: c.minPurchaseCents
      ? (c.minPurchaseCents / 100).toFixed(2)
      : "",
    validFrom: c.validFrom ? toLocalDateTime(c.validFrom) : "",
    validUntil: c.validUntil ? toLocalDateTime(c.validUntil) : "",
    active: c.active,
  }
}

// ISO with timezone → "YYYY-MM-DDTHH:MM" for <input type="datetime-local">.
// We slice instead of constructing a Date so the merchant's wall-clock view
// of "começa às 18h" matches what they typed; converting to local then back
// to UTC introduces drift across DST.
function toLocalDateTime(iso: string): string {
  return iso.slice(0, 16)
}

function toIsoOrNull(local: string): string | null {
  if (!local) return null
  // Treat as local time, return ISO with the local zone offset.
  const d = new Date(local)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export function EventCouponsForm({
  open,
  onOpenChange,
  coupon,
  isPending,
  onCreate,
  onUpdate,
}: EventCouponsFormProps) {
  const isEditing = !!coupon

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: DEFAULTS,
  })

  useEffect(() => {
    if (open) {
      form.reset(coupon ? couponToFormData(coupon) : DEFAULTS)
    }
  }, [open, coupon, form])

  const type = form.watch("type")

  const handleSubmit = form.handleSubmit((data) => {
    const code = data.code.trim()
    // valueCents is reused: it carries the fixed discount for `fixed`
    // coupons and the optional ceiling for `free_shipping`. Empty / 0 on a
    // free-shipping coupon means "no merchant cap; cover the cheapest
    // available service in full".
    let valueCents = 0
    if (data.type === "fixed") {
      valueCents = Math.round(Number(data.fixedValueBrl) * 100)
    } else if (data.type === "free_shipping" && data.freeShippingMaxBrl) {
      valueCents = Math.round(Number(data.freeShippingMaxBrl) * 100)
    }
    const percentBps =
      data.type === "percent" ? Math.round(Number(data.percentValue) * 100) : 0
    const minPurchaseCents = data.minPurchaseBrl
      ? Math.round(Number(data.minPurchaseBrl) * 100)
      : 0
    const maxUses = data.maxUses ? Number(data.maxUses) : null
    const validFrom = toIsoOrNull(data.validFrom ?? "")
    const validUntil = toIsoOrNull(data.validUntil ?? "")

    if (isEditing) {
      onUpdate?.({
        type: data.type,
        valueCents,
        percentBps,
        maxUses,
        minPurchaseCents,
        validFrom,
        validUntil,
        active: data.active,
      })
    } else {
      onCreate?.({
        code,
        type: data.type,
        valueCents,
        percentBps,
        maxUses,
        minPurchaseCents,
        validFrom,
        validUntil,
        active: data.active,
      })
    }
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{isEditing ? "Editar cupom" : "Novo cupom"}</SheetTitle>
          <SheetDescription>
            Cupons valem só para esta live. Códigos não podem ser editados
            depois de criados — desative e crie outro caso precise mudar.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          {/* min-h-0 em toda a cadeia flex: sem isso o filho não encolhe
              abaixo do conteúdo (min-height:auto), o overflow-y-auto nunca
              ativa e o rodapé é empurrado para fora da tela — era o motivo
              de o formulário de cupom não rolar. */}
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Código <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="LIVE10"
                        autoComplete="off"
                        spellCheck={false}
                        translate="no"
                        {...field}
                        disabled={isEditing}
                        autoCapitalize="characters"
                        className="font-mono uppercase"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      O cliente digita este código no checkout. Não diferencia
                      maiúsculas de minúsculas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tipo de desconto</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                      >
                        {TYPES.map((t) => {
                          const Icon = t.icon
                          const isActive = field.value === t.value
                          return (
                            <label
                              key={t.value}
                              className={cn(
                                "flex cursor-pointer flex-col gap-1.5 rounded-md border p-3 text-left transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
                                isActive
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:bg-muted/40",
                              )}
                            >
                              <RadioGroupItem
                                value={t.value}
                                className="sr-only"
                              />
                              <div className="flex items-center gap-2">
                                <Icon
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                                <span className="text-sm font-medium">
                                  {t.label}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {t.hint}
                              </span>
                            </label>
                          )
                        })}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {type === "percent" && (
                <FormField
                  control={form.control}
                  name="percentValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Percentual de desconto{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            inputMode="decimal"
                            min={1}
                            max={100}
                            step="0.5"
                            placeholder="10"
                            autoComplete="off"
                            {...field}
                          />
                          <span
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                            aria-hidden="true"
                          >
                            %
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {type === "fixed" && (
                <FormField
                  control={form.control}
                  name="fixedValueBrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Valor do desconto{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                            aria-hidden="true"
                          >
                            R$
                          </span>
                          <Input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step="0.01"
                            placeholder="0,00"
                            autoComplete="off"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {type === "free_shipping" && (
                <FormField
                  control={form.control}
                  name="freeShippingMaxBrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite de desconto</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                            aria-hidden="true"
                          >
                            R$
                          </span>
                          <Input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step="0.01"
                            placeholder="Sem limite"
                            autoComplete="off"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        O cupom cobre o frete mais barato disponível, até esse
                        limite. Vazio = cobre o frete mais barato em qualquer
                        valor. Se o cliente escolher um envio mais caro, paga a
                        diferença.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Separator />

              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Limites
                </p>

                <FormField
                  control={form.control}
                  name="maxUses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite de usos</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          placeholder="Vazio = sem limite"
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Quantos clientes diferentes podem usar este cupom.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minPurchaseBrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor mínimo de compra</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                            aria-hidden="true"
                          >
                            R$
                          </span>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="0,00"
                            autoComplete="off"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        Carrinho precisa atingir esse valor para o cupom valer.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Vigência
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="validFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Início</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="validUntil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fim</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Vazio = vale enquanto o cupom estiver ativo.
                </p>
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Ativo</FormLabel>
                      <FormDescription className="text-xs">
                        Quando desligado o cliente recebe &ldquo;cupom inválido&rdquo;
                        ao tentar aplicar.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Salvando…"
                  : isEditing
                    ? "Salvar"
                    : "Criar cupom"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
