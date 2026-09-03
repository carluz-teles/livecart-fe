"use client"

import { use, useMemo, useState } from "react"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Hourglass,
  MessageCircle,
  Package,
  PackageCheck,
  RotateCcw,
  SearchX,
  Send,
  ShoppingCart,
  TimerOff,
  Truck,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  formatAttemptCount,
  formatDateTime,
  formatRelativeTime,
} from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  fraseDoDesfecho,
  type TomDoDesfecho,
} from "@/lib/desfecho-do-comentario"
import type { OrderComment, OrderDetail } from "@/types/cart.types"
import type { ShipmentStatus } from "@/types/shipment.types"
import { OrderDetailContext } from "./OrderDetailContext"

type EventCategory = "customer" | "payment" | "logistics" | "system"
type EventKind =
  | "created"
  | "comment"
  | "comment_cart"
  | "comment_wait"
  | "comment_miss"
  | "dm_sent"
  | "dm_failed"
  | "dm_skipped"
  | "waitlist_joined"
  | "waitlist_released"
  | "waitlist_fulfilled"
  | "waitlist_lost"
  | "deadline"
  | "expired"
  | "paid"
  | "erp_done"
  | "shipment_created"
  | "shipment_event"
  | "delivered"
  | "issue"
  | "cancel_reverted"

interface TimelineEvent {
  category: EventCategory
  kind: EventKind
  date: string
  title: string
  description?: string
  /** Texto verbatim (comentário da cliente ou DM enviada) — vira bloco citado. */
  message?: string
}

interface FilterChip {
  id: EventCategory | "all"
  label: string
}

const FILTERS: FilterChip[] = [
  { id: "all", label: "Tudo" },
  { id: "customer", label: "Cliente" },
  { id: "payment", label: "Pagamento" },
  { id: "logistics", label: "Logística" },
  { id: "system", label: "Sistema" },
]

const ICON: Record<EventKind, React.ComponentType<{ className?: string }>> = {
  created: Activity,
  comment: MessageCircle,
  comment_cart: ShoppingCart,
  comment_wait: Hourglass,
  comment_miss: SearchX,
  dm_sent: Send,
  dm_failed: Send,
  dm_skipped: Send,
  waitlist_joined: Hourglass,
  waitlist_released: PackageCheck,
  waitlist_fulfilled: PackageCheck,
  waitlist_lost: TimerOff,
  deadline: Clock,
  expired: TimerOff,
  paid: CreditCard,
  erp_done: CheckCircle2,
  shipment_created: Package,
  shipment_event: Truck,
  delivered: CheckCircle2,
  issue: AlertTriangle,
  cancel_reverted: RotateCcw,
}

const SUCCESS_TONE =
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
const WAIT_TONE =
  "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
const ISSUE_TONE = "bg-destructive/15 text-destructive"
const NEUTRAL_TONE = "bg-muted text-muted-foreground"

// Quatro tons com significado fixo: verde = deu certo, âmbar = esperando,
// vermelho = deu errado, cinza = registro. A árvore inteira se lê pelas cores.
const TONE: Record<EventKind, string> = {
  created: NEUTRAL_TONE,
  comment: NEUTRAL_TONE,
  comment_cart: SUCCESS_TONE,
  comment_wait: WAIT_TONE,
  comment_miss: ISSUE_TONE,
  dm_sent: SUCCESS_TONE,
  dm_failed: ISSUE_TONE,
  dm_skipped: NEUTRAL_TONE,
  waitlist_joined: WAIT_TONE,
  waitlist_released: SUCCESS_TONE,
  waitlist_fulfilled: SUCCESS_TONE,
  waitlist_lost: ISSUE_TONE,
  deadline: WAIT_TONE,
  expired: ISSUE_TONE,
  paid: SUCCESS_TONE,
  erp_done: SUCCESS_TONE,
  delivered: SUCCESS_TONE,
  shipment_created: NEUTRAL_TONE,
  shipment_event: NEUTRAL_TONE,
  issue: ISSUE_TONE,
  cancel_reverted: ISSUE_TONE,
}

