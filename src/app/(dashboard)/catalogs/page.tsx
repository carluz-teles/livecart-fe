"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FolderOpen, MoreHorizontal, Pencil, Trash2, Package } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/shared/PageHeader"
import { CatalogForm } from "@/components/catalog/CatalogForm"
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
import { useCatalogs, useDeleteCatalog } from "@/hooks/catalog"
import { formatDate } from "@/lib/format"
import type { Catalog } from "@/types/catalog.types"

export default function CatalogsPage() {
  const router = useRouter()
  const { data: catalogs, isLoading, error } = useCatalogs()
  const deleteCatalog = useDeleteCatalog()

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Catalog | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleting, setDeleting] = useState<Catalog | null>(null)

  function handleEdit(catalog: Catalog) {
    setEditing(catalog)
    setEditOpen(true)
  }

  function confirmDelete() {
    if (!deleting) return
    deleteCatalog.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Catálogo excluído")
        setDeleting(null)
      },
      onError: (err) => {
        toast.error("Erro ao excluir catálogo", {
          description: err.message || "Tente novamente mais tarde.",
        })
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Catálogos"
        description="Coleções de produtos reutilizáveis nos seus eventos"
      >
        <CatalogForm open={createOpen} onOpenChange={setCreateOpen} />
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <CatalogTableSkeleton />
          ) : error ? (
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-destructive">
              Erro ao carregar catálogos. Tente novamente.
            </div>
          ) : !catalogs || catalogs.length === 0 ? (
            <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center">
              <div className="rounded-full bg-muted p-3">
                <FolderOpen className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Nenhum catálogo ainda</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Crie um catálogo (ex.: Catálogo de Páscoa) para reunir produtos e
                  reaproveitá-los em vários eventos.
                </p>
              </div>
              <Button onClick={() => setCreateOpen(true)}>Criar catálogo</Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-card">
              <div className="hidden items-center gap-4 border-b bg-muted/40 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[minmax(0,1fr)_140px_140px_40px]">
                <span>Catálogo</span>
                <span className="text-right">Produtos</span>
                <span>Atualizado</span>
                <span></span>
              </div>
              <div className="divide-y">
                {catalogs.map((catalog) => (
                  <div
                    key={catalog.id}
                    onClick={() => router.push(`/catalogs/${catalog.id}`)}
                    className="group grid cursor-pointer grid-cols-[minmax(0,1fr)_40px] items-center gap-4 px-4 py-3 text-sm transition-colors hover:bg-muted/50 md:grid-cols-[minmax(0,1fr)_140px_140px_40px]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border bg-muted">
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="truncate font-medium leading-tight transition-colors group-hover:text-primary">
                        {catalog.name}
                      </p>
                    </div>

                    <span className="hidden items-center justify-end gap-1.5 text-right text-muted-foreground md:flex">
                      <Package className="h-3.5 w-3.5" />
                      {catalog.productCount}
                    </span>

                    <span className="hidden text-xs text-muted-foreground md:block">
                      {formatDate(catalog.updatedAt)}
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
                          <DropdownMenuItem asChild>
                            <Link href={`/catalogs/${catalog.id}`}>
                              Editar produtos
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(catalog)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Renomear
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleting(catalog)}
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
        </CardContent>
      </Card>

      {/* Rename sheet (controlled) */}
      <CatalogForm
        catalog={editing ?? undefined}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setEditing(null)
        }}
        trigger={null}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir catálogo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o catálogo &quot;{deleting?.name}&quot;?
              Esta ação não pode ser desfeita. Os produtos não são apagados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCatalog.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CatalogTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[minmax(0,1fr)_140px_140px_40px] items-center gap-4 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="ml-auto h-4 w-10" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
