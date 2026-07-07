"use client"

import {
  DollarSign,
  ShoppingCart,
  Radio,
  TrendingUp,
} from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import Link from "next/link"

import { formatCurrency } from "@/lib/format"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/shared/StatsCard"
import { PageHeader } from "@/components/shared/PageHeader"
import {
  useDashboardStats,
  useDashboardChart,
  useTopProducts,
  useTopBuyers,
  useProductSales,
  useEventsWithRevenue,
  useAggregatedFunnel,
  useRevenueByPayment,
} from "@/hooks/dashboard"
import { SalesFunnel } from "@/components/analytics/SalesFunnel"
import { ProductSalesChart } from "@/components/analytics/ProductSalesChart"
import { PaymentMethodChart } from "@/components/analytics/PaymentMethodChart"
import { EVENT_STATUS_CONFIG, getStatusConfig } from "@/lib/constants"

const chartConfig = {
  revenue: {
    label: "Vendas",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function DashboardPage() {
  // Fetch data from API
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: chartData, isLoading: chartLoading } = useDashboardChart()
  const { data: topProductsData, isLoading: topProductsLoading } = useTopProducts()
  const { data: topBuyersData, isLoading: topBuyersLoading } = useTopBuyers()
  const { data: productSalesData, isLoading: productSalesLoading } = useProductSales()
  const { data: eventsWithRevenue, isLoading: eventsLoading } = useEventsWithRevenue(20)
  const { data: aggregatedFunnel, isLoading: funnelLoading } = useAggregatedFunnel(30)
  const { data: revenueByPayment, isLoading: paymentLoading } = useRevenueByPayment()

  const chartItems = chartData?.data ?? []
  const topProducts = topProductsData?.data ?? []
  const topBuyers = topBuyersData?.data ?? []
  const productSalesProducts = productSalesData?.products ?? []
  const productSalesItems = productSalesData?.data ?? []
  const events = eventsWithRevenue?.data ?? []
  const paymentItems = revenueByPayment?.data ?? []

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title="Visão Geral"
        description="Acompanhe suas vendas, conversões e performance"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Faturamento Total"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          description="Total de vendas"
          icon={DollarSign}
          isLoading={statsLoading}
          variant="success"
        />
        <StatsCard
          title="Ticket Médio"
          value={formatCurrency(aggregatedFunnel?.averageTicket ?? 0)}
          description="por pedido pago"
          icon={TrendingUp}
          isLoading={funnelLoading}
          variant="success"
        />
        <StatsCard
          title="Pedidos"
          value={stats?.totalOrders ?? 0}
          description="Total de pedidos"
          icon={ShoppingCart}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Lives Realizadas"
          value={stats?.totalLives ?? 0}
          description="Total de lives"
          icon={Radio}
          isLoading={statsLoading}
          variant="info"
        />
      </div>

      {/* Sales Funnel */}
      {funnelLoading ? (
        <Card className="p-6">
          <Skeleton className="h-48 w-full" />
        </Card>
      ) : aggregatedFunnel ? (
        <SalesFunnel
          totalComments={aggregatedFunnel.totalComments}
          totalCarts={aggregatedFunnel.totalCarts}
          checkoutCarts={aggregatedFunnel.checkoutCarts}
          paidCarts={aggregatedFunnel.paidCarts}
          confirmedRevenue={aggregatedFunnel.confirmedRevenue}
        />
      ) : null}

      {/* Top Sellers and Top Buyers */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Sellers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Sellers</CardTitle>
            <CardDescription>
              Produtos mais vendidos no período
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topProductsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Nenhum produto vendido ainda
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.keyword} • {product.totalSold} vendidos
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      {formatCurrency(product.totalRevenue)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Buyers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Compradores</CardTitle>
            <CardDescription>
              Clientes que mais compraram
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topBuyersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : topBuyers.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Nenhuma compra confirmada ainda
              </div>
            ) : (
              <div className="space-y-4">
                {topBuyers.map((buyer, index) => (
                  <div key={buyer.id} className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/10 text-sm font-semibold text-green-600">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {buyer.handle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {buyer.totalOrders} {buyer.totalOrders === 1 ? "pedido" : "pedidos"}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      {formatCurrency(buyer.totalSpent)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Vendas Totais */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas Totais</CardTitle>
            <CardDescription>
              Faturamento mensal ao longo do ano
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {chartLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-[280px] w-full" />
              </div>
            ) : chartItems.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart accessibilityLayer data={chartItems}>
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-revenue)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Vendas por Produto */}
        <ProductSalesChart
          products={productSalesProducts}
          data={productSalesItems}
          isLoading={productSalesLoading}
        />
      </div>

      {/* Payment Method Chart */}
      <PaymentMethodChart
        data={paymentItems}
        isLoading={paymentLoading}
      />

      {/* Events with Revenue Table */}
      <Card>
        <CardHeader>
          <CardTitle>GMV por Evento</CardTitle>
          <CardDescription>
            Receita confirmada por cada evento de vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Comentários</TableHead>
                  <TableHead className="text-center">Carrinhos</TableHead>
                  <TableHead className="text-center">Pagos</TableHead>
                  <TableHead className="text-right">Conversão</TableHead>
                  <TableHead className="text-right">GMV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Nenhum evento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => {
                    const statusConfig = getStatusConfig(EVENT_STATUS_CONFIG, event.status, "ended")
                    return (
                      <TableRow key={event.id}>
                        <TableCell>
                          <Link
                            href={`/events/${event.id}`}
                            className="font-medium hover:underline"
                          >
                            {event.title || "Sem título"}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                        </TableCell>
                        <TableCell className="text-center">{event.totalComments}</TableCell>
                        <TableCell className="text-center">{event.totalCarts}</TableCell>
                        <TableCell className="text-center text-green-600 font-medium">
                          {event.paidCarts}
                        </TableCell>
                        <TableCell className="text-right">
                          {event.conversionRate.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {formatCurrency(event.confirmedRevenue)}
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
