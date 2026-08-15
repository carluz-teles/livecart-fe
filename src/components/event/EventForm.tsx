"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Loader2, CalendarRange, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { createEventSchema, type CreateEventFormData } from "@/schemas/event.schema"
import { useCreateEvent } from "@/hooks/event"
import { useStore } from "@/hooks/store/useStore"
import { FieldHint } from "@/components/shared/FieldHint"
import { InheritableNumberField } from "@/components/shared/InheritableNumberField"
import {
  EVENT_COPY,
  isLongCampaign,
  campaignDuration,
  LONG_CAMPAIGN_WARNING,
} from "@/lib/event-copy"
import { DateTimeField } from "@/components/shared/DateTimeField"
import {
} from "./InstagramMediaPicker"
import type { SessionType } from "@/lib/event-kind"
import type { CreateEventPayload } from "@/types/event.types"

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

/** Fim padrão: 24h à frente, às 23h59 — o formato que o lojista digitaria. */
function defaultEndsAt(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(23, 59, 0, 0)
  return d.toISOString()
}

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
  const { data: store } = useStore()
  const storeDefaults = store?.cartSettings
  const [internalOpen, setInternalOpen] = useState(false)
  const [extrasOpen, setExtrasOpen] = useState(false)
  const isControlled = open !== undefined
  const sheetOpen = isControlled ? open : internalOpen
  const handleOpenChange = (next: boolean) => {
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
    // Padrão de 24h à frente: endsAt é obrigatório no backend, e abrir o
    // formulário vazio num campo obrigatório é o caminho mais curto para o
    // lojista levar 422 sem entender por quê.
    endsAt: defaultEndsAt(),
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

  // Reabrir o Sheet tem de reabrir limpo: o mesmo componente serve o card
  // Reabrir tem de reabrir limpo — e com os padrões da loja já dentro. O
  // `storeDefaults` entra nas dependências porque a loja chega por rede: sem
  // ele, abrir o formulário antes da resposta deixaria os campos vazios para
  // sempre naquela sessão.
  useEffect(() => {
    if (!sheetOpen) return
    form.reset(initialValues())
    setExtrasOpen(false)
    // `form` é estável entre renders do react-hook-form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetOpen, initialSessionType, storeDefaults])

  const watchStartsAt = form.watch("startsAt")
  const watchEndsAt = form.watch("endsAt")

  // Só avisa sobre o teto quando o evento passa de 24h — numa live de duas
  // horas "máximo 2" é trava anti-abuso saudável, e o aviso viraria ruído.
  const longCampaignDuration = campaignDuration(watchStartsAt, watchEndsAt)
  const isPending = createEvent.isPending

  async function onSubmit(data: CreateEventFormData) {
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
        toast.success("Evento criado!", {
          description:
            "Abra o evento e use a aba Sessões para adicionar as transmissões — live, post, reel ou story.",
        })
        form.reset()
        handleOpenChange(false)
        onSuccess?.()
      },
      onError: (error) => {
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
      <SheetContent className="flex w-[400px] flex-col gap-0 p-0 sm:w-[480px] sm:max-w-[480px]">
        <SheetHeader className="px-6 pb-4 pt-6">
          <SheetTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-primary" />
            Novo evento
          </SheetTitle>
          <SheetDescription className="leading-relaxed">
            Nome, quando abre, quando fecha e as regras comerciais. As transmissões —
            live, post, reel ou story — você adiciona depois, quantas quiser, enquanto
            o evento estiver aberto.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          {/* min-h-0 no filho que rola: sem ele o item flex adota a altura do
              conteúdo em vez de encolher, e o overflow-y-auto nunca dispara. */}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 pb-6">
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
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startsAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{EVENT_COPY.startsAt.label}</FormLabel>
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
                      <FormLabel>
                        {EVENT_COPY.endsAt.label} <span className="text-destructive">*</span>
                      </FormLabel>
                      <DateTimeField
                        value={field.value}
                        onChange={(iso) => field.onChange(iso ?? "")}
                        clearable={false}
                        defaultHour={23}
                        defaultMinute={59}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                      <InheritableNumberField
                        value={field.value}
                        onChange={field.onChange}
                        min={15}
                        unit={"minutos"}
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
                      <InheritableNumberField
                        value={field.value}
                        onChange={field.onChange}
                        min={5} max={240}
                        unit={"minutos"}
                      />
                    </FormControl>
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
            {/* Fora da área que rola: os botões ficam sempre à vista. */}
            <div className="flex shrink-0 justify-end gap-3 border-t bg-background px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Criando..." : "Criar evento"}
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

/**
 * Cabeçalho de seção do formulário.
 *
 * Substitui o padrão antigo — um `Separator` com o texto flutuando centralizado
 * por cima, posicionado com `absolute` e `translate`. Aquilo colocava o rótulo
 * no MEIO da linha, longe dos campos que ele governa, e obrigava um fundo opaco
 * para "furar" a régua. O olho lia uma divisória decorada, não um grupo.
 *
 * Aqui o rótulo é um cabeçalho alinhado à esquerda, na mesma coluna dos campos,
 * com a hierarquia feita por peso e espaço em vez de posição — que é o que
 * agrupa de fato.
 */
function FormSection({
  title,
  hint,
  description,
  children,
}: {
  title: string
  hint?: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          {title}
          {hint && <FieldHint text={hint} />}
        </h3>
        {description && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}
