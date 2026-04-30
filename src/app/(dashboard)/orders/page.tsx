"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, MoreHorizontal, ShoppingCart, Clock, DollarSign, TrendingUp } from "lucide-react"

import { formatCurrency, formatDate } from "@/lib/format"
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, getStatusConfig } from "@/lib/constants"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { OrderFilters } from "@/components/shared/Filters"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatsCard } from "@/components/shared/StatsCard"
import { useListParams } from "@/hooks/shared/useListParams"
import { useOrders, useOrderStats } from "@/hooks/order"
import type { OrderFilters as OrderFiltersType } from "@/types/cart.types"
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

export default function OrdersPage() {
  const router = useRouter()
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
      <PageHeader
        title="Pedidos"
        description="Acompanhe e gerencie os pedidos das suas lives"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total de Pedidos"
          value={stats?.totalOrders ?? 0}
          description="Pedidos realizados"
          icon={ShoppingCart}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Pedidos Pendentes"
          value={stats?.pendingOrders ?? 0}
          description="Aguardando pagamento"
          icon={Clock}
          isLoading={statsLoading}
          variant="warning"
        />
        <StatsCard
          title="Receita Total"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          description="Valor total dos pedidos"
          icon={DollarSign}
          isLoading={statsLoading}
          variant="success"
        />
        <StatsCard
          title="Ticket Médio"
          value={formatCurrency(stats?.avgTicket ?? 0)}
          description="Valor médio por pedido"
          icon={TrendingUp}
          isLoading={statsLoading}
        />
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
                    const statusCfg = getStatusConfig(ORDER_STATUS_CONFIG, order.status, "active")
                    const paymentCfg = getStatusConfig(PAYMENT_STATUS_CONFIG, order.paymentStatus, "pending")
                    return (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
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
                        <TableCell onClick={(e) => e.stopPropagation()}>
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
                              <DropdownMenuItem asChild>
                                <Link href={`/orders/${order.id}`}>Ver detalhes</Link>
                              </DropdownMenuItem>
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
