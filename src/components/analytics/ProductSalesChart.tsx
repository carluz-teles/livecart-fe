"use client"

import { useState, useMemo } from "react"
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/format"
import type { ProductSalesProduct, ProductSalesDataPoint } from "@/types"

// Color palette for products
const PRODUCT_COLORS = [
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#10b981", // emerald
  "#f43f5e", // rose
  "#6366f1", // indigo
  "#84cc16", // lime
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
]

interface ProductSalesChartProps {
  products: ProductSalesProduct[]
  data: ProductSalesDataPoint[]
  isLoading?: boolean
}

export function ProductSalesChart({ products, data, isLoading }: ProductSalesChartProps) {
  const [highlightedProduct, setHighlightedProduct] = useState<string>("all")

  // Transform data for Recharts stacked bar chart
  const chartData = useMemo(() => {
    return data.map((point) => {
      const transformed: Record<string, string | number> = {
        month: point.month,
        monthNum: point.monthNum,
      }

      // Add each product's value
      products.forEach((product) => {
        transformed[product.id] = point.values[product.id] || 0
      })

      return transformed
    })
  }, [data, products])

  // Map product IDs to colors
  const productColors = useMemo(() => {
    const colors: Record<string, string> = {}
    products.forEach((product, index) => {
      colors[product.id] = PRODUCT_COLORS[index % PRODUCT_COLORS.length]
    })
    return colors
  }, [products])

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean
    payload?: Array<{ name: string; value: number; fill: string }>
    label?: string
  }) => {
    if (!active || !payload) return null

    const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0)
    const filteredPayload = highlightedProduct === "all"
      ? payload
      : payload.filter(p => p.name === highlightedProduct)

    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="font-semibold mb-2">{label}</p>
        {filteredPayload.map((entry) => {
          const product = products.find(p => p.id === entry.name)
          return (
            <div key={entry.name} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: entry.fill }}
                />
                <span className="text-muted-foreground">{product?.name || entry.name}</span>
              </div>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </div>
          )
        })}
        {highlightedProduct === "all" && (
          <div className="mt-2 pt-2 border-t flex justify-between text-sm">
            <span className="font-medium">Total</span>
            <span className="font-semibold">{formatCurrency(total)}</span>
          </div>
        )}
      </div>
    )
  }

  // Custom legend
  const CustomLegend = () => {
    if (products.length === 0) return null

    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {products.map((product) => {
          const isHighlighted = highlightedProduct === "all" || highlightedProduct === product.id
          return (
            <button
              key={product.id}
              onClick={() => setHighlightedProduct(
                highlightedProduct === product.id ? "all" : product.id
              )}
              className={`flex items-center gap-2 text-sm transition-opacity ${
                isHighlighted ? "opacity-100" : "opacity-40"
              }`}
            >
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: productColors[product.id] }}
              />
              <span>{product.name}</span>
            </button>
          )
        })}
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendas por Produto</CardTitle>
          <CardDescription>Faturamento mensal por produto</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (products.length === 0 || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendas por Produto</CardTitle>
          <CardDescription>Faturamento mensal por produto</CardDescription>
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Vendas por Produto</CardTitle>
          <CardDescription>Faturamento mensal por produto</CardDescription>
        </div>
        <Select value={highlightedProduct} onValueChange={setHighlightedProduct}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar produto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os produtos</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            {products.map((product) => {
              const isHighlighted = highlightedProduct === "all" || highlightedProduct === product.id
              return (
                <Bar
                  key={product.id}
                  dataKey={product.id}
                  stackId="products"
                  fill={productColors[product.id]}
                  opacity={isHighlighted ? 1 : 0.2}
                  radius={[0, 0, 0, 0]}
                />
              )
            })}
          </BarChart>
        </ResponsiveContainer>
        <CustomLegend />
      </CardContent>
    </Card>
  )
}
