"use client"

import { Card } from "@/components/ui/card"
import type { IdeaListItem } from "@/types/idea.types"

import { IdeaCard } from "../IdeaCard"
import { IdeaFeedEmpty } from "./IdeaFeed.Empty"
import { IdeaFeedPagination } from "./IdeaFeed.Pagination"
import { IdeaFeedSkeleton } from "./IdeaFeed.Skeleton"

interface IdeaFeedProps {
  ideas: IdeaListItem[]
  isLoading: boolean
  isError: boolean
  onRetry?: () => void
}

function IdeaFeedRoot({ ideas, isLoading, isError, onRetry }: IdeaFeedProps) {
  if (isLoading) {
    return <IdeaFeedSkeleton />
  }

  if (isError) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-destructive mb-2">
          Não foi possível carregar as ideias.
        </p>
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
    return <IdeaFeedEmpty />
  }

  return (
    <div className="grid gap-3">
      {ideas.map((idea) => (
        <IdeaCard key={idea.id} idea={idea} />
      ))}
    </div>
  )
}

IdeaFeedRoot.Skeleton = IdeaFeedSkeleton
IdeaFeedRoot.Empty = IdeaFeedEmpty
IdeaFeedRoot.Pagination = IdeaFeedPagination

export { IdeaFeedRoot as IdeaFeed }
