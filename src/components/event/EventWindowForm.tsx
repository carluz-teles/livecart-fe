"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Pencil } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateTimeField } from "@/components/shared/DateTimeField"
import { FieldHint } from "@/components/shared/FieldHint"
import {
  EVENT_COPY,
  WAITLIST_TTL_OPTIONS,
  isLongCampaign,
  LONG_CAMPAIGN_WARNING,
} from "@/lib/event-copy"
import {
  updateEventWindowSchema,
  type UpdateEventWindowFormData,
} from "@/schemas/event.schema"
import { useUpdateEvent } from "@/hooks/event"
import type { Event } from "@/types/event.types"

interface EventWindowFormProps {
  event: Event
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

/**
 * Edição da campanha depois de criada.
 *
 * Não existia tela de edição de evento nenhuma: `useUpdateEvent` estava
 * exportado e não era importado por ninguém, e o ramo `isEditing` do
 * `EventForm` era código morto. Enquanto isso o `PUT /lives/:id` já aceitava
 * `startsAt`, `endsAt` e `waitlistNotifiedTtlMinutes` — ou seja, "antecipar o
 * fim da campanha" e "ajustar o prazo extra da fila" eram regras implementadas
 * e inalcançáveis.
 *
 * Só a janela e o que depende dela. Trocar produtos, cupons e upsell tem tela
 * própria nas abas do detalhe.
 */
export function EventWindowForm({ event, open, onOpenChange, onSuccess }: EventWindowFormProps) {
  const updateEvent = useUpdateEvent()

  const form = useForm<UpdateEventWindowFormData>({
    resolver: zodResolver(updateEventWindowSchema),
    defaultValues: {
      title: event.title ?? "",
      startsAt: event.scheduledAt,
      endsAt: event.endsAt ?? "",
      waitlistNotifiedTtlMinutes: event.waitlistNotifiedTtlMinutes || 30,
      pixDiscountPercent: event.pixDiscountPercent ?? 0,
    },
  })

  useEffect(() => {
    form.reset({
      title: event.title ?? "",
      startsAt: event.scheduledAt,
      endsAt: event.endsAt ?? "",
      waitlistNotifiedTtlMinutes: event.waitlistNotifiedTtlMinutes || 30,
      pixDiscountPercent: event.pixDiscountPercent ?? 0,
    })
  }, [event, form])

  const watchStartsAt = form.watch("startsAt")
  const watchEndsAt = form.watch("endsAt")

  function onSubmit(data: UpdateEventWindowFormData) {
    updateEvent.mutate(
      {
        id: event.id,
        payload: {
          title: data.title,
          // String vazia é "limpar o início"; ausente seria "não mexer". Como
          // o formulário sempre carrega o valor atual, mandar o que está na
          // tela é o que o lojista espera ver de volta.
          startsAt: data.startsAt ?? "",
          endsAt: data.endsAt,
          waitlistNotifiedTtlMinutes: data.waitlistNotifiedTtlMinutes,
          pixDiscountPercent: data.pixDiscountPercent,
        },
      },
      {
        onSuccess: () => {
          toast.success("Campanha atualizada", {
            description:
              "Mudar o fim reprograma o encerramento — inclusive para antes, se você antecipou.",
          })
          onOpenChange(false)
          onSuccess?.()
        },
        onError: (error) => {
          toast.error("Erro ao atualizar a campanha", {
            description: error.message || "Tente novamente mais tarde.",
          })
        },
      }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] overflow-y-auto sm:w-[480px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Editar campanha
          </SheetTitle>
          <SheetDescription>
            Ajuste a janela comercial e as regras de prazo. Antecipar o fim faz o prazo de
            pagamento começar a correr mais cedo para todo mundo.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    {EVENT_COPY.title.label} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={EVENT_COPY.title.placeholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startsAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-1.5">
                    {EVENT_COPY.startsAt.label}
                    <FieldHint text={EVENT_COPY.startsAt.hint} />
                  </FormLabel>
                  <DateTimeField
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Começa agora"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endsAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-1.5">
                    {EVENT_COPY.endsAt.label} <span className="text-destructive">*</span>
                    <FieldHint text={EVENT_COPY.endsAt.hint} />
                  </FormLabel>
                  <DateTimeField
                    value={field.value}
                    onChange={(iso) => field.onChange(iso ?? "")}
                    clearable={false}
                    defaultHour={23}
                    defaultMinute={59}
                  />
                  <FormDescription>{EVENT_COPY.endsAt.help}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isLongCampaign(watchStartsAt, watchEndsAt) && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {LONG_CAMPAIGN_WARNING}
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="waitlistNotifiedTtlMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    {EVENT_COPY.waitlistTtl.label}
                    <FieldHint text={EVENT_COPY.waitlistTtl.hint} />
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                    value={String(field.value ?? 30)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {WAITLIST_TTL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>{EVENT_COPY.waitlistTtl.help}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pixDiscountPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    {EVENT_COPY.pixDiscount.label}
                    <FieldHint text={EVENT_COPY.pixDiscount.hint} />
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={100}
                        step={1}
                        className="w-24"
                        value={field.value ?? 0}
                        onChange={(e) => {
                          const parsed = parseInt(e.target.value, 10)
                          field.onChange(
                            Number.isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed))
                          )
                        }}
                        aria-label="Percentual de desconto no Pix"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateEvent.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateEvent.isPending}>
                {updateEvent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {updateEvent.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
