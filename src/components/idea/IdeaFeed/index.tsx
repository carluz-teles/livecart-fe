"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { IdeaListItem } from "@/types/idea.types"

import { IdeaCard } from "../IdeaCard"
import { IdeaFeedEmpty } from "./IdeaFeed.Empty"
import { IdeaFeedPagination } from "./IdeaFeed.Pagination"
import { IdeaFeedSkeleton } from "./IdeaFeed.Skeleton"

interface IdeaFeedProps {
  ideas: IdeaListItem[]
  isLoading: boolean
  isError: boolean
  // True while a filter/page switch is in flight and we're still showing
  // the previous list as placeholder data. Lets the feed fade slightly so
  // the click feels acknowledged without yanking the cards offscreen.
  isSwapping?: boolean
  onRetry?: () => void
}

function IdeaFeedRoot({
  ideas,
  isLoading,
  isError,
  isSwapping,
  onRetry,
}: IdeaFeedProps) {
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
    <div
      className={cn(
        "grid gap-3 transition-opacity duration-150",
        isSwapping && "opacity-60",
      )}
      aria-busy={isSwapping || undefined}
    >
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
