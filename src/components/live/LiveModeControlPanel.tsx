"use client"

import { useMemo } from "react"
import {
  Pause,
  Play,
  Package,
  Circle,
  RefreshCw,
} from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useLiveModeState,
  useSetActiveProduct,
  useSetProcessingPaused,
} from "@/hooks/event"
import { useProducts } from "@/hooks/product"

interface LiveModeControlPanelProps {
  eventId: string
  enabled?: boolean
}

export function LiveModeControlPanel({
  eventId,
  enabled = true,
}: LiveModeControlPanelProps) {
  const {
    data: liveModeState,
    isLoading: stateLoading,
  } = useLiveModeState(eventId, { enabled, refetchInterval: 5000 })

  const { data: productsData, isLoading: productsLoading } = useProducts({
    filters: { status: ["active"] },
  })

  const setActiveProductMutation = useSetActiveProduct()
  const setProcessingPausedMutation = useSetProcessingPaused()

  const products = useMemo(() => productsData?.data ?? [], [productsData])

  const isPaused = liveModeState?.processingPaused ?? false
  const activeProduct = liveModeState?.activeProduct

  const handlePauseToggle = async (paused: boolean) => {
    await setProcessingPausedMutation.mutateAsync({
      eventId,
      payload: { paused },
    })
  }

  const handleActiveProductChange = async (productId: string) => {
    await setActiveProductMutation.mutateAsync({
      eventId,
      payload: { productId: productId === "none" ? null : productId },
    })
  }

  const isUpdating =
    setActiveProductMutation.isPending || setProcessingPausedMutation.isPending

  if (!enabled) return null

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <span
              className={`relative flex h-3 w-3 ${isPaused ? "" : "animate-pulse"}`}
            >
              <Circle
                className={`h-3 w-3 ${
                  isPaused ? "fill-yellow-500 text-yellow-500" : "fill-green-500 text-green-500"
                }`}
              />
            </span>
            Modo Live
          </span>
          {isUpdating && (
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stateLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            {/* Pause/Resume Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">
                  {isPaused ? "Processamento Pausado" : "Processando Comentarios"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isPaused
                    ? "Comentarios sao recebidos mas nao criam carrinhos"
                    : "Comentarios sao processados normalmente"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isPaused ? (
                  <Pause className="h-4 w-4 text-yellow-600" />
                ) : (
                  <Play className="h-4 w-4 text-green-600" />
                )}
                <Switch
                  checked={!isPaused}
                  onCheckedChange={(checked) => handlePauseToggle(!checked)}
                  disabled={isUpdating}
                />
              </div>
            </div>

            {/* Active Product Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Produto Ativo (Fallback)</Label>
              <p className="text-xs text-muted-foreground">
                Quando alguem comenta &ldquo;quero&rdquo; sem keyword, usa este produto
              </p>
              {productsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={activeProduct?.id ?? "none"}
                  onValueChange={handleActiveProductChange}
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum (usar keywords)</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <span className="flex items-center gap-2">
                          <code className="rounded bg-muted px-1 py-0.5 text-xs">
                            {product.keyword}
                          </code>
                          <span className="truncate">{product.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Active Product Preview */}
            {activeProduct && (
              <div className="rounded-lg border bg-background p-3">
                <div className="flex items-start gap-3">
                  {activeProduct.imageUrl ? (
                    <img
                      src={activeProduct.imageUrl}
                      alt={activeProduct.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{activeProduct.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <code className="rounded bg-muted px-1 py-0.5 text-xs">
                        {activeProduct.keyword}
                      </code>
                      <span>{formatCurrency(activeProduct.price)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