const SHIPMENT_ISSUE_STATUSES: ShipmentStatus[] = [
  "issue",
  "delivery_issue",
  "delivery_blocked",
  "shipment_blocked",
  "fiscal_issue",
  "damaged",
  "refused",
  "not_delivered",
]

const DM_LABEL: Record<string, string> = {
  checkout_immediate: "Link de pagamento por DM",
  item_added: "DM de novo item",
  checkout_reminder: "Lembrete de prazo por DM",
  cart_recovery: "DM de recuperação de carrinho",
}

// O RESUMO QUE APARECE SEM CLIQUE.
//
// O cartão fechado mostrava só o ÚLTIMO evento, e a linha do tempo inteira
// ficava atrás de "Ver eventos". Quem abre um pedido não descobria que houve
// uma fala sem atender — a informação existia e ninguém a encontrava.
//
// Três números bastam, e o terceiro é o que justifica a tira: fala que não
// virou nada é venda perdida, e ela precisa saltar antes do clique.
function resumirFalas(events: TimelineEvent[]) {
  let virouItem = 0
  let naFila = 0
  let perdidas = 0
  let total = 0
  for (const e of events) {
    switch (e.kind) {
      case "comment":
        total++
        break
      case "comment_cart":
        total++
        virouItem++
        break
      case "comment_wait":
        total++
        naFila++
        break
      case "comment_miss":
        total++
        perdidas++
        break
    }
  }
  return { total, virouItem, naFila, perdidas }
}

// Número + ícone + palavra. O tom é reforço, nunca o único canal — a tira tem
// de significar a mesma coisa para quem não separa verde de vermelho.
function ResumoDeFala({
  tom,
  Icone,
  n,
  rotulo,
  unico,
}: {
  tom: string
  Icone: React.ComponentType<{ className?: string }>
  n: number
  rotulo: string
  unico: string
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={cn("flex h-4 w-4 items-center justify-center rounded-full", tom)}
        aria-hidden
      >
        <Icone className="h-2.5 w-2.5" />
      </span>
      <span className="text-muted-foreground">
        {n} {n === 1 ? unico : rotulo}
      </span>
    </span>
  )
}

// O QUE ACONTECEU COM CADA FALA DA COMPRADORA.
//
// A linha do tempo mostrava "@fulana comentou" e o texto — e três desfechos
// muito diferentes ficavam idênticos:
//
//   "2074"       virou item                (venda)
//   "2096"       entrou na fila            (venda adiada)
//   "quero 9999" não casou com produto     (VENDA PERDIDA)
//
// A terceira é a que o lojista precisa ver, e era a mais invisível das três.
// O motor da live sempre soube o desfecho; ele só nunca tinha chegado à tela.
//
// O desfecho vai por TRÊS canais — tom, ícone e frase. Cor sozinha não serve:
// quem não distingue verde de vermelho leria a mesma coisa nos três casos, e é
// justamente a diferença entre eles que dá valor a esta seção.
// A tradução do desfecho vive em lib/desfecho-do-comentario, compartilhada com
// a lista de comentários do evento. Eram duas cópias da mesma tabela por umas
// horas — e divergiriam no primeiro desfecho novo que o motor aprendesse.
//
// Aqui ela é adaptada ao vocabulário da linha do tempo: o tom vira um EventKind
// (o mapa ICON/TONE já existente faz o resto), em vez de uma classe solta.
const KIND_POR_TOM: Record<TomDoDesfecho, EventKind> = {
  ok: "comment_cart",
  espera: "comment_wait",
  perdida: "comment_miss",
  neutro: "comment",
}

function descreverComentario(
  c: OrderComment,
  handle: string,
): { kind: EventKind; title: string; description?: string } {
  const f = fraseDoDesfecho(handle, c)
  return { kind: KIND_POR_TOM[f.tom], title: f.titulo, description: f.nota }
}

