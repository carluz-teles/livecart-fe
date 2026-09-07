"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ListPagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  busy = false,
  noun = "registros",
}: {
  page: number
  limit: number
  total?: number
  totalPages?: number
  onPageChange: (page: number) => void
  busy?: boolean
  noun?: string
}) {
  const lastPage = Math.max(1, totalPages ?? 1)
  const start = total ? Math.min((page - 1) * limit + 1, total) : 0
  const end = Math.min(page * limit, total ?? 0)
  return (
    <nav
      aria-label={`Paginação de ${noun}`}
      className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {busy
          ? "Carregando…"
          : total === undefined
            ? "Total indisponível"
            : page > lastPage
              ? `Página sem resultados · ${total} ${noun} no total`
              : `${start}–${end} de ${total} ${noun}`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1 || busy}
        >
          <ChevronLeft data-icon="inline-start" /> Anterior
        </Button>
        <span className="text-xs tabular-nums">
          {page} / {lastPage}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= lastPage || busy || total === undefined}
        >
          Próxima <ChevronRight data-icon="inline-end" />
        </Button>
        {page > lastPage && !busy && (
          <Button variant="ghost" size="sm" onClick={() => onPageChange(1)}>
            Primeira página
          </Button>
        )}
      </div>
    </nav>
  )
}
