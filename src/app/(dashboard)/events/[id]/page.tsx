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
  RotateCcw,
  StopCircle,
  Plus,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEvent, useEventDetailStats, useEventCarts, useEventProducts, useAddPlatform, useEndEvent } from "@/hooks/event"
import type { EventCart, EventProduct, EventSession, Platform } from "@/types/event.types"
import { useState } from "react"

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()

  const { data: event, isLoading: eventLoading, error: eventError, refetch: refetchEvent } = useEvent(id)
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useEventDetailStats(id)
  const { data: carts, isLoading: cartsLoading, refetch: refetchCarts } = useEventCarts(id)
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useEventProducts(id)

  const [endEventOpen, setEndEventOpen] = useState(false)
  const [createSessionOpen, setCreateSessionOpen] = useState(false)
  const [newSessionPlatform, setNewSessionPlatform] = useState<Platform>("instagram")
  const [newSessionLiveId, setNewSessionLiveId] = useState("")

  const endEventMutation = useEndEvent()

  const handleRefresh = () => {
    refetchEvent()
    refetchStats()
    refetchCarts()
    refetchProducts()
  }

  const handleEndEvent = async () => {
    try {
      await endEventMutation.mutateAsync({
        id,
        payload: { autoSendCheckoutLinks: true },
      })
      setEndEventOpen(false)
    } catch (error) {
      console.error("Failed to end event:", error)
    }
  }

  const isEventActive = event?.status === "active"

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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>

          {isEventActive && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm">
                  Acoes
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setCreateSessionOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Sessao
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setEndEventOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <StopCircle className="mr-2 h-4 w-4" />
                  Finalizar Evento
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* End Event Confirmation Dialog */}
      <AlertDialog open={endEventOpen} onOpenChange={setEndEventOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar Evento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja finalizar este evento? Todas as sessoes ativas serao encerradas
              e os carrinhos serao finalizados. Links de checkout serao enviados automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={endEventMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndEvent}
              disabled={endEventMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {endEventMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Finalizando...
                </>
              ) : (
                "Finalizar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create New Session Dialog */}
      <Dialog open={createSessionOpen} onOpenChange={setCreateSessionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Sessao</DialogTitle>
            <DialogDescription>
              Crie uma nova sessao de transmissao para este evento. Os carrinhos existentes serao mantidos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-platform">Plataforma</Label>
              <Select
                value={newSessionPlatform}
                onValueChange={(value) => setNewSessionPlatform(value as Platform)}
              >
                <SelectTrigger id="new-platform">
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-liveId">
                ID da Live <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new-liveId"
                placeholder="Ex: 18043029837128493"
                value={newSessionLiveId}
                onChange={(e) => setNewSessionLiveId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Cole o ID ou URL da transmissao ao vivo
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateSessionOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                // TODO: Implement createSession mutation
                console.log("Create session:", { platform: newSessionPlatform, liveId: newSessionLiveId })
                setCreateSessionOpen(false)
                setNewSessionLiveId("")
              }}
              disabled={!newSessionLiveId.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Sessao
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                      eventId={event.id}
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

function SessionCard({ session, eventId, index }: { session: EventSession; eventId: string; index: number }) {
  const statusConfig = getStatusConfig(LIVE_STATUS_CONFIG, session.status, "ended") as LiveStatusConfig
  const StatusIcon = SESSION_STATUS_ICONS[session.status as keyof typeof SESSION_STATUS_ICONS] || Clock
  const isActive = session.status === "active" || session.status === "live"

  const [commentsOpen, setCommentsOpen] = useState(false)
  const [recoveryOpen, setRecoveryOpen] = useState(false)
  const [recoveryPlatform, setRecoveryPlatform] = useState<Platform>("instagram")
  const [recoveryLiveId, setRecoveryLiveId] = useState("")

  const addPlatformMutation = useAddPlatform()

  const handleCrashRecovery = async () => {
    if (!recoveryLiveId.trim()) return

    try {
      await addPlatformMutation.mutateAsync({
        eventId,
        payload: {
          platform: recoveryPlatform,
          platformLiveId: recoveryLiveId,
        },
      })
      setRecoveryOpen(false)
      setRecoveryLiveId("")
    } catch (error) {
      console.error("Failed to recover session:", error)
    }
  }

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
          <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <MessageCircle className="h-3 w-3" />
                Comentarios
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Comentarios da Sessao {index}
                </DialogTitle>
                <DialogDescription>
                  {session.totalComments} comentario(s) recebido(s)
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[50vh] overflow-y-auto">
                {!session.comments || session.comments.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Nenhum comentario registrado
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {session.comments.map((comment, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <div className="flex items-start gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {comment.handle.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-primary">
                              @{comment.handle}
                            </p>
                            <p className="text-sm text-foreground break-words">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={recoveryOpen} onOpenChange={setRecoveryOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
              >
                <RotateCcw className="h-3 w-3" />
                Crash Recovery
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crash Recovery</DialogTitle>
                <DialogDescription>
                  Se a live caiu, insira o novo ID da transmissao para reconectar a sessao.
                  Os carrinhos existentes serao mantidos.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Plataforma</Label>
                  <Select
                    value={recoveryPlatform}
                    onValueChange={(value) => setRecoveryPlatform(value as Platform)}
                  >
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="Selecione a plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="liveId">
                    ID da Nova Live <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="liveId"
                    placeholder="Ex: 18043029837128493"
                    value={recoveryLiveId}
                    onChange={(e) => setRecoveryLiveId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole o ID ou URL da nova transmissao ao vivo
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setRecoveryOpen(false)}
                  disabled={addPlatformMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCrashRecovery}
                  disabled={!recoveryLiveId.trim() || addPlatformMutation.isPending}
                >
                  {addPlatformMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Reconectando...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reconectar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