// A árvore de decisões do pedido (20/08/2026): tudo que o LiveCart fez com
// este carrinho, em ordem, com desfecho — comentário, DM (enviada OU não, e o
// porquê), fila (entrou, liberou, venceu), prazo, pagamento, ERP, envio. O
// lojista lia "comentário → pedido criado" e o resto do fluxo era invisível.
function buildEvents(order: OrderDetail): TimelineEvent[] {
  const out: TimelineEvent[] = []

  out.push({
    category: "customer",
    kind: "created",
    date: order.createdAt,
    title: "Pedido criado",
    description: (order.eventTitle || order.liveTitle)
      ? `A partir do evento "${order.eventTitle || order.liveTitle}"`
      : undefined,
  })

  for (const c of order.comments ?? []) {
    const d = descreverComentario(c, order.customerHandle)
    out.push({
      category: "customer",
      kind: d.kind,
      date: c.createdAt,
      title: d.title,
      description: d.description,
      message: c.text,
    })
  }

  // DMs automáticas — o lado "o que o LiveCart respondeu" da conversa, que
  // nunca aparecia. Enviada = verde com o texto verbatim; falha = vermelho com
  // o motivo; pulada/cooldown = cinza, para o lojista saber que NÃO houve
  // mensagem e por quê.
  for (const n of order.notifications ?? []) {
    const label = DM_LABEL[n.type] ?? "DM automática"
    if (n.status === "sent") {
      out.push({
        category: "customer",
        kind: "dm_sent",
        date: n.sentAt ?? n.createdAt,
        title: `${label} enviada`,
        message: n.message,
      })
    } else if (n.status === "failed") {
      out.push({
        category: "customer",
        kind: "dm_failed",
        date: n.createdAt,
        title: `${label} falhou`,
        description: n.error || "O Instagram recusou o envio.",
      })
    } else {
      out.push({
        category: "customer",
        kind: "dm_skipped",
        date: n.createdAt,
        title: `${label} não enviada`,
        description:
          n.status === "cooldown"
            ? "Aguardando o intervalo mínimo entre mensagens."
            : n.status === "pending"
              ? "Envio ainda na fila."
              : "Envio pulado pela configuração da loja.",
      })
    }
  }

  // Jornada da fila — inclusive desfechos que a seção "Aguardando estoque"
  // não mostra mais (venceu, atendida, saiu).
  for (const w of order.waitlistJourney ?? []) {
    out.push({
      category: "customer",
      kind: "waitlist_joined",
      date: w.createdAt,
      title: `Entrou na fila: ${w.productName} ×${w.quantity}`,
      description: "Sem estoque na hora — a vez dela fica guardada por ordem de chegada.",
    })
    if (w.notifiedAt) {
      out.push({
        category: "customer",
        kind: "waitlist_released",
        date: w.notifiedAt,
        title: `Estoque liberado: ${w.productName}`,
        description: w.expiresAt
          ? `Prazo extra para pagar até ${formatDateTime(w.expiresAt)}.`
          : "O item voltou para o carrinho dela com prazo extra.",
      })
    }
    if (w.status === "fulfilled") {
      out.push({
        category: "customer",
        kind: "waitlist_fulfilled",
        date: w.fulfilledAt ?? w.notifiedAt ?? w.createdAt,
        title: `Item da fila garantido: ${w.productName}`,
        description: "A cliente finalizou dentro do prazo extra.",
      })
    } else if (w.status === "expired") {
      out.push({
        category: "customer",
        kind: "waitlist_lost",
        date: w.expiresAt ?? w.cancelledAt ?? w.createdAt,
        title: `Liberação venceu: ${w.productName}`,
        description:
          "O prazo extra terminou sem pagamento — a unidade seguiu para o próximo da fila ou voltou ao estoque.",
      })
    } else if (w.cancelledAt) {
      out.push({
        category: "customer",
        kind: "dm_skipped",
        date: w.cancelledAt,
        title: `Saiu da fila: ${w.productName}`,
      })
    }
  }

  // O prazo do pedido, como nó da linha do tempo: enquanto corre, mostra até
  // quando; vencido com pedido expirado, mostra ONDE o pedido morreu.
  if (order.expiresAt && !order.paidAt) {
    if (order.status === "expired") {
      out.push({
        category: "system",
        kind: "expired",
        date: order.expiresAt,
        title: "Pedido expirado — o prazo venceu",
        description:
          "O estoque reservado voltou para a loja e a fila foi avisada.",
      })
    } else if (order.status !== "cancelled") {
      const vencido = new Date(order.expiresAt).getTime() < Date.now()
      out.push({
        category: "system",
        kind: "deadline",
        date: order.expiresAt,
        title: vencido
          ? "Prazo para pagar venceu — aguardando desfecho"
          : "Prazo para pagar termina aqui",
        description: vencido
          ? "A expiração roda em instantes (ou aguarda a fila do pedido)."
          : `A cliente tem até ${formatDateTime(order.expiresAt)} para finalizar.`,
      })
    }
  }

  if (order.paidAt) {
    out.push({
      category: "payment",
      kind: "paid",
      date: order.paidAt,
      title: "Pagamento confirmado",
      description: order.shipping
        ? `${order.shipping.serviceName} contratado`
        : undefined,
    })
  }

  // Cancelamento revertido pelo pagamento: a loja cancelou e o comprador pagou
  // assim mesmo (antes ou durante o cancelamento). Não há nada a corrigir — o
  // pedido seguiu o fluxo normal; a entrada existe para o lojista entender por
  // que um pedido que ele cancelou está pago.
  if (order.cancellationRevertedAt) {
    out.push({
      category: "payment",
      kind: "cancel_reverted",
      date: order.cancellationRevertedAt,
      title: "Cancelamento revertido — o comprador pagou",
      description:
        "Este pedido foi cancelado, mas o pagamento entrou assim mesmo e o pedido voltou a valer. O estoque foi retomado e o pedido seguiu para o ERP normalmente. Para devolver o dinheiro, faça o estorno pelo provedor de pagamento.",
    })
  }

  // ERP finalisation — read the authoritative lifecycle column instead of
  // a "paid more than 5 min ago" heuristic. Done shows as a positive event
  // (Pedido enviado para o ERP); failed shows as an issue with the verbatim
  // ERP message. We anchor the timestamp to lastAttemptAt so the entry
  // sits where it actually happened in the timeline (sometimes hours after
  // payment, sometimes after a manual retry).
  if (order.erpFinalisation) {
    const finalisation = order.erpFinalisation
    const at =
      finalisation.lastAttemptAt ??
      order.paidAt ??
      order.createdAt
    const attemptsSuffix =
      finalisation.attemptsCount > 1
        ? ` (após ${formatAttemptCount(finalisation.attemptsCount)})`
        : ""
    if (finalisation.status === "done") {
      out.push({
        category: "system",
        kind: "erp_done",
        date: at,
        title: `Pedido enviado para o ERP${attemptsSuffix}`,
        description:
          "Tudo certo — o pedido foi criado no ERP e o estoque foi baixado.",
      })
    } else if (finalisation.status === "failed") {
      out.push({
        category: "system",
        kind: "issue",
        date: at,
        title: "Falha ao enviar pedido para o ERP",
        description:
          finalisation.lastError?.trim() ||
          "Tente reenviar pelo botão acima ou contate o suporte.",
      })
    }
  }

  if (order.shipment) {
    out.push({
      category: "logistics",
      kind: "shipment_created",
      date: order.shipment.createdAt,
      title: "Envio criado",
      description: order.shipment.trackingCode
        ? `Código ${order.shipment.trackingCode}`
        : order.shipment.provider,
    })
    for (const e of order.shipment.events ?? []) {
      const isDelivered = e.status === "delivered"
      const isIssue = SHIPMENT_ISSUE_STATUSES.includes(e.status)
      out.push({
        category: isIssue ? "system" : "logistics",
        kind: isDelivered
          ? "delivered"
          : isIssue
            ? "issue"
            : "shipment_event",
        date: e.eventAt,
        title: e.rawName || e.status,
        description: e.observation || undefined,
      })
    }
  }

  out.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  return out
}

