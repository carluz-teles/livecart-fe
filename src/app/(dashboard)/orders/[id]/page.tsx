"use client"

import { use } from "react"
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
  Plus,
  X,
  ExternalLink,
} from "lucide-react"
import { useState } from "react"

import { useOrder } from "@/hooks/order"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, getStatusConfig } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
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

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params)
  const { data: order, isLoading, error } = useOrder(id)
  const [copiedAddress, setCopiedAddress] = useState(false)

  const handleCopyAddress = () => {
    // TODO: Copy address when available
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
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

  const statusCfg = getStatusConfig(ORDER_STATUS_CONFIG, order.status, "pending")
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
        <div className="flex items-center gap-2">
          {order.status === "pending" && (
            <Button>Marcar como Enviado</Button>
          )}
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
              <DropdownMenuItem>Cancelar pedido</DropdownMenuItem>
              <DropdownMenuItem>Reembolsar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Imprimir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
            <p className="font-medium">@{order.customerHandle}</p>
            <p className="text-sm text-muted-foreground">
              {order.livePlatform === "instagram" ? "Instagram" : order.livePlatform}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={handleOpenInstagramProfile}
            >
              <ExternalLink className="mr-2 h-3 w-3" />
              Abrir Perfil
            </Button>
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
            <p className="text-sm text-muted-foreground">
              Endereço não informado
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={handleCopyAddress}
              disabled
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

      {/* Items and Comments */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Items */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Package className="h-4 w-4" />
              Itens ({order.totalItems})
            </CardTitle>
            <Button variant="outline" size="sm" disabled>
              <Plus className="mr-2 h-3 w-3" />
              Adicionar
            </Button>
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
                    <TableHead className="w-[50px]"></TableHead>
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
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="mt-4 flex flex-col items-end gap-1 text-sm">
              <div className="flex w-48 justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex w-48 justify-between">
                <span className="text-muted-foreground">Frete:</span>
                <span>-</span>
              </div>
              <div className="flex w-48 justify-between border-t pt-1 font-medium">
                <span>Total:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
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
