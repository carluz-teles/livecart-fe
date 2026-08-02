"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Loader2, Instagram, CalendarRange } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createEventSchema, type CreateEventFormData } from "@/schemas/event.schema"
import { useCreateEvent } from "@/hooks/event"
import { useInstagramLives } from "@/hooks/integration"
import { FieldHint } from "@/components/shared/FieldHint"
import {
  EVENT_COPY,
  CART_EXPIRATION_OPTIONS,
  MAX_QUANTITY_OPTIONS,
  WAITLIST_TTL_OPTIONS,
  SESSION_COPY,
  SESSION_TYPE_OPTIONS,
  sessionTypeHelp,
  isLongCampaign,
  campaignDuration,
  LONG_CAMPAIGN_WARNING,
} from "@/lib/event-copy"
import { DateTimeField } from "@/components/shared/DateTimeField"
import {
  InstagramMediaPicker,
  sessionTypeFromMediaType,
} from "./InstagramMediaPicker"
import type { SessionType } from "@/lib/event-kind"
import type { CreateEventPayload } from "@/types/event.types"
import type { InstagramMediaPost } from "@/types"

/** Valor do select de mídia quando o lojista escolhe não vincular agora. */
const LINK_LATER = "__later__"

interface EventFormProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
  trigger?: React.ReactNode
  /** Tipo da PRIMEIRA transmissão sugerido pela porta de entrada. O atalho
   *  "Live ao vivo" abre já em `live`; a criação de campanha abre igual, mas o
   *  lojista troca sem sair do formulário. */
  initialSessionType?: SessionType
}

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
  const { data: livesData, isLoading: livesLoading } = useInstagramLives()
  const lives = livesData?.data ?? []

  const [internalOpen, setInternalOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<InstagramMediaPost | null>(null)
  const isControlled = open !== undefined
  const sheetOpen = isControlled ? open : internalOpen
  const handleOpenChange = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      // `type` é o tipo da PRIMEIRA SESSÃO. Era um radio "Live Única /
      // Multi-sessão" que não mudava um byte no banco (os dois caíam em
      // `live`) e era o último lugar da UI mostrando ao lojista um vocabulário
      // que a 000122 apagou.
      type: initialSessionType,
      platform: undefined,
      platformLiveId: "",
      startsAt: null,
      // Padrão de 24h à frente: endsAt é obrigatório no backend, e abrir o
      // formulário vazio num campo obrigatório é o caminho mais curto para o
      // lojista levar 422 sem entender por quê.
      endsAt: defaultEndsAt(),
      description: null,
      closeCartOnEventEnd: true,
      cartExpirationMinutes: null,
      cartMaxQuantityPerItem: null,
      waitlistNotifiedTtlMinutes: null,
      freeShipping: false,
      pixDiscountPercent: 0,
    },
  })

  // Reabrir o Sheet tem de reabrir limpo: o mesmo componente serve o card
  // "Criar uma campanha" e o atalho "Live ao vivo", e o tipo sugerido muda
  // entre os dois.
  useEffect(() => {
    if (!sheetOpen) return
    setSelectedMedia(null)
    form.reset({
      title: "",
      type: initialSessionType,
      platform: undefined,
      platformLiveId: "",
      startsAt: null,
      endsAt: defaultEndsAt(),
      description: null,
      closeCartOnEventEnd: true,
      cartExpirationMinutes: null,
      cartMaxQuantityPerItem: null,
      waitlistNotifiedTtlMinutes: null,
      freeShipping: false,
      pixDiscountPercent: 0,
    })
    // `form` é estável entre renders do react-hook-form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetOpen, initialSessionType])

  const platformLiveId = form.watch("platformLiveId")
  const sessionType = form.watch("type") ?? "live"
  const watchStartsAt = form.watch("startsAt")
  const watchEndsAt = form.watch("endsAt")

  // Trocar o tipo invalida a mídia escolhida: a lista de lives no ar e a grade
  // de publicações não são intercambiáveis, e vincular a mídia errada é
  // silencioso (o comentário simplesmente não vira carrinho).
  const handleSessionTypeChange = (next: string) => {
    form.setValue("type", next as SessionType)
    form.setValue("platformLiveId", "")
    setSelectedMedia(null)
  }

  const handleMediaSelect = (post: InstagramMediaPost) => {
    setSelectedMedia(post)
    form.setValue("platformLiveId", post.id)
    // O card da grade sempre soube distinguir Reel de post; o evento é que
    // nascia sempre 'post'. Deixar a mídia corrigir o tipo é o que impede duas
    // publicações idênticas de terem rótulos diferentes.
    form.setValue("type", sessionTypeFromMediaType(post.media_type))
  }
  // Só avisa sobre o teto quando a campanha passa de 24h — numa live de duas
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
      // Metadados só existem quando a mídia veio da grade. Sem eles a MESMA
      // publicação ficava com permalink e capa quando entrava pelo caminho de
      // evento-de-post e sem nada quando entrava como primeira transmissão de
      // uma campanha — a captura funcionava nos dois, só a tela empobrecia
      // conforme a porta.
      mediaPermalink: selectedMedia?.permalink,
      mediaThumbnailUrl: selectedMedia?.thumbnail_url || selectedMedia?.media_url,
      mediaCaption: selectedMedia?.caption,
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
        toast.success("Campanha criada!", {
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
      <SheetContent className="w-[400px] sm:w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-primary" />
            Novo evento
          </SheetTitle>
          <SheetDescription>
            Defina a campanha: nome, quando abre, quando fecha e as regras comerciais. As
            transmissões você adiciona no passo seguinte — e pode adicionar mais a
            qualquer momento enquanto o evento estiver aberto.
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
                    <FieldHint text={EVENT_COPY.title.hint} />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={EVENT_COPY.title.placeholder} {...field} />
                  </FormControl>
                  <FormDescription>
                    Ex: &quot;Semana Black&quot; ou &quot;Coleção Verão&quot; — e não
                    &quot;Live de segunda&quot;, que é nome de sessão.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="relative py-2">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                Primeira transmissão
              </span>
            </div>

            {/* Toda campanha nasce com uma transmissão — é onde moram a lista
                de produtos e o modo live. O que deixou de ser obrigatório é a
                MÍDIA: dá para marcar a Semana Black hoje e pendurar a live de
                segunda quando ela existir. */}
            <p className="text-sm text-muted-foreground">
              A campanha começa com uma transmissão, e você adiciona as outras pela aba
              Sessões — live, post, reel ou story, todas somando no mesmo carrinho de cada
              cliente.
            </p>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    {SESSION_COPY.type.label}
                    <FieldHint text={SESSION_COPY.type.hint} />
                  </FormLabel>
                  <Select
                    onValueChange={handleSessionTypeChange}
                    value={field.value ?? "live"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SESSION_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>{sessionTypeHelp(field.value ?? "live")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Plataforma</Label>
              <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
                <Instagram className="h-5 w-5 text-pink-500" />
                <span className="text-sm font-medium">Instagram</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Apenas Instagram e suportado no momento
              </p>
            </div>

            {sessionType === "live" && (
              <FormField
                control={form.control}
                name="platformLiveId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      {SESSION_COPY.media.label}
                      <FieldHint text={SESSION_COPY.media.hint} />
                    </FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v === LINK_LATER ? "" : v)}
                      value={field.value || LINK_LATER}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={livesLoading ? "Carregando..." : "Selecione uma live"}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={LINK_LATER}>
                          {SESSION_COPY.media.later}
                        </SelectItem>
                        {lives.map((live) => {
                          const startTime = live.timestamp
                            ? format(new Date(live.timestamp), "HH:mm", { locale: ptBR })
                            : null
                          return (
                            <SelectItem key={live.id} value={live.id}>
                              Live @{live.username}
                              {startTime && ` (iniciada às ${startTime})`}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormDescription>{SESSION_COPY.media.help}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {sessionType !== "live" && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  {SESSION_COPY.media.label}
                  <FieldHint text={SESSION_COPY.media.hint} />
                </Label>
                <InstagramMediaPicker
                  enabled={sheetOpen}
                  selected={selectedMedia}
                  onSelect={handleMediaSelect}
                />
                <p className="text-sm text-muted-foreground">{SESSION_COPY.media.help}</p>
              </div>
            )}

            {/* Story não é opção aqui: ele só vira venda publicado PELO
                LiveCart, e o atalho que faz isso monta campanha e transmissão
                juntas. Oferecer a espécie neste menu criaria uma transmissão
                que nunca captura nada, e a falha é muda. */}
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-sm text-muted-foreground">{SESSION_COPY.storyElsewhere}</p>
            </div>

            {platformLiveId && sessionType === "live" && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Importante:</strong> Certifique-se de que a live esta ativa
                  antes de conectar. O sistema comecara a monitorar os comentarios
                  imediatamente apos a conexao.
                </p>
              </div>
            )}

            {!platformLiveId && (
              <p className="text-sm text-muted-foreground">
                {SESSION_COPY.noMedia.hintForm}
              </p>
            )}

            <div className="relative py-2">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                Janela da campanha
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              Quando a campanha abre e quando fecha. Fora dessa janela, comentários não
              viram carrinho — o comprador recebe um aviso automático em vez de ficar sem
              resposta.
            </p>

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
                  <FormDescription>{EVENT_COPY.startsAt.empty}</FormDescription>
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

            <div className="relative py-2">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                Configurações do carrinho
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              Estas regras valem para o carrinho da campanha inteira. Como o cliente tem um
              carrinho só, elas não se repetem por sessão.
            </p>

            <FormField
              control={form.control}
              name="closeCartOnEventEnd"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-1.5 text-sm font-medium">
                      Fechar o carrinho logo depois da campanha
                      <FieldHint text={EVENT_COPY.closeCartOnEventEnd.hint} />
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Ligado: o prazo abaixo começa a correr assim que a campanha fecha —
                      é o que gira estoque mais rápido. Desligado: o carrinho continua
                      aberto por um prazo bem maior. Os dois lados expiram; nada fica
                      eterno.
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

            <FormField
              control={form.control}
              name="freeShipping"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-1.5 text-sm font-medium">
                      {EVENT_COPY.freeShipping.label}
                      <FieldHint text={EVENT_COPY.freeShipping.hint} />
                    </FormLabel>
                    <FormDescription className="text-xs">
                      O cliente vê as opções de transportadora e prazo, mas paga
                      R$ 0,00 pelo frete. Você ainda vê o custo real no painel
                      do pedido.
                    </FormDescription>
                  </div>
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
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-0.5 flex-1">
                        <FormLabel className="flex items-center gap-1.5 text-sm font-medium">
                          {EVENT_COPY.pixDiscount.label}
                          <FieldHint text={EVENT_COPY.pixDiscount.hint} />
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Aplicado automaticamente no checkout quando o cliente
                          escolhe pagar com Pix. Independente de cupons.
                        </FormDescription>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? 10 : 0)
                        }
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
                              if (Number.isNaN(parsed)) {
                                field.onChange(0)
                              } else {
                                field.onChange(Math.min(100, Math.max(0, parsed)))
                              }
                            }}
                            className="w-24"
                            aria-label="Percentual de desconto no Pix"
                          />
                        </FormControl>
                        <span className="text-sm text-muted-foreground">%</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          O cliente verá o valor descontado no resumo do checkout.
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
              name="cartExpirationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    {EVENT_COPY.cartExpiration.label}
                    <FieldHint text={EVENT_COPY.cartExpiration.hint} />
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value === "inherit" ? null : parseInt(value, 10))
                    }}
                    value={field.value === null ? "inherit" : field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a expiracao" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CART_EXPIRATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>{EVENT_COPY.cartExpiration.help}</FormDescription>
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
                    <FieldHint text={EVENT_COPY.maxQuantity.hint} />
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value === "inherit" ? null : parseInt(value, 10))
                    }}
                    value={field.value === null ? "inherit" : field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a quantidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MAX_QUANTITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* O texto longo NÃO pode virar tooltip: é o contrato de
                      aceitação do risco R2 — o teto vale para a campanha
                      inteira, e é isso que bloqueia uma compra legítima na
                      sessão seguinte. */}
                  <FormDescription>{EVENT_COPY.maxQuantity.help}</FormDescription>
                  {field.value != null && longCampaignDuration && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        <strong>Atenção ao limite numa campanha de vários dias.</strong>{" "}
                        Você definiu {field.value} unidade(s) por produto, e esta campanha
                        dura {longCampaignDuration}. Esse limite vale para o período
                        inteiro: quem atingir o teto na primeira sessão fica bloqueado até
                        a campanha terminar.
                      </p>
                    </div>
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
                    <FieldHint text={EVENT_COPY.waitlistTtl.hint} />
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                    value={field.value == null ? "30" : String(field.value)}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas internas sobre o evento, produtos destaque, etc..."
                      className="resize-none min-h-[80px]"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Descrição interna para identificação (não visível aos clientes)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
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
                {isPending ? "Criando..." : "Criar campanha"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
