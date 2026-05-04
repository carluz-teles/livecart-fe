"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface IdeaFeedPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function IdeaFeedPagination({
  page,
  totalPages,
  onPageChange,
}: IdeaFeedPaginationProps) {
  if (totalPages <= 1) return null

  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <nav
      className="flex items-center justify-between border-t pt-4"
      aria-label="Paginação"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={!canPrev}
        onClick={() => canPrev && onPageChange(page - 1)}
      >
        <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
        Anterior
      </Button>

      <span className="text-xs text-muted-foreground tabular-nums">
        Página <span className="font-medium text-foreground">{page}</span> de{" "}
        <span className="font-medium text-foreground">{totalPages}</span>
      </span>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={!canNext}
        onClick={() => canNext && onPageChange(page + 1)}
      >
        Próxima
        <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  )
}
