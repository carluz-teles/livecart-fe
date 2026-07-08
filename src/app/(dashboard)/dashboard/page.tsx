"use client"

// Dashboard redesenhado (jul/2026): filtro global de intervalo, KPIs coerentes
// (todos respondem pelo MESMO período), funil com estados de saída e a aba
// Financeiro. Cortes aprovados: card de lives, tabela GMV por evento e
// gráfico de vendas por produto (redundantes); mix de pagamento foi pro
// Financeiro.

import { useState } from "react"
import { DollarSign, MessageCircle, ShoppingCart, TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

import { formatCurrency } from "@/lib/format"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { StatsCard } from "@/components/shared/StatsCard"
import { PageHeader } from "@/components/shared/PageHeader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinanceiroPanel } from "@/components/billing/FinanceiroPanel"
import { FunnelStates } from "@/components/analytics/FunnelStates"
import {
  PeriodFilter,
  rangeForPreset,
  type PeriodPreset,
} from "@/components/dashboard/PeriodFilter"
import {
  useOverview,
  useRevenueSeries,
  useTopProducts,
  useTopBuyers,
} from "@/hooks/dashboard"
import type { PeriodRange } from "@/types/dashboard.types"

const chartConfig = {
  revenue: {
    label: "Vendas",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

// Granularidade adaptativa: dia até 31d, semana até ~4 meses, mês acima.
function bucketFor(range: PeriodRange): "day" | "week" | "month" {
  const days =
    (new Date(range.to).getTime() - new Date(range.from).getTime()) / 86_400_000
  if (days <= 31) return "day"
  if (days <= 120) return "week"
  return "month"
}

function bucketLabel(bucket: string, granularity: "day" | "week" | "month"): string {
  const d = new Date(bucket + "T00:00:00")
  if (granularity === "month") {
    return d.toLocaleDateString("pt-BR", { month: "short" })
  }
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

export default function DashboardPage() {
  const [preset, setPreset] = useState<PeriodPreset>("30d")
  const [range, setRange] = useState<PeriodRange>(() => rangeForPreset("30d"))

  const granularity = bucketFor(range)
  const { data: overview, isLoading: overviewLoading } = useOverview(range)
  const { data: series, isLoading: seriesLoading } = useRevenueSeries(range, granularity)
  const { data: topProductsData, isLoading: topProductsLoading } = useTopProducts(range)
  const { data: topBuyersData, isLoading: topBuyersLoading } = useTopBuyers(range)

  const topProducts = topProductsData?.data ?? []
  const topBuyers = topBuyersData?.data ?? []

  const conversion =
    overview && overview.totalCarts > 0
      ? Math.round((overview.paidCarts / overview.totalCarts) * 100)
      : null

  const chartItems = (series ?? []).map((p) => ({
    label: bucketLabel(p.bucket, granularity),
    revenue: p.revenueCents / 100,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Dashboard"
          description="Vendas, performance e financeiro da sua loja"
        />
        <PeriodFilter
          preset={preset}
          range={range}
          onChange={(p, r) => {
            setPreset(p)
            setRange(r)
          }}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 flex flex-col gap-6">
          {/* KPIs do período — todos coerentes com o filtro */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Vendas (GMV)"
              value={formatCurrency(overview?.gmvCents ?? 0)}
              description="pedidos pagos no período"
              icon={DollarSign}
              isLoading={overviewLoading}
              variant="success"
            />
            <StatsCard
              title="Pedidos pagos"
              value={overview?.paidOrders ?? 0}
              description={
                conversion !== null
                  ? `${conversion}% dos carrinhos converteram`
                  : "no período"
              }
              icon={ShoppingCart}
              isLoading={overviewLoading}
            />
            <StatsCard
              title="Ticket médio"
              value={formatCurrency(overview?.averageTicket ?? 0)}
              description="por pedido pago"
              icon={TrendingUp}
              isLoading={overviewLoading}
            />
            <StatsCard
              title="Gerado pelo LiveCart"
              value={formatCurrency(overview?.recoveredRevenueCents ?? 0)}
              description={
                overview && overview.recoveredCarts > 0
                  ? `${overview.recoveredCarts} carrinhos recuperados 💬`
                  : "vendas recuperadas no período"
              }
              icon={MessageCircle}
              isLoading={overviewLoading}
              variant="info"
            />
          </div>

          {/* Funil com estados */}
          <FunnelStates data={overview} isLoading={overviewLoading} />

          {/* Receita ao longo do tempo (granularidade adaptativa) */}
          <Card>
            <CardHeader>
              <CardTitle>Receita no período</CardTitle>
              <CardDescription>
                {granularity === "day"
                  ? "Por dia"
                  : granularity === "week"
                    ? "Por semana"
                    : "Por mês"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {seriesLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : chartItems.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                  Sem vendas no período selecionado.
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <BarChart accessibilityLayer data={chartItems}>
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) =>
                        v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
                      }
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={6} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Rankings do período */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top produtos</CardTitle>
                <CardDescription>Mais vendidos no período</CardDescription>
              </CardHeader>
              <CardContent>
                {topProductsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-9 w-full" />
                    ))}
                  </div>
                ) : topProducts.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Sem vendas no período.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {topProducts.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">#{p.keyword}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {formatCurrency(p.totalRevenue)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {p.totalSold} un.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top compradores</CardTitle>
                <CardDescription>Quem mais comprou no período</CardDescription>
              </CardHeader>
              <CardContent>
                {topBuyersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-9 w-full" />
                    ))}
                  </div>
                ) : topBuyers.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Sem compras no período.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {topBuyers.map((b, i) => (
                      <div key={b.id} className="flex items-center gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">@{b.handle}</p>
                          <p className="text-xs text-muted-foreground">
                            {b.totalOrders} {b.totalOrders === 1 ? "pedido" : "pedidos"}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatCurrency(b.totalSpent)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financeiro" className="mt-6">
          <FinanceiroPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
