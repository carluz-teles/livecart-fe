"use client"

import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ShoppingCart,
  RefreshCw,
  Package,
  Radio,
  ChevronDown,
  StopCircle,
  Plus,
  Clock,
} from "lucide-react"

import { formatCurrency, formatDateTime } from "@/lib/format"
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  EVENT_STATUS_CONFIG,
  getStatusConfig,
  type EventStatusConfig,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEvent, useEventDetailStats, useEventCarts, useEventSoldProducts, useEndEvent } from "@/hooks/event"
import type { EventCart, EventSoldProduct, Platform } from "@/types/event.types"
import { SalesFunnel } from "@/components/analytics/SalesFunnel"
import { LiveModeControlPanel } from "@/components/live/LiveModeControlPanel"
import { EventWhitelist } from "@/components/event/EventWhitelist"
import { EventUpsells } from "@/components/event/EventUpsells"
import { SessionTimeline } from "@/components/event/SessionTimeline"
import { useState } from "react"

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()

  const { data: event, isLoading: eventLoading, error: eventError, refetch: refetchEvent } = useEvent(id)
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useEventDetailStats(id)
  const { data: carts, isLoading: cartsLoading, refetch: refetchCarts } = useEventCarts(id)
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useEventSoldProducts(id)

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
        payload: {},
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

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="products">
            Produtos
            {event && event.productCount > 0 && (
              <Badge variant="secondary" className="ml-2">{event.productCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upsells">
            Upsells
            {event && event.upsellCount > 0 && (
              <Badge variant="secondary" className="ml-2">{event.upsellCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Live Mode Control Panel - Only show for active events */}
          {isEventActive && (
            <LiveModeControlPanel eventId={id} enabled={isEventActive} />
          )}

          {/* Main Content Grid: Funnel + Stats */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Sales Funnel - Takes 2 columns */}
            <div className="lg:col-span-2">
              {statsLoading ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : stats ? (
                <SalesFunnel
                  totalComments={stats.totalComments}
                  totalCarts={stats.totalCarts ?? 0}
                  checkoutCarts={stats.checkoutCarts ?? 0}
                  paidCarts={stats.paidCarts}
                  confirmedRevenue={stats.confirmedRevenue}
                  projectedRevenue={stats.projectedRevenue}
                />
              ) : null}
            </div>

            {/* Stats Cards - Stacked in 1 column */}
            <div className="space-y-4">
              {/* Carrinhos Abertos */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                        <ShoppingCart className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Carrinhos Abertos</p>
                        <p className="text-xs text-muted-foreground">aguardando pagamento</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {statsLoading ? (
                        <Skeleton className="h-8 w-12" />
                      ) : (
                        <>
                          <p className="text-2xl font-bold">{stats?.openCarts ?? 0}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(stats?.projectedRevenue ?? 0)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Produtos Vendidos */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <Package className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Produtos</p>
                        <p className="text-xs text-muted-foreground">unidades vendidas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {statsLoading ? (
                        <Skeleton className="h-8 w-12" />
                      ) : (
                        <p className="text-2xl font-bold">{stats?.totalProductsSold ?? 0}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sessoes Ativas */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Radio className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Sessoes</p>
                        <p className="text-xs text-muted-foreground">transmissoes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {eventLoading ? (
                        <Skeleton className="h-8 w-12" />
                      ) : (
                        <p className="text-2xl font-bold">{event?.sessions?.length ?? 0}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Carts Table - Full Width */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Pedidos do Evento
                  </CardTitle>
                  <CardDescription>
                    Lista de todos os carrinhos criados neste evento
                  </CardDescription>
                </div>
                {carts && carts.length > 0 && (
                  <Badge variant="secondary">{carts.length} carrinho(s)</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Sessao</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Itens</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Criado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : !carts || carts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
                            <p className="text-muted-foreground">Nenhum carrinho encontrado</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      carts.map((cart) => {
                        // Find session index for this cart
                        const sessionIndex = event?.sessions?.findIndex(s => s.id === cart.sessionId) ?? -1
                        return (
                          <CartRow key={cart.id} cart={cart} sessionNumber={sessionIndex >= 0 ? sessionIndex + 1 : null} />
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Sessions Timeline */}
          <SessionTimeline
            sessions={event?.sessions || []}
            eventId={id}
            isLoading={eventLoading}
            onNewSession={isEventActive ? () => setCreateSessionOpen(true) : undefined}
          />

          {/* Products Table - Collapsible */}
          <Card>
            <Collapsible defaultOpen={false}>
              <CardHeader className="pb-3">
                <CollapsibleTrigger className="flex w-full items-center justify-between [&[data-state=open]>svg.chevron]:rotate-180">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Produtos Vendidos
                    </CardTitle>
                    <CardDescription>
                      Produtos adicionados aos carrinhos neste evento
                    </CardDescription>
                  </div>
                  <ChevronDown className="chevron h-4 w-4 text-muted-foreground transition-transform duration-200" />
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="pt-0">
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
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <EventWhitelist eventId={id} />
        </TabsContent>

        <TabsContent value="upsells" className="mt-6">
          <EventUpsells eventId={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CartRow({ cart, sessionNumber }: { cart: EventCart; sessionNumber: number | null }) {
  const statusConfig = getStatusConfig(ORDER_STATUS_CONFIG, cart.status, "active")
  const paymentConfig = cart.paymentStatus
    ? getStatusConfig(PAYMENT_STATUS_CONFIG, cart.paymentStatus, "pending")
    : null

  // Determine which badge to show: payment status if paid, otherwise cart status
  const displayConfig = paymentConfig && cart.paymentStatus === "paid" ? paymentConfig : statusConfig

  // Format relative time
  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return "agora"
    if (diffMins < 60) return `${diffMins}min`
    if (diffHours < 24) return `${diffHours}h`
    return formatDateTime(dateStr).split(" ")[0]
  }

  return (
    <TableRow className="group">
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {cart.platformHandle.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">@{cart.platformHandle}</span>
        </div>
      </TableCell>
      <TableCell>
        {sessionNumber ? (
          <Badge variant="outline" className="text-xs font-mono">
            S{sessionNumber}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={displayConfig.variant}>{displayConfig.label}</Badge>
      </TableCell>
      <TableCell className="text-center">
        {cart.waitlistedItems > 0 ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center gap-1">
                  <span>{cart.availableItems}</span>
                  <span className="text-muted-foreground">+</span>
                  <span className="inline-flex items-center gap-0.5 text-amber-600">
                    {cart.waitlistedItems}
                    <Clock className="h-3 w-3" />
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{cart.availableItems} disponíveis, {cart.waitlistedItems} em espera</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          cart.availableItems
        )}
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(cart.totalValue)}
      </TableCell>
      <TableCell className="text-right text-sm text-muted-foreground">
        {getRelativeTime(cart.createdAt)}
      </TableCell>
    </TableRow>
  )
}

function ProductRow({ product }: { product: EventSoldProduct }) {
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

