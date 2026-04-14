"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, MoreHorizontal, Package, CheckCircle, AlertTriangle, Warehouse, Trash2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProductForm } from "@/components/product/ProductForm"
import { ProductDetailModal } from "@/components/product/ProductDetailModal"
import { ProductFilters } from "@/components/shared/Filters"
import { useListParams } from "@/hooks/shared/useListParams"
import { useProducts, useProductStats, useUpdateProduct, useDeleteProduct, useSyncProduct } from "@/hooks/product"
import { formatCurrency } from "@/lib/format"
import type { Product, ProductFilters as ProductFiltersType } from "@/types/product.types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

function getProductInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
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

export default function ProductsPage() {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editFormOpen, setEditFormOpen] = useState(false)
  const [createFormOpen, setCreateFormOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)

  const {
    search,
    setSearch,
    filters,
    setFilters,
    params,
  } = useListParams<ProductFiltersType>()

  const { data, isLoading, error } = useProducts(params)
  const { data: stats, isLoading: statsLoading } = useProductStats()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()
  const { mutate: syncProduct, isPending: isSyncing, canSync } = useSyncProduct()

  const products = data?.data ?? []

  function handleEdit(product: Product) {
    setEditingProduct(product)
    setEditFormOpen(true)
  }

  function handleSync(product: Product) {
    syncProduct(
      { product },
      {
        onSuccess: (syncedData) => {
          toast.success("Produto sincronizado!", {
            description: `${syncedData.name} atualizado via ERP`,
          })
          const merged = {
            ...product,
            name: syncedData.name,
            price: syncedData.price,
            stock: syncedData.stock,
            imageUrl: syncedData.imageUrl,
            active: syncedData.active,
            externalId: syncedData.externalId,
          }
          if (viewingProduct?.id === product.id) {
            setViewingProduct(merged)
          }
        },
        onError: (error) => {
          toast.error("Erro ao sincronizar", {
            description: error.message || "Tente novamente mais tarde.",
          })
        },
      }
    )
  }

  function handleToggleActive(product: Product) {
    updateProduct.mutate(
      {
        id: product.id,
        payload: {
          name: product.name,
          price: product.price,
          stock: product.stock,
          imageUrl: product.imageUrl || undefined,
          active: !product.active,
        },
      },
      {
        onSuccess: () => {
          toast.success(product.active ? "Produto desativado" : "Produto ativado")
        },
        onError: (error) => {
          toast.error("Erro ao alterar status", {
            description: error.message || "Tente novamente mais tarde.",
          })
        },
      }
    )
  }

  function handleDelete(product: Product) {
    setDeletingProduct(product)
  }

  function confirmDelete() {
    if (!deletingProduct) return

    deleteProduct.mutate(deletingProduct.id, {
      onSuccess: () => {
        toast.success("Produto excluído com sucesso!")
        setDeletingProduct(null)
      },
      onError: (error) => {
        toast.error("Erro ao excluir produto", {
          description: error.message || "Tente novamente mais tarde.",
        })
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seu catálogo de produtos
          </p>
        </div>
        <ProductForm
          open={createFormOpen}
          onOpenChange={setCreateFormOpen}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalProducts ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Produtos cadastrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.activeCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Disponíveis para venda
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.lowStockCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Precisam de reposição
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor em Estoque</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? <Skeleton className="h-8 w-12" /> : formatCurrency(stats?.stockValue ?? 0)}</div>
            <p className="text-xs text-muted-foreground">
              Valor total do inventário
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os produtos do seu catálogo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <ProductFilters filters={filters} onChange={setFilters} />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg border bg-card">
                  <Skeleton className="aspect-square w-full rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-destructive">
              Erro ao carregar produtos. Tente novamente.
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
              <Package className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhum produto encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setViewingProduct(product)}
                  className="group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Package className="h-8 w-8" />
                        <span className="text-lg font-semibold">
                          {getProductInitials(product.name)}
                        </span>
                      </div>
                    )}

                    <div className="absolute left-2 top-2 flex items-center gap-1.5">
                      <Badge
                        variant={product.active ? "default" : "secondary"}
                        className="h-6 shadow-sm"
                      >
                        {product.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>

                    <div
                      className="absolute right-2 top-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-background/90 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            Editar produto
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(product)}>
                            {product.active ? "Desativar" : "Ativar"}
                          </DropdownMenuItem>
                          {canSync(product) && (
                            <DropdownMenuItem
                              onClick={() => handleSync(product)}
                              disabled={isSyncing}
                            >
                              <RefreshCw
                                className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                              />
                              Sincronizar via ERP
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(product)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {product.stock === 0 && (
                      <div className="absolute inset-x-0 bottom-0 bg-destructive/90 py-1 text-center text-xs font-medium text-destructive-foreground backdrop-blur-sm">
                        Esgotado
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <h3 className="line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-primary">
                      {product.name}
                    </h3>

                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-lg font-semibold tracking-tight">
                        {formatCurrency(product.price)}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          product.stock === 0
                            ? "text-destructive"
                            : product.stock <= 5
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {product.stock} un.
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium ${sourceColors[product.externalSource] ?? ""}`}
                      >
                        {sourceLabels[product.externalSource] ?? product.externalSource}
                      </Badge>
                      {product.keyword && (
                        <span className="truncate font-mono text-[11px] text-muted-foreground">
                          #{product.keyword}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Form */}
      <ProductForm
        product={editingProduct ?? undefined}
        open={editFormOpen}
        onOpenChange={(open) => {
          setEditFormOpen(open)
          if (!open) setEditingProduct(null)
        }}
        trigger={null}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={viewingProduct}
        open={!!viewingProduct}
        onOpenChange={(open) => !open && setViewingProduct(null)}
        onSync={handleSync}
        isSyncing={isSyncing}
        canSync={viewingProduct ? canSync(viewingProduct) : false}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto &quot;{deletingProduct?.name}&quot;?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
