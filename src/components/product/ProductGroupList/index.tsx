"use client"

import { useEffect, useState } from "react"
import { Layers, MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useProductGroups,
  useDeleteProductGroup,
} from "@/hooks/product-group"
import { formatDateTime } from "@/lib/format"
import type { ProductGroupListItem } from "@/types"
import { ProductGroupDetailSheet } from "./ProductGroupDetailSheet"
import { EditProductGroupDialog } from "./EditProductGroupDialog"

export function ProductGroupList() {
  const [search, setSearch] = useState("")
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [editingGroup, setEditingGroup] =
    useState<ProductGroupListItem | null>(null)
  const [deletingGroup, setDeletingGroup] = useState<ProductGroupListItem | null>(
    null
  )
  const debouncedSearch = useDebouncedValue(search, 300)
  const { data, isLoading, error } = useProductGroups({
    search: debouncedSearch || undefined,
  })
  const deleteGroup = useDeleteProductGroup()

  const groups = data?.data ?? []

  const handleConfirmDelete = () => {
    if (!deletingGroup) return
    deleteGroup.mutate(deletingGroup.id, {
      onSuccess: () => {
        toast.success("Grupo excluído", {
          description:
            "Variantes mantidas como produtos avulsos (groupId removido)",
        })
        setDeletingGroup(null)
      },
      onError: (err) =>
        toast.error("Erro ao excluir grupo", {
          description: err.message || "Tente novamente.",
        }),
    })
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar grupo por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {isLoading ? (
        <GroupListSkeleton />
      ) : error ? (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-destructive">
          Erro ao carregar grupos. Tente novamente.
        </div>
      ) : groups.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
          <Layers className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {debouncedSearch
              ? "Nenhum grupo encontrado para essa busca."
              : "Nenhum grupo de variações cadastrado ainda."}
          </p>
          {!debouncedSearch && (
            <p className="text-xs text-muted-foreground">
              Crie um produto com variações em <strong>Novo Produto</strong>{" "}
              para começar.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <ul className="divide-y">
            {groups.map((group) => (
              <li
                key={group.id}
                onClick={() => setViewingId(group.id)}
                className="group flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                  <Layers className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight transition-colors group-hover:text-primary">
                    {group.name}
                  </p>
                  {group.description && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {group.description}
                    </p>
                  )}
                </div>

                <Badge variant="secondary" className="hidden sm:inline-flex">
                  {group.variantsCount}{" "}
                  {group.variantsCount === 1 ? "variante" : "variantes"}
                </Badge>

                <span className="hidden text-xs text-muted-foreground md:block">
                  {formatDateTime(group.createdAt)}
                </span>

                <div
                  className="flex justify-end"
                  onClick={(e) => e.stopPropagation()}
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
                      <DropdownMenuItem onClick={() => setViewingId(group.id)}>
                        Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingGroup(group)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar nome e descrição
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeletingGroup(group)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir grupo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ProductGroupDetailSheet
        groupId={viewingId}
        open={!!viewingId}
        onOpenChange={(open) => {
          if (!open) setViewingId(null)
        }}
      />

      <EditProductGroupDialog
        group={editingGroup}
        open={!!editingGroup}
        onOpenChange={(open) => {
          if (!open) setEditingGroup(null)
        }}
      />

      <AlertDialog
        open={!!deletingGroup}
        onOpenChange={(open) => {
          if (!open) setDeletingGroup(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir grupo &quot;{deletingGroup?.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              O grupo será apagado, mas as variantes <strong>não</strong> são
              deletadas — elas viram produtos avulsos (sem agrupamento). Você
              pode excluí-las individualmente depois pela aba Todos os SKUs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteGroup.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteGroup.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function GroupListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border px-4 py-3"
        >
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      ))}
    </div>
  )
}

// Tiny inline debounce — keeps the groups query from firing on every keystroke.
function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return debounced
}
