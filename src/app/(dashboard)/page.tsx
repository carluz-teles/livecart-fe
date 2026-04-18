"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  DollarSign,
  ShoppingCart,
  Package,
  Radio,
  CalendarIcon,
} from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useDashboardStats,
  useDashboardChart,
  useTopProducts,
  useEventsWithRevenue,
  useAggregatedFunnel,
} from "@/hooks/dashboard"
import { FunnelVisualization } from "@/components/analytics/FunnelVisualization"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EVENT_STATUS_CONFIG, getStatusConfig } from "@/lib/constants"
import Link from "next/link"

const chartConfig = {
  revenue: {
    label: "Vendas",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function DashboardPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })

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
      {/* Header with Date Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral das suas vendas e lives
          </p>
        </div>

        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd MMM", { locale: ptBR })} -{" "}
                    {format(date.to, "dd MMM, yyyy", { locale: ptBR })}
                  </>
                ) : (
                  format(date.from, "dd MMM, yyyy", { locale: ptBR })
                )
              ) : (
                <span>Selecione um período</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Faturamento Total
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(stats?.totalRevenue ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total de vendas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalOrders ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total de pedidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Produtos Ativos
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.activeProducts ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Produtos no catálogo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Lives Realizadas
                </CardTitle>
                <Radio className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalLives ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total de lives
                </p>
              </CardContent>
            </Card>
          </div>

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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Aggregated Funnel */}
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

          {/* Additional Funnel Stats */}
          {aggregatedFunnel && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Medio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(aggregatedFunnel.averageTicket)}
                  </div>
                  <p className="text-xs text-muted-foreground">por pedido pago</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Comentario → Carrinho</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {aggregatedFunnel.commentsToCartsRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">taxa de conversao</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Carrinho → Checkout</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {aggregatedFunnel.cartsToCheckoutRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">taxa de conversao</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Checkout → Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {aggregatedFunnel.checkoutToPaidRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">taxa de conversao</p>
                </CardContent>
              </Card>
            </div>
          )}

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
                      <TableHead className="text-center">Comentarios</TableHead>
                      <TableHead className="text-center">Carrinhos</TableHead>
                      <TableHead className="text-center">Pagos</TableHead>
                      <TableHead className="text-right">Conversao</TableHead>
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
                                {event.title || "Sem titulo"}
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
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
              <CardDescription>
                Relatórios detalhados estarão disponíveis em breve
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Esta seção permitirá gerar e exportar relatórios personalizados das suas vendas e lives.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
