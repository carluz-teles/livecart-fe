"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, MoreHorizontal, Package, CheckCircle, AlertTriangle, Warehouse, Trash2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProductForm } from "@/components/product/ProductForm"
import { ProductDetailModal } from "@/components/product/ProductDetailModal"
import { ProductGroupList } from "@/components/product/ProductGroupList"
import { ProductFilters } from "@/components/shared/Filters"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatsCard } from "@/components/shared/StatsCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useListParams } from "@/hooks/shared/useListParams"
import { useProducts, useProductStats, useUpdateProduct, useDeleteProduct, useSyncProduct } from "@/hooks/product"
import { useProductGroups } from "@/hooks/product-group"
import { formatCurrency } from "@/lib/format"
import type { Product, ProductFilters as ProductFiltersType } from "@/types/product.types"
import { Card, CardContent } from "@/components/ui/card"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  // Fetch only the count for the tab badge — page-1 limit-1 is enough.
  const { data: groupsCount } = useProductGroups({
    pagination: { page: 1, limit: 1 },
  })
  const totalGroups = groupsCount?.pagination.total ?? 0
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
      <PageHeader
        title="Produtos"
        description="Gerencie seu catálogo de produtos"
      >
        <ProductForm
          open={createFormOpen}
          onOpenChange={setCreateFormOpen}
        />
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total de Produtos"
          value={stats?.totalProducts ?? 0}
          description="Produtos cadastrados"
          icon={Package}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Produtos Ativos"
          value={stats?.activeCount ?? 0}
          description="Disponíveis para venda"
          icon={CheckCircle}
          isLoading={statsLoading}
          variant="success"
        />
        <StatsCard
          title="Estoque Baixo"
          value={stats?.lowStockCount ?? 0}
          description="Precisam de reposição"
          icon={AlertTriangle}
          isLoading={statsLoading}
          variant="warning"
        />
        <StatsCard
          title="Valor em Estoque"
          value={formatCurrency(stats?.stockValue ?? 0)}
          description="Valor total do inventário"
          icon={Warehouse}
          isLoading={statsLoading}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                Todos os SKUs
              </TabsTrigger>
              <TabsTrigger value="groups">
                Grupos
                {totalGroups > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {totalGroups}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
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
            <div className="overflow-hidden rounded-lg border">
              <div className="hidden items-center gap-4 border-b bg-muted/40 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[40px_minmax(0,1fr)_120px_110px_110px_130px_40px]">
                <span></span>
                <span>Produto</span>
                <span>Origem</span>
                <span className="text-right">Preço</span>
                <span className="text-right">Estoque</span>
                <span>Status</span>
                <span></span>
              </div>
              <div className="divide-y">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-4 px-4 py-3 md:grid-cols-[40px_minmax(0,1fr)_120px_110px_110px_130px_40px]"
                  >
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="hidden h-4 w-16 md:block" />
                    <Skeleton className="hidden h-4 w-16 md:block ml-auto" />
                    <Skeleton className="hidden h-4 w-16 md:block ml-auto" />
                    <Skeleton className="hidden h-5 w-14 md:block" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                ))}
              </div>
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
            <div className="overflow-hidden rounded-lg border bg-card">
              <div className="hidden items-center gap-4 border-b bg-muted/40 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[40px_minmax(0,1fr)_120px_110px_110px_130px_40px]">
                <span></span>
                <span>Produto</span>
                <span>Origem</span>
                <span className="text-right">Preço</span>
                <span className="text-right">Estoque</span>
                <span>Status</span>
                <span></span>
              </div>
              <div className="divide-y">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setViewingProduct(product)}
                    className="group grid cursor-pointer grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-4 px-4 py-3 text-sm transition-colors hover:bg-muted/50 md:grid-cols-[40px_minmax(0,1fr)_120px_110px_110px_130px_40px]"
                  >
                    <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-muted">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-muted-foreground">
                          {getProductInitials(product.name)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium leading-tight transition-colors group-hover:text-primary">
                        {product.name}
                      </p>
                      {product.keyword && (
                        <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                          #{product.keyword}
                        </p>
                      )}
                    </div>

                    <span className="hidden truncate text-xs text-muted-foreground md:block">
                      {sourceLabels[product.externalSource] ?? product.externalSource}
                    </span>

                    <span className="hidden text-right font-medium tracking-tight md:block">
                      {formatCurrency(product.price)}
                    </span>

                    <span
                      className={`hidden text-right text-xs md:block ${
                        product.stock === 0
                          ? "font-medium text-destructive"
                          : product.stock <= 5
                            ? "font-medium text-amber-600 dark:text-amber-400"
                            : "text-muted-foreground"
                      }`}
                    >
                      {product.stock === 0 ? "Esgotado" : `${product.stock} un.`}
                    </span>

                    <span className="hidden md:flex md:flex-col md:items-start md:gap-1">
                      <Badge
                        variant={product.active ? "outline" : "secondary"}
                        className={`h-5 text-[10px] font-medium ${
                          product.active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400"
                            : ""
                        }`}
                      >
                        {product.active ? "Ativo" : "Inativo"}
                      </Badge>
                      {!product.shippable && (
                        <TooltipProvider delayDuration={150}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className="h-5 cursor-help whitespace-nowrap border-amber-200 bg-amber-50 text-[10px] font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400"
                              >
                                Faltam medidas
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-xs text-xs leading-relaxed"
                            >
                              Esse produto não tem peso ou dimensões cadastradas,
                              então o frete não consegue ser calculado no
                              checkout. Edite o produto e preencha peso, altura,
                              largura e comprimento da embalagem.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </span>

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex justify-end"
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-60 transition-opacity group-hover:opacity-100"
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
                  </div>
                ))}
              </div>
            </div>
          )}
            </TabsContent>

            <TabsContent value="groups" className="mt-0">
              <ProductGroupList />
            </TabsContent>
          </Tabs>
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
