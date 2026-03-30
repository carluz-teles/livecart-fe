"use client"

import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  MessageCircle,
  ShoppingCart,
  CheckCircle,
  DollarSign,
  TrendingUp,
  User,
  RefreshCw,
  Radio,
  Play,
  Clock,
  ChevronDown,
} from "lucide-react"

import { formatCurrency, formatRelativeTime, formatDate, formatDateTime } from "@/lib/format"
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  EVENT_STATUS_CONFIG,
  LIVE_STATUS_CONFIG,
  PLATFORM_LABELS,
  getStatusConfig,
  type EventStatusConfig,
  type LiveStatusConfig,
} from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useEvent, useEventDetailStats, useEventCarts } from "@/hooks/event"
import type { EventCart, EventSession, Platform } from "@/types/event.types"

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()

  const { data: event, isLoading: eventLoading, error: eventError } = useEvent(id)
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useEventDetailStats(id)
  const { data: carts, isLoading: cartsLoading, refetch: refetchCarts } = useEventCarts(id)

  const handleRefresh = () => {
    refetchStats()
    refetchCarts()
  }

  if (eventError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-destructive">Erro ao carregar evento</p>
        <Button variant="outline" onClick={() => router.push("/events")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para eventos
        </Button>
      </div>
    )
  }

  const statusConfig = event
    ? (getStatusConfig(EVENT_STATUS_CONFIG, event.status, "ended") as EventStatusConfig)
    : null

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/events">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              {eventLoading ? (
                <Skeleton className="h-7 w-48" />
              ) : (
                <>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {event?.title || "Sem titulo"}
                  </h1>
                  {statusConfig && (
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  )}
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Detalhes do evento e carrinhos
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comentarios</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalComments ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">total de comentarios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carrinhos Abertos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.openCarts ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Checkout</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.checkoutCarts ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Projetada</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                formatCurrency(stats?.projectedRevenue ?? 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">carrinhos abertos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Checkout</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                formatCurrency(stats?.checkoutRevenue ?? 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">em checkout</p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Section */}
      <Card>
        <Collapsible defaultOpen>
          <CardHeader className="pb-3">
            <CollapsibleTrigger className="flex w-full items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-4 w-4" />
                  Sessoes
                </CardTitle>
                <CardDescription>
                  {eventLoading ? (
                    <Skeleton className="h-4 w-32 mt-1" />
                  ) : (
                    `${event?.sessions?.length ?? 0} sessao(oes) de transmissao`
                  )}
                </CardDescription>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {eventLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : !event?.sessions || event.sessions.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhuma sessao encontrada
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {event.sessions.map((session, index) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      index={index + 1}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Carts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Carrinhos</CardTitle>
          <CardDescription>
            Lista de todos os carrinhos criados neste evento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-center">Itens</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : !carts || carts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhum carrinho encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  carts.map((cart) => <CartRow key={cart.id} cart={cart} />)
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CartRow({ cart }: { cart: EventCart }) {
  const statusConfig = getStatusConfig(ORDER_STATUS_CONFIG, cart.status, "pending")
  const paymentConfig = cart.paymentStatus
    ? getStatusConfig(PAYMENT_STATUS_CONFIG, cart.paymentStatus, "pending")
    : null

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">@{cart.platformHandle}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
      </TableCell>
      <TableCell>
        {paymentConfig ? (
          <Badge variant={paymentConfig.variant}>{paymentConfig.label}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-center">{cart.totalItems}</TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(cart.totalValue)}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span>{formatRelativeTime(cart.createdAt)}</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(cart.createdAt)}
          </span>
        </div>
      </TableCell>
    </TableRow>
  )
}

// Session status icons
const SESSION_STATUS_ICONS = {
  active: Play,
  live: Play,
  ended: CheckCircle,
  scheduled: Clock,
  cancelled: Clock,
} as const

function SessionCard({ session, index }: { session: EventSession; index: number }) {
  const statusConfig = getStatusConfig(LIVE_STATUS_CONFIG, session.status, "ended") as LiveStatusConfig
  const StatusIcon = SESSION_STATUS_ICONS[session.status as keyof typeof SESSION_STATUS_ICONS] || Clock
  const isActive = session.status === "active" || session.status === "live"

  return (
    <div className={`rounded-lg border p-4 ${isActive ? "border-primary bg-primary/5" : ""}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isActive ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            <span className="text-sm font-medium">{index}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Sessao {index}</span>
              <Badge variant={statusConfig.variant} className="gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {session.totalComments} comentarios
              </span>
              {session.startedAt && (
                <span className="flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  Inicio: {formatDateTime(session.startedAt)}
                </span>
              )}
              {session.endedAt && (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Fim: {formatDateTime(session.endedAt)}
                </span>
              )}
            </div>
            {/* Platforms */}
            {session.platforms && session.platforms.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {session.platforms.map((platform) => (
                  <Badge key={platform.id} variant="outline" className="text-xs">
                    {PLATFORM_LABELS[platform.platform as Platform] || platform.platform}
                    <span className="ml-1 text-muted-foreground">
                      #{platform.platformLiveId.slice(-6)}
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
