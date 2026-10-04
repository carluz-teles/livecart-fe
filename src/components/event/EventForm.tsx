"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Loader2, CalendarRange, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
import { createEventSchema, type CreateEventFormData } from "@/schemas/event.schema"
import { useCreateEvent } from "@/hooks/event"
import { useStore } from "@/hooks/store/useStore"
import { FieldHint } from "@/components/shared/FieldHint"
import { FormSection } from "@/components/shared/FormSection"
import { InheritableNumberField } from "@/components/shared/InheritableNumberField"
import { DurationField } from "@/components/shared/DurationField"
import {
  EVENT_COPY,
  isLongCampaign,
  campaignDuration,
  LONG_CAMPAIGN_WARNING,
} from "@/lib/event-copy"
import { DateTimeField } from "@/components/shared/DateTimeField"
import type { SessionType } from "@/lib/event-kind"
import type { CreateEventPayload } from "@/types/event.types"
import { EventWindowSummary, formatEventDate } from "./EventWindowSummary"

/** Valor do select de mídia quando o lojista escolhe não vincular agora. */

interface EventFormProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
  trigger?: React.ReactNode
  /** Tipo da PRIMEIRA transmissão. Existe para quem abre o formulário já
   *  sabendo o que vai publicar; o padrão é `live` e o lojista troca depois, na
   *  aba Sessões, sem que a escolha bloqueie a criação do evento. */
  initialSessionType?: SessionType
}

/** Prazo extra da fila quando a loja não tem um padrão próprio.
 *
 *  Diferente dos outros dois, este não existe nas configurações da loja — mora
 *  só no evento, com DEFAULT 30 no banco (migration 000073). Trazer o mesmo 30
 *  preenchido evita que o campo pareça "sem regra" quando na verdade tem uma.
 */
const WAITLIST_TTL_FALLBACK = 30

