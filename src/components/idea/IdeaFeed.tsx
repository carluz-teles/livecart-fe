"use client"

import { Lightbulb } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { IdeaCard } from "./IdeaCard"
import type { IdeaListItem } from "@/types/idea.types"

interface IdeaFeedProps {
  ideas: IdeaListItem[]
  isLoading: boolean
  isError: boolean
  onRetry?: () => void
}

export function IdeaFeed({ ideas, isLoading, isError, onRetry }: IdeaFeedProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
              <Skeleton className="h-9 w-14" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-destructive mb-2">Não foi possível carregar as ideias.</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Tentar novamente
          </button>
        )}
      </Card>
    )
  }

  if (ideas.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lightbulb className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium">Nenhuma ideia por aqui ainda.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Compartilhe a primeira sugestão e abra a discussão com a equipe.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid gap-3">
      {ideas.map((idea) => (
        <IdeaCard key={idea.id} idea={idea} />
      ))}
    </div>
  )
}
