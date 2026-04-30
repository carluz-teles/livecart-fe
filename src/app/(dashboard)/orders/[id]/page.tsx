"use client"

import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  User,
  CreditCard,
  Truck,
  Package,
  MessageCircle,
  MoreHorizontal,
  Instagram,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Phone,
  Printer,
} from "lucide-react"
import { useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"

import { useOrder, useUpdateOrder } from "@/hooks/order"
import { OrderLogistics } from "@/components/order/OrderLogistics"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, getStatusConfig } from "@/lib/constants"
import type { ShippingAddressPayload } from "@/types/cart.types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatAddress(address: ShippingAddressPayload): string {
  const line1 = [
    address.street,
    address.number,
    address.complement,
  ].filter(Boolean).join(", ")
  const line2 = [address.neighborhood, `${address.city}/${address.state}`]
    .filter(Boolean)
    .join(" — ")
  return `${line1}\n${line2}\nCEP ${address.zipCode}`
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const { data: order, isLoading, error } = useOrder(id)
  const updateOrder = useUpdateOrder()
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [refundOpen, setRefundOpen] = useState(false)

  const handleCopyAddress = async () => {
    if (!order?.shippingAddress) return
    try {
      await navigator.clipboard.writeText(formatAddress(order.shippingAddress))
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    } catch {
      toast.error("Não foi possível copiar o endereço")
    }
  }

  const handleOpenInstagramProfile = () => {
    if (order?.customerHandle) {
      window.open(`https://instagram.com/${order.customerHandle}`, "_blank")
    }
  }

  const handleOpenInstagramDM = () => {
    if (order?.customerHandle) {
      window.open(`https://ig.me/m/${order.customerHandle}`, "_blank")
    }
  }

  const handleOpenWhatsApp = () => {
    if (!order?.customer?.phone) return
    const digits = order.customer.phone.replace(/\D/g, "")
    window.open(`https://wa.me/${digits}`, "_blank")
  }

  const handlePrint = () => {
    window.print()
  }

  const handleRefund = () => {
    if (!order) return
    updateOrder.mutate(
      { id: order.id, paymentStatus: "refunded" },
      {
        onSuccess: () => {
          toast.success("Pedido marcado como reembolsado")
          setRefundOpen(false)
        },
        onError: () => toast.error("Falha ao reembolsar pedido"),
      },
    )
  }

  if (isLoading) {
    return <OrderDetailSkeleton />
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-destructive">Erro ao carregar pedido</p>
        <Button variant="outline" asChild>
          <Link href="/orders">Voltar para pedidos</Link>
        </Button>
      </div>
    )
  }

  const statusCfg = getStatusConfig(ORDER_STATUS_CONFIG, order.status, "active")
  const paymentCfg = getStatusConfig(PAYMENT_STATUS_CONFIG, order.paymentStatus, "pending")

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/orders"
            className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                Pedido #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="icon" onClick={handleOpenInstagramDM}>
            <Instagram className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </DropdownMenuItem>
              {order.paymentStatus === "paid" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => setRefundOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    Marcar como reembolsado
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={refundOpen} onOpenChange={setRefundOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reembolsar pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              O pedido será marcado como reembolsado. Essa ação não estorna o pagamento
              automaticamente — faça o reembolso no provedor de pagamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRefund}
              disabled={updateOrder.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {updateOrder.isPending ? "Reembolsando..." : "Reembolsar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Customer Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {order.customer?.name ? (
              <>
                <p className="font-medium">{order.customer.name}</p>
                <p className="text-xs text-muted-foreground">
                  @{order.customerHandle} · {order.livePlatform === "instagram" ? "Instagram" : order.livePlatform}
                </p>
                {order.customer.email && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{order.customer.email}</span>
                  </p>
                )}
                {order.customer.phone && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3 shrink-0" />
                    {order.customer.phone}
                  </p>
                )}
                {order.customer.document && (
                  <p className="font-mono text-xs text-muted-foreground">
                    {order.customer.document}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="font-medium">@{order.customerHandle}</p>
                <p className="text-sm text-muted-foreground">
                  {order.livePlatform === "instagram" ? "Instagram" : order.livePlatform}
                </p>
                <p className="text-xs text-muted-foreground">
                  Cliente ainda não preencheu o checkout
                </p>
              </>
            )}
            <div className="flex gap-2 pt-2 print:hidden">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleOpenInstagramProfile}
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                Perfil
              </Button>
              {order.customer?.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleOpenWhatsApp}
                >
                  <Phone className="mr-2 h-3 w-3" />
                  WhatsApp
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CreditCard className="h-4 w-4" />
              Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={paymentCfg.variant}>{paymentCfg.label}</Badge>
            </div>
            {order.paidAt && (
              <p className="text-sm text-muted-foreground">
                Pago em {formatDateTime(order.paidAt)}
              </p>
            )}
            <p className="text-lg font-semibold">
              {formatCurrency(order.totalAmount)}
            </p>
          </CardContent>
        </Card>

        {/* Delivery Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Truck className="h-4 w-4" />
              Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {order.shippingAddress ? (
              <>
                <p className="text-sm">
                  {order.shippingAddress.street}, {order.shippingAddress.number}
                  {order.shippingAddress.complement && ` — ${order.shippingAddress.complement}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress.neighborhood} · {order.shippingAddress.city}/{order.shippingAddress.state}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  CEP {order.shippingAddress.zipCode}
                </p>
                {order.shipping && (
                  <p className="pt-1 text-xs text-muted-foreground">
                    {order.shipping.serviceName} · {order.shipping.deadlineDays} dias · {formatCurrency(order.shipping.costCents)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Endereço ainda não informado
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full print:hidden"
              onClick={handleCopyAddress}
              disabled={!order.shippingAddress}
            >
              {copiedAddress ? (
                <>
                  <Check className="mr-2 h-3 w-3" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-3 w-3" />
                  Copiar Endereço
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Logistics panel — renders only for paid orders */}
      <OrderLogistics order={order} />

      {/* Items and Comments */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Items */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Package className="h-4 w-4" />
              Itens ({order.totalItems})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]"></TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center w-[80px]">Qtd</TableHead>
                    <TableHead className="text-right w-[100px]">Preço</TableHead>
                    <TableHead className="text-right w-[100px]">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.productImage ? (
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            width={40}
                            height={40}
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          {item.size && (
                            <p className="text-xs text-muted-foreground">
                              Tamanho: {item.size}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground font-mono">
                            {item.keyword}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.totalPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="mt-4 flex flex-col items-end gap-1 text-sm">
              {(() => {
                const shippingCents = order.shipping?.costCents ?? 0
                const itemsTotal = order.totalAmount - shippingCents
                return (
                  <>
                    <div className="flex w-48 justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>{formatCurrency(itemsTotal)}</span>
                    </div>
                    <div className="flex w-48 justify-between">
                      <span className="text-muted-foreground">Frete:</span>
                      <span>
                        {order.shipping
                          ? order.shipping.freeShipping
                            ? "Grátis"
                            : formatCurrency(shippingCents)
                          : "-"}
                      </span>
                    </div>
                    <div className="flex w-48 justify-between border-t pt-1 font-medium">
                      <span>Total:</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </>
                )
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Comments History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <MessageCircle className="h-4 w-4" />
              Histórico ({order.comments?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.comments && order.comments.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {order.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-lg bg-muted/50 p-3"
                    >
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>@{order.customerHandle}</span>
                        <span>{formatDateTime(comment.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                Nenhum comentário registrado
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function OrderDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-1 h-4 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Items and Comments */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
