"use client"

import { useMemo } from "react"
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/format"
import type { RevenueByPaymentItem } from "@/types"

// Color palette for payment methods
const PAYMENT_COLORS: Record<string, string> = {
  pix: "#32BCAD", // teal
  credit_card: "#8B5CF6", // violet
  debit_card: "#6366F1", // indigo
  boleto: "#F59E0B", // amber
  other: "#94A3B8", // slate
}

interface PaymentMethodChartProps {
  data: RevenueByPaymentItem[]
  isLoading?: boolean
}

export function PaymentMethodChart({ data, isLoading }: PaymentMethodChartProps) {
  // Transform data for Recharts pie chart
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: item.label,
      value: item.revenue,
      count: item.count,
      paymentMethod: item.paymentMethod,
    }))
  }, [data])

  // Calculate total for percentage
  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + item.revenue, 0)
  }, [data])

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean
    payload?: Array<{
      name: string
      value: number
      payload: {
        name: string
        value: number
        count: number
        paymentMethod: string
      }
    }>
  }) => {
    if (!active || !payload || !payload[0]) return null

    const item = payload[0].payload
    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0"

    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="font-semibold mb-2">{item.name}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Faturamento</span>
            <span className="font-medium">{formatCurrency(item.value)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Pedidos</span>
            <span className="font-medium">{item.count}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Participação</span>
            <span className="font-medium">{percentage}%</span>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Faturamento por Método de Pagamento</CardTitle>
          <CardDescription>Distribuição de receita por forma de pagamento</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Faturamento por Método de Pagamento</CardTitle>
          <CardDescription>Distribuição de receita por forma de pagamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faturamento por Método de Pagamento</CardTitle>
        <CardDescription>Distribuição de receita por forma de pagamento</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PAYMENT_COLORS[entry.paymentMethod] || PAYMENT_COLORS.other}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Custom Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {chartData.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-2 text-sm">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: PAYMENT_COLORS[entry.paymentMethod] || PAYMENT_COLORS.other }}
              />
              <span>{entry.name}</span>
            </div>
          ))}
        </div>
        <div className="text-center mt-4 text-sm text-muted-foreground">
          Total: <span className="font-semibold text-foreground">{formatCurrency(total)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
