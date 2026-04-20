"use client"

import {
  DollarSign,
  ShoppingCart,
  Package,
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
  useEventsWithRevenue,
  useAggregatedFunnel,
} from "@/hooks/dashboard"
import { FunnelVisualization } from "@/components/analytics/FunnelVisualization"
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
  const { data: eventsWithRevenue, isLoading: eventsLoading } = useEventsWithRevenue(20)
  const { data: aggregatedFunnel, isLoading: funnelLoading } = useAggregatedFunnel(30)

  const chartItems = chartData?.data ?? []
  const topProducts = topProductsData?.data ?? []
  const events = eventsWithRevenue?.data ?? []

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
          title="Pedidos"
          value={stats?.totalOrders ?? 0}
          description="Total de pedidos"
          icon={ShoppingCart}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Produtos Ativos"
          value={stats?.activeProducts ?? 0}
          description="Produtos no catálogo"
          icon={Package}
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

      {/* Funnel Visualization */}
      {funnelLoading ? (
        <Card className="p-6">
          <Skeleton className="h-48 w-full" />
        </Card>
      ) : aggregatedFunnel ? (
        <FunnelVisualization
          totalComments={aggregatedFunnel.totalComments}
          totalCarts={aggregatedFunnel.totalCarts}
          checkoutCarts={aggregatedFunnel.checkoutCarts}
          paidCarts={aggregatedFunnel.paidCarts}
          confirmedRevenue={aggregatedFunnel.confirmedRevenue}
        />
      ) : null}

      {/* Conversion Stats */}
      {aggregatedFunnel && (
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="Ticket Médio"
            value={formatCurrency(aggregatedFunnel.averageTicket)}
            description="por pedido pago"
            icon={TrendingUp}
            variant="success"
          />
          <StatsCard
            title="Comentário → Carrinho"
            value={`${aggregatedFunnel.commentsToCartsRate.toFixed(1)}%`}
            description="taxa de conversão"
            variant="info"
          />
          <StatsCard
            title="Carrinho → Checkout"
            value={`${aggregatedFunnel.cartsToCheckoutRate.toFixed(1)}%`}
            description="taxa de conversão"
            variant="info"
          />
          <StatsCard
            title="Checkout → Pago"
            value={`${aggregatedFunnel.checkoutToPaidRate.toFixed(1)}%`}
            description="taxa de conversão"
            variant="success"
          />
        </div>
      )}

      {/* Chart and Top Sellers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart */}
        <Card className="col-span-4">
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

        {/* Top Sellers */}
        <Card className="col-span-3">
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
      </div>

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
