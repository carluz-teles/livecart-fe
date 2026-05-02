"use client"

import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatCompactCurrency, formatCurrency } from "@/lib/format"
import type { ProductSalesDataPoint, ProductSalesProduct } from "@/types"

const PRODUCT_COLORS = [
  "#f59e0b", // amber-500 (brand)
  "#8b5cf6", // violet-500
  "#10b981", // emerald-500
  "#06b6d4", // cyan-500
  "#ec4899", // pink-500
  "#6366f1", // indigo-500
  "#84cc16", // lime-500
  "#f97316", // orange-500
  "#14b8a6", // teal-500
  "#f43f5e", // rose-500
]

interface ProductSalesChartProps {
  products: ProductSalesProduct[]
  data: ProductSalesDataPoint[]
  isLoading?: boolean
}

const ALL_PRODUCTS = "all"

export function ProductSalesChart({ products, data, isLoading }: ProductSalesChartProps) {
  const [highlightedProduct, setHighlightedProduct] = useState<string>(ALL_PRODUCTS)

  const productColors = useMemo(() => {
    const map: Record<string, string> = {}
    products.forEach((product, index) => {
      map[product.id] = PRODUCT_COLORS[index % PRODUCT_COLORS.length]
    })
    return map
  }, [products])

  const chartData = useMemo(() => {
    return data.map((point) => {
      const row: Record<string, string | number> = {
        month: point.month,
        monthNum: point.monthNum,
      }
      products.forEach((product) => {
        row[product.id] = point.values[product.id] || 0
      })
      return row
    })
  }, [data, products])

  const productTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    products.forEach((product) => {
      totals[product.id] = data.reduce(
        (sum, point) => sum + (point.values[product.id] || 0),
        0,
      )
    })
    return totals
  }, [data, products])

  const grandTotal = useMemo(
    () => Object.values(productTotals).reduce((sum, value) => sum + value, 0),
    [productTotals],
  )

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => (productTotals[b.id] || 0) - (productTotals[a.id] || 0)),
    [products, productTotals],
  )

  const toggleHighlight = (id: string) => {
    setHighlightedProduct((current) => (current === id ? ALL_PRODUCTS : id))
  }

  const isHighlighted = (productId: string) =>
    highlightedProduct === ALL_PRODUCTS || highlightedProduct === productId

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
    <Card className="flex flex-col">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle>Vendas por Produto</CardTitle>
          <CardDescription>
            {highlightedProduct === ALL_PRODUCTS
              ? "Faturamento mensal por produto"
              : `Filtrando: ${products.find((p) => p.id === highlightedProduct)?.name ?? ""}`}
          </CardDescription>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="text-right">
            <div className="text-2xl font-semibold tabular-nums leading-none">
              {formatCurrency(
                highlightedProduct === ALL_PRODUCTS
                  ? grandTotal
                  : productTotals[highlightedProduct] || 0,
              )}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {highlightedProduct === ALL_PRODUCTS ? "total no ano" : "total do produto"}
            </div>
          </div>
          <Select value={highlightedProduct} onValueChange={setHighlightedProduct}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filtrar produto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_PRODUCTS}>Todos os produtos</SelectItem>
              {sortedProducts.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-2 sm:px-6">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.5}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={70}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={(value) => formatCompactCurrency(value)}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))", radius: 6, opacity: 0.6 }}
              content={
                <ProductSalesTooltip
                  products={products}
                  highlightedProduct={highlightedProduct}
                />
              }
            />
            {sortedProducts.map((product, index) => {
              const visible = isHighlighted(product.id)
              const isLast = index === sortedProducts.length - 1
              return (
                <Bar
                  key={product.id}
                  dataKey={product.id}
                  stackId="products"
                  fill={productColors[product.id]}
                  fillOpacity={visible ? 1 : 0.18}
                  radius={isLast ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                  isAnimationActive
                />
              )
            })}
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 grid gap-2 border-t pt-4 sm:grid-cols-2">
          {sortedProducts.map((product) => {
            const total = productTotals[product.id] || 0
            const share = grandTotal > 0 ? (total / grandTotal) * 100 : 0
            const visible = isHighlighted(product.id)
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => toggleHighlight(product.id)}
                className={cn(
                  "group flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition-colors",
                  "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  visible ? "opacity-100" : "opacity-50 hover:opacity-80",
                )}
                aria-pressed={highlightedProduct === product.id}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: productColors[product.id] }}
                  />
                  <span className="truncate text-sm font-medium">{product.name}</span>
                </div>
                <div className="flex shrink-0 items-baseline gap-2 tabular-nums">
                  <span className="text-sm font-semibold">{formatCurrency(total)}</span>
                  <span className="text-xs text-muted-foreground">
                    {share.toFixed(1)}%
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

interface ProductSalesTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; fill: string; dataKey: string }>
  label?: string
  products: ProductSalesProduct[]
  highlightedProduct: string
}

function ProductSalesTooltip({
  active,
  payload,
  label,
  products,
  highlightedProduct,
}: ProductSalesTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const visible = payload
    .filter((entry) => (entry.value || 0) > 0)
    .filter((entry) =>
      highlightedProduct === ALL_PRODUCTS ? true : entry.dataKey === highlightedProduct,
    )
    .sort((a, b) => (b.value || 0) - (a.value || 0))

  if (visible.length === 0) return null

  const total = visible.reduce((sum, entry) => sum + (entry.value || 0), 0)

  return (
    <div className="min-w-[220px] rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur-sm">
      <p className="mb-2 text-sm font-semibold">{label}</p>
      <div className="space-y-1.5">
        {visible.map((entry) => {
          const product = products.find((p) => p.id === entry.dataKey)
          return (
            <div
              key={entry.dataKey}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: entry.fill }}
                />
                <span className="truncate text-muted-foreground">
                  {product?.name ?? entry.dataKey}
                </span>
              </div>
              <span className="font-medium tabular-nums">
                {formatCurrency(entry.value)}
              </span>
            </div>
          )
        })}
      </div>
      {highlightedProduct === ALL_PRODUCTS && visible.length > 1 && (
        <div className="mt-2 flex justify-between border-t pt-2 text-sm">
          <span className="font-medium">Total</span>
          <span className="font-semibold tabular-nums">{formatCurrency(total)}</span>
        </div>
      )}
    </div>
  )
}
