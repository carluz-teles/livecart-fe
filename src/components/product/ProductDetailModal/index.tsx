"use client"

import Image from "next/image"
import { Package, Tag, Hash, Layers, Calendar, Box, RefreshCw } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatCurrency, formatDateTime } from "@/lib/format"
import type { Product } from "@/types/product.types"

interface ProductDetailModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSync?: (product: Product) => void
  isSyncing?: boolean
  canSync?: boolean
}

const sourceLabels: Record<string, string> = {
  manual: "Manual",
  bling: "Bling",
  tiny: "Tiny",
  shopify: "Shopify",
}

const sourceColors: Record<string, string> = {
  manual: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  bling: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  tiny: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  shopify: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
}

function getProductInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function ProductDetailModal({
  product,
  open,
  onOpenChange,
  onSync,
  isSyncing = false,
  canSync = false,
}: ProductDetailModalProps) {
  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <div className="relative">
          {/* Product Image */}
          <div className="relative h-64 w-full bg-muted">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 672px) 100vw, 672px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Avatar className="h-24 w-24 rounded-xl">
                  <AvatarFallback className="rounded-xl text-3xl font-semibold text-muted-foreground">
                    {getProductInitials(product.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            {/* Status badge overlay */}
            <div className="absolute left-4 top-4">
              <Badge
                variant={product.active ? "default" : "secondary"}
                className="text-sm shadow-md"
              >
                {product.active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <DialogHeader className="mb-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-semibold tracking-tight">
                  {product.name}
                </DialogTitle>
                {canSync && onSync && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSync(product)}
                    disabled={isSyncing}
                    className="gap-2"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                    />
                    {isSyncing ? "Sincronizando..." : "Sincronizar"}
                  </Button>
                )}
              </div>
            </DialogHeader>

            {/* Price highlight */}
            <div className="mb-6 rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium text-muted-foreground">Preço</p>
              <p className="text-3xl font-bold tracking-tight">
                {formatCurrency(product.price)}
              </p>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4">
              <InfoItem
                icon={<Tag className="h-4 w-4" />}
                label="Keyword"
                value={
                  <span className="font-mono text-sm">{product.keyword}</span>
                }
              />
              <InfoItem
                icon={<Box className="h-4 w-4" />}
                label="Estoque"
                value={
                  <span
                    className={
                      product.stock <= 5
                        ? "font-semibold text-destructive"
                        : "font-semibold"
                    }
                  >
                    {product.stock} unidades
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="ml-1.5 text-xs font-normal text-destructive">
                        (baixo)
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="ml-1.5 text-xs font-normal text-destructive">
                        (esgotado)
                      </span>
                    )}
                  </span>
                }
              />
              <InfoItem
                icon={<Layers className="h-4 w-4" />}
                label="Fonte"
                value={
                  <Badge
                    variant="outline"
                    className={sourceColors[product.externalSource] ?? ""}
                  >
                    {sourceLabels[product.externalSource] ??
                      product.externalSource}
                  </Badge>
                }
              />
              {product.externalId && (
                <InfoItem
                  icon={<Hash className="h-4 w-4" />}
                  label="ID Externo"
                  value={
                    <span className="font-mono text-sm">
                      {product.externalId}
                    </span>
                  }
                />
              )}
            </div>

            <Separator className="my-4" />

            {/* Timestamps */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Criado em {formatDateTime(product.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                <span>Atualizado em {formatDateTime(product.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <div>{value}</div>
      </div>
    </div>
  )
}
