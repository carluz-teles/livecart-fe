"use client"

import { useState, useEffect } from "react"
import { Trash2, Star, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { formatCurrency } from "@/lib/format"
import { useDebounce } from "@/hooks/shared"
import { useUpdateSessionProduct, useRemoveSessionProduct } from "@/hooks/event"
import type { SessionProduct } from "@/types"
import { cn } from "@/lib/utils"

interface SessionProductsTableProps {
  products: SessionProduct[]
  eventId: string
  sessionId: string
}

export function SessionProductsTable({
  products,
  eventId,
  sessionId,
}: SessionProductsTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[260px]">Produto</TableHead>
            <TableHead>Keyword</TableHead>
            <TableHead>Preço original</TableHead>
            <TableHead>Preço especial</TableHead>
            <TableHead>Qtd máx</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead className="w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <SessionProductRow
              key={product.id}
              product={product}
              eventId={eventId}
              sessionId={sessionId}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

interface SessionProductRowProps {
  product: SessionProduct
  eventId: string
  sessionId: string
}

function SessionProductRow({ product, eventId, sessionId }: SessionProductRowProps) {
  const [editingField, setEditingField] = useState<"price" | "qty" | null>(null)
  const [localPrice, setLocalPrice] = useState<string>(
    product.specialPrice ? (product.specialPrice / 100).toFixed(2).replace(".", ",") : ""
  )
  const [localQty, setLocalQty] = useState<string>(product.maxQuantity?.toString() ?? "")
  const [deleteOpen, setDeleteOpen] = useState(false)

  const updateMutation = useUpdateSessionProduct(eventId, sessionId)
  const removeMutation = useRemoveSessionProduct(eventId, sessionId)

  const debouncedPrice = useDebounce(localPrice, 500)
  const debouncedQty = useDebounce(localQty, 500)

  // Handle debounced price update
  useEffect(() => {
    if (editingField !== "price") return

    const priceInCents = localPrice
      ? Math.round(parseFloat(localPrice.replace(",", ".")) * 100)
      : null

    const currentPrice = product.specialPrice

    if (priceInCents !== currentPrice) {
      updateMutation.mutate({
        productId: product.productId,
        payload: { specialPrice: priceInCents },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPrice])

  // Handle debounced qty update
  useEffect(() => {
    if (editingField !== "qty") return

    const qty = localQty ? parseInt(localQty, 10) : null
    const currentQty = product.maxQuantity

    if (qty !== currentQty) {
      updateMutation.mutate({
        productId: product.productId,
        payload: { maxQuantity: qty },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQty])

  const handleDelete = () => {
    removeMutation.mutate(product.productId)
    setDeleteOpen(false)
  }

  const isPending = updateMutation.isPending

  return (
    <>
      <TableRow className={cn(isPending && "bg-primary/5")}>
        <TableCell>
          <div className="flex items-center gap-3">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="max-w-[180px] truncate font-medium" title={product.name}>
                {product.name}
              </p>
              {product.featured && (
                <span className="inline-flex items-center text-xs text-amber-600">
                  <Star className="mr-1 h-3 w-3 fill-amber-500" />
                  Destaque
                </span>
              )}
            </div>
          </div>
        </TableCell>

        <TableCell>
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            {product.keyword}
          </code>
        </TableCell>

        <TableCell className="text-muted-foreground">
          {formatCurrency(product.originalPrice)}
        </TableCell>

        <TableCell onClick={() => setEditingField("price")} className="cursor-pointer">
          {editingField === "price" ? (
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">R$</span>
              <Input
                autoFocus
                value={localPrice}
                onChange={(e) => setLocalPrice(e.target.value)}
                onBlur={() => setEditingField(null)}
                onKeyDown={(e) => e.key === "Enter" && setEditingField(null)}
                className="h-8 w-24"
                placeholder="0,00"
              />
            </div>
          ) : (
            <span
              className={cn(
                "hover:underline",
                product.specialPrice
                  ? "font-medium text-green-600"
                  : "text-muted-foreground"
              )}
            >
              {product.specialPrice ? formatCurrency(product.specialPrice) : "Preço base"}
            </span>
          )}
        </TableCell>

        <TableCell onClick={() => setEditingField("qty")} className="cursor-pointer">
          {editingField === "qty" ? (
            <Input
              autoFocus
              type="number"
              min="1"
              value={localQty}
              onChange={(e) => setLocalQty(e.target.value)}
              onBlur={() => setEditingField(null)}
              onKeyDown={(e) => e.key === "Enter" && setEditingField(null)}
              className="h-8 w-20"
              placeholder="-"
            />
          ) : (
            <span
              className={cn(
                "hover:underline",
                product.maxQuantity ? "font-medium" : "text-muted-foreground"
              )}
            >
              {product.maxQuantity ?? "Padrão"}
            </span>
          )}
        </TableCell>

        <TableCell>
          <span
            className={cn(
              product.stock <= 0 && "text-destructive",
              product.stock <= 5 && product.stock > 0 && "text-amber-600"
            )}
          >
            {product.stock}
          </span>
        </TableCell>

        <TableCell>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteOpen(true)}
            disabled={removeMutation.isPending}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </TableCell>
      </TableRow>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover produto</AlertDialogTitle>
            {/* Remover o ÚLTIMO produto não restringe mais: libera a loja
                inteira nesta transmissão. Avisar aqui é a diferença entre uma
                remoção e uma abertura acidental do catálogo. */}
            <AlertDialogDescription>
              Remover &ldquo;{product.name}&rdquo; dos produtos desta transmissão? Se a
              lista ficar vazia, todos os produtos da loja voltam a ser aceitos aqui.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
