"use client"

import { use } from "react"
import { Clock, Copy, Loader2, Send, ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { useResendCartMessage } from "@/hooks/event"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  getStatusConfig,
} from "@/lib/constants"
import { formatCurrency, formatDateTime } from "@/lib/format"
import type { EventCart } from "@/types/event.types"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailCarts() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { event, carts, cartsLoading } = ctx.state

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-4 w-4" />
              Pedidos
            </CardTitle>
            <CardDescription>Todos os carrinhos do evento</CardDescription>
          </div>
          {carts.length > 0 && (
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
                <TableHead>Sessão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Itens</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Criado</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="mx-auto h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="ml-auto h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : carts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        Nenhum carrinho encontrado
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                carts.map((cart) => {
                  const sessionIndex =
                    event.sessions?.findIndex((s) => s.id === cart.sessionId) ?? -1
                  return (
                    <CartRow
                      key={cart.id}
                      cart={cart}
                      eventId={event.id}
                      sessionNumber={sessionIndex >= 0 ? sessionIndex + 1 : null}
                    />
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

interface CartRowProps {
  cart: EventCart
  eventId: string
  sessionNumber: number | null
}

function CartRow({ cart, eventId, sessionNumber }: CartRowProps) {
  const resendMessage = useResendCartMessage(eventId)
  const statusConfig = getStatusConfig(ORDER_STATUS_CONFIG, cart.status, "active")
  const paymentConfig = cart.paymentStatus
    ? getStatusConfig(PAYMENT_STATUS_CONFIG, cart.paymentStatus, "pending")
    : null

  const displayConfig =
    paymentConfig && cart.paymentStatus === "paid" ? paymentConfig : statusConfig

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

  const handleCopyCheckoutLink = async () => {
    const url = `${window.location.origin}/cart/${cart.token}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copiado!", {
        description: `Checkout de @${cart.platformHandle}`,
      })
    } catch {
      toast.error("Erro ao copiar link")
    }
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
          <Badge variant="outline" className="font-mono text-xs">
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
                <p>
                  {cart.availableItems} disponíveis, {cart.waitlistedItems} em
                  espera
                </p>
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
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => resendMessage.mutate(cart.id)}
                  disabled={resendMessage.isPending}
                >
                  {resendMessage.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="sr-only">Reenviar mensagem de checkout</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reenviar mensagem de checkout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopyCheckoutLink}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copiar link do checkout</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copiar link do checkout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </TableRow>
  )
}
