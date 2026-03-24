"use client"

import { useState } from "react"
import { Search, MoreHorizontal, Package, CheckCircle, AlertTriangle, Warehouse, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProductForm } from "@/components/product/ProductForm"
import { ProductFilters } from "@/components/shared/Filters"
import { useListParams } from "@/hooks/shared/useListParams"
import { useProducts, useProductStats, useUpdateProduct, useDeleteProduct } from "@/hooks/product"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

export default function ProductsPage() {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editFormOpen, setEditFormOpen] = useState(false)
  const [createFormOpen, setCreateFormOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

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

  const products = data?.data ?? []

  function handleEdit(product: Product) {
    setEditingProduct(product)
    setEditFormOpen(true)
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

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Fonte</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-center">Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-md" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-14" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-destructive">
                      Erro ao carregar produtos. Tente novamente.
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-md">
                            <AvatarImage src={product.imageUrl ?? undefined} alt={product.name} />
                            <AvatarFallback className="rounded-md text-xs">
                              {getProductInitials(product.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {product.keyword}
                      </TableCell>
                      <TableCell>{sourceLabels[product.externalSource] ?? product.externalSource}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(product.price)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={product.stock <= 5 ? "text-destructive font-medium" : ""}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.active ? "default" : "secondary"}>
                          {product.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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
