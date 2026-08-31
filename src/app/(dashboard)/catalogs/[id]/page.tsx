"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CatalogForm } from "@/components/catalog/CatalogForm"
import { CatalogProductSelector } from "@/components/catalog/CatalogProductSelector"
import { useCatalog } from "@/hooks/catalog"

export default function CatalogDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: catalog, isLoading, error } = useCatalog(params.id)
  const [renameOpen, setRenameOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="w-fit -ml-2 text-muted-foreground"
      >
        <Link href="/catalogs">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Voltar aos catálogos
        </Link>
      </Button>

      {isLoading ? (
        <HeaderSkeleton />
      ) : error || !catalog ? (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-destructive">
          Catálogo não encontrado.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">{catalog.name}</h1>
              <p className="text-sm text-muted-foreground">
                {catalog.products.length}{" "}
                {catalog.products.length === 1 ? "produto" : "produtos"} neste catálogo
              </p>
            </div>
            <Button variant="outline" onClick={() => setRenameOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Renomear
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <CatalogProductSelector
                catalogId={catalog.id}
                initialProducts={catalog.products}
              />
            </CardContent>
          </Card>

          <CatalogForm
            catalog={catalog}
            open={renameOpen}
            onOpenChange={setRenameOpen}
            trigger={null}
          />
        </>
      )}
    </div>
  )
}

function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  )
}
