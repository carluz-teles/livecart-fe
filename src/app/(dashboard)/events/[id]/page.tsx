"use client"

import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  MessageCircle,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  User,
  RefreshCw,
  Package,
  Radio,
  Play,
  CheckCircle,
  Clock,
  ChevronDown,
  Plus,
  RotateCcw,
} from "lucide-react"

import { formatCurrency, formatDateTime } from "@/lib/format"
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
import { useEvent, useEventDetailStats, useEventCarts, useEventProducts } from "@/hooks/event"
import type { EventCart, EventProduct, EventSession, Platform } from "@/types/event.types"

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()

  const { data: event, isLoading: eventLoading, error: eventError } = useEvent(id)
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useEventDetailStats(id)
  const { data: carts, isLoading: cartsLoading, refetch: refetchCarts } = useEventCarts(id)
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useEventProducts(id)

  const handleRefresh = () => {
    refetchStats()
    refetchCarts()
    refetchProducts()
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
        {/* Card 1: Mensagens */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalComments ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">comentários detectados</p>
          </CardContent>
        </Card>

        {/* Card 2: Carrinhos (pagos + abertos) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carrinhos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">{stats?.paidCarts ?? 0}</span>
                  <span className="text-sm text-muted-foreground">pagos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{stats?.openCarts ?? 0}</span>
                  <span className="text-sm text-muted-foreground">abertos</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 3: Produtos Vendidos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Vendidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalProductsSold ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">unidades em carrinhos</p>
          </CardContent>
        </Card>

        {/* Card 4: Receita (confirmada + projetada) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats?.confirmedRevenue ?? 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(stats?.projectedRevenue ?? 0)} projetada
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 5: Conversão */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.totalComments && stats.totalComments > 0
                    ? (((stats.paidCarts ?? 0) + (stats.openCarts ?? 0)) / stats.totalComments * 100).toFixed(1)
                    : "0.0"}%
                </div>
                <p className="text-xs text-muted-foreground">mensagens → carrinhos</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sessions Section */}
      <Card>
        <Collapsible defaultOpen>
          <CardHeader className="pb-3">
            <CollapsibleTrigger className="flex w-full items-center justify-between [&[data-state=open]>svg.chevron]:rotate-180">
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
              <ChevronDown className="chevron h-4 w-4 text-muted-foreground transition-transform duration-200" />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {eventLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
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

      {/* Tables Side by Side */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Carts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Carrinhos
            </CardTitle>
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
                    <TableHead className="text-center">Itens</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : !carts || carts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
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

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produtos Vendidos
            </CardTitle>
            <CardDescription>
              Produtos adicionados aos carrinhos neste evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Keyword</TableHead>
                    <TableHead className="text-center">Qtd</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : !products || products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Nenhum produto vendido
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => <ProductRow key={product.id} product={product} />)
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function CartRow({ cart }: { cart: EventCart }) {
  const statusConfig = getStatusConfig(ORDER_STATUS_CONFIG, cart.status, "pending")
  const paymentConfig = cart.paymentStatus
    ? getStatusConfig(PAYMENT_STATUS_CONFIG, cart.paymentStatus, "pending")
    : null

  // Determine which badge to show: payment status if paid, otherwise cart status
  const displayConfig = paymentConfig && cart.paymentStatus === "paid" ? paymentConfig : statusConfig

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">@{cart.platformHandle}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={displayConfig.variant}>{displayConfig.label}</Badge>
      </TableCell>
      <TableCell className="text-center">{cart.totalItems}</TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(cart.totalValue)}
      </TableCell>
    </TableRow>
  )
}

function ProductRow({ product }: { product: EventProduct }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-8 w-8 rounded object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <span className="font-medium truncate max-w-[120px]" title={product.name}>
            {product.name}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
          {product.keyword}
        </code>
      </TableCell>
      <TableCell className="text-center">{product.totalQuantity}</TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(product.totalRevenue)}
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
          <div className="space-y-2">
            {/* Status and basic info */}
            <div className="flex items-center gap-2">
              <span className="font-medium">Sessao {index}</span>
              <Badge variant={statusConfig.variant} className="gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <MessageCircle className="h-3 w-3" />
                {session.totalComments} comentarios
              </span>
              <span className="flex items-center gap-1">
                <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                <span className="text-green-600 font-medium">{session.paidCarts}</span>
                <span className="text-muted-foreground">pagos</span>
                <span className="text-muted-foreground">·</span>
                <span>{session.totalCarts}</span>
                <span className="text-muted-foreground">total</span>
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                <span className="text-green-600 font-medium">{formatCurrency(session.paidRevenue)}</span>
                <span className="text-muted-foreground">confirmado</span>
              </span>
            </div>

            {/* Timestamps */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
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
              <div className="flex flex-wrap gap-2">
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

        {/* Actions */}
        <div className="flex gap-2">
          {!isActive && (
            <Button variant="outline" size="sm" className="gap-1">
              <RotateCcw className="h-3 w-3" />
              Reconectar
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="h-3 w-3" />
            Plataforma
          </Button>
        </div>
      </div>
    </div>
  )
}
