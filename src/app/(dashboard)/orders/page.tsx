"use client"

import { Search, MoreHorizontal, ShoppingCart, Clock, DollarSign, TrendingUp } from "lucide-react"

import { formatCurrency, formatDate } from "@/lib/format"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { OrderFilters } from "@/components/shared/Filters"
import { useListParams } from "@/hooks/shared/useListParams"
import { useOrders, useOrderStats } from "@/hooks/order"
import type { OrderFilters as OrderFiltersType, OrderStatus, PaymentStatus } from "@/types/cart.types"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const statusConfig: Record<OrderStatus | string, { label: string; variant: "outline" | "destructive" | "secondary" | "default" }> = {
  pending: { label: "Pendente", variant: "outline" },
  checkout: { label: "Checkout", variant: "secondary" },
  completed: { label: "Completo", variant: "default" },
  expired: { label: "Expirado", variant: "destructive" },
}

const paymentStatusConfig: Record<PaymentStatus | string, { label: string; variant: "outline" | "destructive" | "secondary" | "default" }> = {
  pending: { label: "Pendente", variant: "outline" },
  paid: { label: "Pago", variant: "default" },
  failed: { label: "Falhou", variant: "destructive" },
  refunded: { label: "Reembolsado", variant: "secondary" },
}

export default function OrdersPage() {
  const {
    search,
    setSearch,
    filters,
    setFilters,
    params,
  } = useListParams<OrderFiltersType>()

  // Fetch orders from API
  const { data, isLoading, error } = useOrders(params)
  // Fetch stats from API
  const { data: stats, isLoading: statsLoading } = useOrderStats()

  const orders = data?.data ?? []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe e gerencie os pedidos das suas lives
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalOrders ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Pedidos realizados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.pendingOrders ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando pagamento
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Skeleton className="h-8 w-16" /> : formatCurrency(stats?.totalRevenue ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor total dos pedidos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Skeleton className="h-8 w-16" /> : formatCurrency(stats?.avgTicket ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor médio por pedido
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os pedidos das suas lives.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente ou número do pedido..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <OrderFilters filters={filters} onChange={setFilters} />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Live</TableHead>
                  <TableHead className="text-center">Itens</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-destructive">
                      Erro ao carregar pedidos. Tente novamente.
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Nenhum pedido encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const statusCfg = statusConfig[order.status] || statusConfig.pending
                    const paymentCfg = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.pending
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          @{order.customerHandle}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {order.liveTitle || "Sem título"}
                        </TableCell>
                        <TableCell className="text-center">{order.totalItems}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusCfg.variant}>
                            {statusCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={paymentCfg.variant}>
                            {paymentCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                              <DropdownMenuItem>Atualizar status</DropdownMenuItem>
                              <DropdownMenuItem>Enviar notificação</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