export function EventForm({
  open,
  onOpenChange,
  onSuccess,
  trigger,
  initialSessionType = "live",
}: EventFormProps) {
  const createEvent = useCreateEvent()
  // Os padrões da loja entram PREENCHIDOS, não como placeholder.
  //
  // Antes, vazio significava "herda da loja" e o backend resolvia com
  // COALESCE(evento, loja) a cada leitura. Herdar ao vivo tem um efeito que o
  // lojista não pede: mexer nas configurações da loja no meio de um evento em
  // andamento muda as regras dele por baixo. Preenchido, o evento nasce com uma
  // cópia do que a loja valia naquele momento — e continua editável aqui.
  const { data: store, isError: storeError, refetch: reloadStore } = useStore()
  const storeDefaults = store?.cartSettings
  const [internalOpen, setInternalOpen] = useState(false)
  const [extrasOpen, setExtrasOpen] = useState(false)
  const [review, setReview] = useState<CreateEventFormData | null>(null)
  const [datesConfirmed, setDatesConfirmed] = useState(false)
  const opened = useRef(false)
  const defaultsApplied = useRef(false)
  const submitting = useRef(false)
  const reviewHeading = useRef<HTMLHeadingElement>(null)
  const confirmationId = useId()
  const isControlled = open !== undefined
  const sheetOpen = isControlled ? open : internalOpen
  const handleOpenChange = (next: boolean) => {
    if (submitting.current) return
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  const initialValues = (): CreateEventFormData => ({
    title: "",
    // `type` é o tipo da PRIMEIRA SESSÃO — o evento nasce com uma transmissão
    // de live por padrão, e o lojista troca ou adiciona outras depois.
    type: initialSessionType,
    platform: undefined,
    platformLiveId: "",
    startsAt: null,
    // O lojista precisa escolher o último dia de toda a campanha.
    endsAt: "",
    description: null,
    // Regra de produto, não escolha: o prazo de finalização SEMPRE começa a
    // correr quando o evento fecha. Era um switch que oferecia a alternativa de
    // manter o carrinho aberto por um prazo bem maior, e nenhuma loja quer isso
    // — deixava estoque preso em carrinho de quem já tinha desistido.
    closeCartOnEventEnd: true,
    cartExpirationMinutes: storeDefaults?.expirationMinutes ?? null,
    cartMaxQuantityPerItem: storeDefaults?.maxQuantityPerItem ?? null,
    waitlistNotifiedTtlMinutes: WAITLIST_TTL_FALLBACK,
    freeShipping: false,
    pixDiscountPercent: 0,
  })

  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: initialValues(),
  })

  // Uma resposta tardia da loja só preenche regras ainda não editadas.
  // Refetch não pode apagar nome/data nem mudar o que já está em revisão.
  useEffect(() => {
    if (!sheetOpen) {
      opened.current = false
      return
    }
    if (!opened.current) {
      form.reset(initialValues())
      setExtrasOpen(false)
      setReview(null)
      setDatesConfirmed(false)
      opened.current = true
      defaultsApplied.current = !!storeDefaults
    } else if (storeDefaults && !defaultsApplied.current) {
      if (!form.getFieldState("cartExpirationMinutes").isDirty) {
        form.setValue("cartExpirationMinutes", storeDefaults.expirationMinutes)
      }
      if (!form.getFieldState("cartMaxQuantityPerItem").isDirty) {
        form.setValue("cartMaxQuantityPerItem", storeDefaults.maxQuantityPerItem)
      }
      defaultsApplied.current = true
    }
    // `form` é estável entre renders do react-hook-form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetOpen, initialSessionType, storeDefaults])

  useEffect(() => {
    if (review) reviewHeading.current?.focus()
  }, [review])

  const watchStartsAt = form.watch("startsAt")
  const watchEndsAt = form.watch("endsAt")

  // Só avisa sobre o teto quando o evento passa de 24h — numa live de duas
  // horas "máximo 2" é trava anti-abuso saudável, e o aviso viraria ruído.
  const longCampaignDuration = campaignDuration(watchStartsAt, watchEndsAt)
  const isPending = createEvent.isPending

  function onSubmit(data: CreateEventFormData) {
    if (submitting.current) return
    if (!review) {
      setReview(data)
      setDatesConfirmed(false)
      return
    }
    if (!datesConfirmed) return
    submitting.current = true
    const payload: CreateEventPayload = {
      title: data.title,
      type: data.type,
      // Only include platform if platformLiveId is provided
      platform: data.platformLiveId ? "instagram" : undefined,
      platformLiveId: data.platformLiveId || undefined,
      // Janela comercial. endsAt é obrigatório — sem ele o POST responde 422.
      startsAt: data.startsAt || undefined,
      endsAt: data.endsAt,
      description: data.description || undefined,
      // Cart settings
      closeCartOnEventEnd: data.closeCartOnEventEnd,
      cartExpirationMinutes: data.cartExpirationMinutes,
      cartMaxQuantityPerItem: data.cartMaxQuantityPerItem,
      waitlistNotifiedTtlMinutes: data.waitlistNotifiedTtlMinutes,
      freeShipping: data.freeShipping,
      pixDiscountPercent: data.pixDiscountPercent ?? 0,
    }

    createEvent.mutate(payload, {
      onSuccess: () => {
        submitting.current = false
        toast.success("Evento criado!", {
          description:
            "Abra o evento e use a aba Sessões para adicionar as transmissões — live, post, reel ou story.",
        })
        form.reset()
        handleOpenChange(false)
        onSuccess?.()
      },
      onError: (error) => {
        submitting.current = false
        toast.error("Erro ao criar evento", {
          description: error.message || "Tente novamente mais tarde.",
        })
      },
    })
  }

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Novo Evento
    </Button>
  )

  return (
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      {trigger !== null && (
        <SheetTrigger asChild>
          {trigger || defaultTrigger}
        </SheetTrigger>
      )}
      {/* Coluna flex com o scroll NUM FILHO, não no painel inteiro.
          Antes era `overflow-y-auto` no SheetContent: o rodapé com "Criar
          evento" rolava junto com o formulário e sumia da tela, e o painel
          inteiro virava a área de rolagem — que é o comportamento que
          desaparecia sozinho conforme o conteúdo cabia ou não.

          `sm:max-w-[480px]` é obrigatório junto com `sm:w-[480px]`: a base do
          SheetContent traz `sm:max-w-sm` (384px) e o twMerge não reconcilia
          `max-w-*` com `w-*` — são propriedades diferentes. Sem isto o painel
          ficava preso em 384px e o `sm:w-[480px]` não valia nada. */}
      {/* `w-full` no mobile, não `w-[400px]`: 400 é mais largo que a tela de um
          iPhone SE (375) e o painel estourava a viewport. */}
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:w-[480px] sm:max-w-[480px]">
        <SheetHeader className="px-6 pb-4 pt-6">
          <SheetTitle ref={reviewHeading} tabIndex={-1} className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-primary" />
            {review ? "Confirme as datas do evento" : "Novo evento"}
          </SheetTitle>
          {/* Três linhas de texto antes do primeiro campo empurravam o
              formulário para baixo da dobra. O que o lojista precisa saber aqui
              é que não está escolhendo um formato agora — o resto ele descobre
              ao adicionar a primeira transmissão. */}
          <SheetDescription>
            {review ? "Confira o último dia de vendas antes de criar. Você pode voltar e corrigir." : "Escolha o período completo da campanha. Você adiciona as transmissões depois."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          {/* min-h-0 no filho que rola: sem ele o item flex adota a altura do
              conteúdo em vez de encolher, e o overflow-y-auto nunca dispara. */}
          <form
            onSubmit={form.handleSubmit(onSubmit, () => { setReview(null); setDatesConfirmed(false) })}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div hidden={!!review} className={cn("min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6", review ? "hidden" : "flex")}>
            {!storeDefaults && (
              <p className="text-sm text-muted-foreground" role="status">
                {storeError ? "Não foi possível carregar as regras da loja. " : "Carregando as regras da loja…"}
                {storeError && <Button type="button" variant="link" onClick={() => reloadStore()}>Tentar novamente</Button>}
              </p>
            )}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {EVENT_COPY.title.label} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={EVENT_COPY.title.placeholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormSection title="Janela de vendas" hint={EVENT_COPY.windowSection.hint}>
              {/* Empilha na tela estreita: lado a lado, cada data fica com menos de
                  170px e a legenda vira reticências. */}
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="startsAt"
                  render={({ field }) => (
                    <FormItem className="flex min-w-0 flex-col">
                      <FormLabel>{EVENT_COPY.startsAt.label}</FormLabel>
                      <FormControl><DateTimeField
                        ref={field.ref}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Começa agora"
                      /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endsAt"
                  render={({ field }) => (
                    <FormItem className="flex min-w-0 flex-col">
                      <FormLabel>
                        {EVENT_COPY.endsAt.label} <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl><DateTimeField
                        ref={field.ref}
                        value={field.value}
                        onChange={(iso) => field.onChange(iso ?? "")}
                        clearable={false}
                        defaultHour={23}
                        defaultMinute={59}
                        placeholder="Escolha o último dia da campanha"
                      /></FormControl>
                      <FormDescription>{EVENT_COPY.endsAt.help}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {watchEndsAt && Number.isFinite(Date.parse(watchEndsAt)) && (
                <p className="text-sm font-medium" role="status">
                  Receber compras até {formatEventDate(watchEndsAt)}.
                </p>
              )}

              {isLongCampaign(watchStartsAt, watchEndsAt) && (
                <Warning>{LONG_CAMPAIGN_WARNING}</Warning>
              )}
            </FormSection>

            <FormSection
              title="Regras do carrinho"
              hint={EVENT_COPY.cartSection.hint}
              description="Preenchidas com o padrão da sua loja. Valem só para este evento."
            >
              <FormField
                control={form.control}
                name="cartExpirationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      {EVENT_COPY.cartExpiration.label}
                      <FieldHint text={EVENT_COPY.cartExpiration.help} />
                    </FormLabel>
                    <FormControl>
                      <DurationField
                        ariaLabel={EVENT_COPY.cartExpiration.label}
                        value={field.value}
                        onChange={field.onChange}
                        minMinutes={15}
                        maxMinutes={43200}
                        inheritedValue={storeDefaults?.expirationMinutes}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cartMaxQuantityPerItem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      {EVENT_COPY.maxQuantity.label}
                      <FieldHint text={EVENT_COPY.maxQuantity.help} />
                    </FormLabel>
                    <FormControl>
                      <InheritableNumberField
                        value={field.value}
                        onChange={field.onChange}
                        min={1}
                        unit={"unidades por produto"}
                        inheritedValue={storeDefaults?.maxQuantityPerItem}
                      />
                    </FormControl>
                    {/* O texto do teto era permanente por ser o contrato de
                        aceitação do risco R2. Ele continua obrigatório — mas só
                        onde morde: num evento de um dia "máximo 2" é trava
                        anti-abuso e ninguém precisa ser avisado. */}
                    {field.value != null && longCampaignDuration && (
                      <Warning>
                        <strong>{field.value} por produto vale para o evento inteiro</strong>{" "}
                        ({longCampaignDuration}). Quem atingir o teto na primeira
                        transmissão fica bloqueado até o fim.
                      </Warning>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="waitlistNotifiedTtlMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      {EVENT_COPY.waitlistTtl.label}
                      <FieldHint text={EVENT_COPY.waitlistTtl.help} />
                    </FormLabel>
                    <FormControl>
                      <DurationField
                        value={field.value}
                        onChange={field.onChange}
                        minMinutes={0}
                        maxMinutes={43200}
                        ariaLabel={EVENT_COPY.waitlistTtl.label}
                        placeholder="30 minutos"
                      />
                    </FormControl>
                    <FormDescription>{EVENT_COPY.waitlistTtl.help}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            {/* Tudo o que tem padrão bom fica fechado.
                Frete grátis, desconto no Pix e a nota interna são exceção, não
                rotina: abertos por padrão, ocupavam mais da metade do
                formulário para dizer "não" três vezes. */}
            <Collapsible open={extrasOpen} onOpenChange={setExtrasOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:bg-muted/50">
                <div>
                  <p className="text-sm font-semibold">Promoções e observações</p>
                  <p className="text-xs text-muted-foreground">
                    Frete grátis, desconto no Pix e nota interna
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    extrasOpen && "rotate-180",
                  )}
                />
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="freeShipping"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border p-3">
                      <FormLabel className="flex items-center gap-1.5 text-sm font-normal">
                        {EVENT_COPY.freeShipping.label}
                        <FieldHint text={EVENT_COPY.freeShipping.hint} />
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pixDiscountPercent"
                  render={({ field }) => {
                    const value = field.value ?? 0
                    const enabled = value > 0
                    return (
                      <FormItem className="rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-4">
                          <FormLabel className="flex items-center gap-1.5 text-sm font-normal">
                            {EVENT_COPY.pixDiscount.label}
                            <FieldHint text={EVENT_COPY.pixDiscount.hint} />
                          </FormLabel>
                          <Switch
                            checked={enabled}
                            onCheckedChange={(checked) => field.onChange(checked ? 10 : 0)}
                          />
                        </div>
                        {enabled && (
                          <div className="mt-3 flex items-center gap-2">
                            <FormControl>
                              <Input
                                type="number"
                                inputMode="numeric"
                                min={1}
                                max={100}
                                step={1}
                                value={value}
                                onChange={(e) => {
                                  const parsed = parseInt(e.target.value, 10)
                                  field.onChange(
                                    Number.isNaN(parsed)
                                      ? 0
                                      : Math.min(100, Math.max(0, parsed)),
                                  )
                                }}
                                className="w-20"
                                aria-label="Percentual de desconto no Pix"
                              />
                            </FormControl>
                            <span className="text-sm text-muted-foreground">
                              % de desconto no checkout
                            </span>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-normal">
                        Nota interna
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Só você vê. Produtos destaque, combinados com a equipe..."
                          className="min-h-[72px] resize-none"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>
            </div>
            {review && (
              <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6">
                <EventWindowSummary {...review} cartExpirationMinutes={review.cartExpirationMinutes ?? storeDefaults?.expirationMinutes} />
                <div className="flex items-start gap-3">
                  <Checkbox id={confirmationId} checked={datesConfirmed}
                    onCheckedChange={(checked) => setDatesConfirmed(checked === true)} disabled={isPending} />
                  <Label htmlFor={confirmationId} className="leading-relaxed">
                    Conferi o dia e o horário de encerramento. Eles cobrem toda a minha campanha.
                  </Label>
                </div>
              </div>
            )}
            {/* Fora da área que rola: os botões ficam sempre à vista. */}
            <div className="flex shrink-0 justify-end gap-3 border-t bg-background px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (review) { setReview(null); setDatesConfirmed(false) }
                  else handleOpenChange(false)
                }}
                disabled={isPending}
              >
                {review ? "Voltar e corrigir" : "Cancelar"}
              </Button>
              <Button type="submit" disabled={isPending || !storeDefaults || (!!review && !datesConfirmed)}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Criando..." : review ? "Confirmar e criar" : "Revisar datas"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

/**
 * Aviso âmbar do formulário.
 *
 * Os dois avisos daqui eram blocos de texto corrido com as mesmas cinco classes
 * repetidas. Um componente evita que o próximo nasça com outro tom de amarelo —
 * e obriga a escrever curto, porque o espaço é o mesmo para os dois.
 */
function Warning({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
      {children}
    </p>
  )
}
