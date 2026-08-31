"use client"

import Link from "next/link"
import { Loader2, FolderOpen } from "lucide-react"
import { toast } from "sonner"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useCatalogs, useEventCatalog, useSetEventCatalog } from "@/hooks/catalog"

// Sentinel used because a Radix Select cannot hold an empty-string value.
const NONE_VALUE = "__none__"

interface EventCatalogSelectProps {
  eventId: string
}

/**
 * Associa (ou desassocia) um catálogo a este evento.
 *
 * Lê o catálogo atual via useEventCatalog (que devolve null quando não há) e
 * escreve via useSetEventCatalog. "Nenhum" limpa a associação (catalogId null).
 */
export function EventCatalogSelect({ eventId }: EventCatalogSelectProps) {
  const { data: catalogs, isLoading: catalogsLoading } = useCatalogs()
  const { data: current, isLoading: currentLoading } = useEventCatalog(eventId)
  const setEventCatalog = useSetEventCatalog()

  const isLoading = catalogsLoading || currentLoading
  const currentValue = current?.id ?? NONE_VALUE

  function handleChange(value: string) {
    const catalogId = value === NONE_VALUE ? null : value
    setEventCatalog.mutate(
      { eventId, catalogId },
      {
        onSuccess: () => {
          toast.success(catalogId ? "Catálogo associado" : "Catálogo removido")
        },
        onError: (error) => {
          toast.error("Erro ao atualizar catálogo", {
            description: error.message || "Tente novamente mais tarde.",
          })
        },
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          Catálogo
        </CardTitle>
        <CardDescription>
          Vincule um catálogo de produtos a este evento. Cada evento tem no máximo um.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading ? (
          <Skeleton className="h-10 w-full max-w-sm" />
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={currentValue}
              onValueChange={handleChange}
              disabled={setEventCatalog.isPending}
            >
              <SelectTrigger className="w-full max-w-sm">
                <SelectValue placeholder="Selecione um catálogo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Nenhum</SelectItem>
                {(catalogs ?? []).map((catalog) => (
                  <SelectItem key={catalog.id} value={catalog.id}>
                    {catalog.name} ({catalog.productCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {setEventCatalog.isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        )}

        {!isLoading && (catalogs ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">
            Você ainda não tem catálogos.{" "}
            <Link href="/catalogs" className="text-primary underline underline-offset-2">
              Criar um catálogo
            </Link>
            .
          </p>
        )}
      </CardContent>
    </Card>
  )
}