export function OrderDetailHistory() {
  const ctx = use(OrderDetailContext)
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<EventCategory | "all">("all")
  const order = ctx?.state.order

  const events = useMemo(() => (order ? buildEvents(order) : []), [order])

  const counts = useMemo(() => {
    const acc: Record<EventCategory | "all", number> = {
      all: events.length,
      customer: 0,
      payment: 0,
      logistics: 0,
      system: 0,
    }
    for (const e of events) acc[e.category]++
    return acc
  }, [events])

  if (!ctx || !order) return null

  const lastEvent = events[events.length - 1]
  const falas = resumirFalas(events)
  const hasAlert = events.some((e) => e.kind === "issue")
  const filteredEvents =
    filter === "all" ? events : events.filter((e) => e.category === filter)

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Histórico
              {hasAlert && (
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-destructive"
                  aria-label="Há eventos de alerta"
                  role="img"
                />
              )}
            </CardTitle>
            <Badge variant="outline" className="font-normal">
              {events.length}{" "}
              {events.length === 1 ? "evento" : "eventos"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-3">
          {lastEvent ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                <span className="font-medium">{lastEvent.title}</span>
                {(lastEvent.description || lastEvent.message) ? (
                  <span className="text-muted-foreground">
                    {" · "}
                    {lastEvent.description || lastEvent.message}
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(lastEvent.date)}
              </p>
              {falas.total > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="text-muted-foreground">
                    {falas.total} {falas.total === 1 ? "fala" : "falas"} na live
                  </span>
                  {falas.virouItem > 0 && (
                    <ResumoDeFala
                      tom={SUCCESS_TONE}
                      Icone={ShoppingCart}
                      n={falas.virouItem}
                      rotulo="viraram item"
                      unico="virou item"
                    />
                  )}
                  {falas.naFila > 0 && (
                    <ResumoDeFala
                      tom={WAIT_TONE}
                      Icone={Hourglass}
                      n={falas.naFila}
                      rotulo="na fila"
                      unico="na fila"
                    />
                  )}
                  {falas.perdidas > 0 && (
                    <ResumoDeFala
                      tom={ISSUE_TONE}
                      Icone={SearchX}
                      n={falas.perdidas}
                      rotulo="sem atender"
                      unico="sem atender"
                    />
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="flex-1 text-sm text-muted-foreground">
              Nenhum evento registrado.
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setOpen(true)}
          >
            Ver eventos
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="text-base">
              Histórico do pedido #{order.shortId}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Linha do tempo unificada — comentários do cliente, pagamento,
              logística e alertas do sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-1.5 border-b px-6 py-3">
            {FILTERS.map((f) => {
              const isActive = filter === f.id
              const count = counts[f.id]
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground",
                  )}
                >
                  {f.label}
                  <span
                    className={cn(
                      "tabular-nums",
                      isActive ? "text-primary" : "text-muted-foreground/70",
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
            {filteredEvents.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum evento nesta categoria.
              </p>
            ) : (
              <ol className="relative space-y-4 border-l border-border pl-6">
                {filteredEvents.map((entry, idx) => {
                  const Icon = ICON[entry.kind]
                  return (
                    <li key={`${entry.kind}-${idx}`} className="relative">
                      <span
                        className={cn(
                          "absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background",
                          TONE[entry.kind],
                        )}
                        aria-hidden
                      >
                        <Icon className="h-3 w-3" />
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-tight">
                          {entry.title}
                        </p>
                        {entry.description && (
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {entry.description}
                          </p>
                        )}
                        {entry.message && (
                          <blockquote className="whitespace-pre-line rounded-md border-l-2 border-muted-foreground/30 bg-muted/40 px-3 py-2 text-xs leading-relaxed text-foreground/90">
                            {entry.message}
                          </blockquote>
                        )}
                        <p className="text-xs text-muted-foreground/80">
                          {formatDateTime(entry.date)}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
