"use client"

import Link from "next/link"
import { MessageSquare } from "lucide-react"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "./StatusBadge"
import { CategoryBadge } from "./CategoryBadge"
import { VoteButton } from "./VoteButton"
import { usePrefetchIdea } from "@/hooks/idea"
import { formatRelativeTime } from "@/lib/format"
import type { IdeaListItem } from "@/types/idea.types"

interface IdeaCardProps {
  idea: IdeaListItem
}

// Canny-style row: prominent vote tile on the left anchoring the card, then
// title + meta on the right. The whole surface is a link so clicks anywhere
// (except the vote button itself) navigate to the detail page.
export function IdeaCard({ idea }: IdeaCardProps) {
  const prefetchIdea = usePrefetchIdea()
  const handlePrefetch = () => prefetchIdea(idea.id)

  return (
    <Card className="group relative overflow-hidden p-4 transition-all hover:border-primary/30 hover:shadow-sm">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <VoteButton
            ideaId={idea.id}
            ideaNumber={idea.number}
            voteCount={idea.voteCount}
            votedByMe={idea.votedByMe}
            isAuthor={idea.isAuthor}
          />
        </div>

        <Link
          href={`/ideas/${idea.id}`}
          onMouseEnter={handlePrefetch}
          onFocus={handlePrefetch}
          onTouchStart={handlePrefetch}
          className="flex flex-1 flex-col gap-2 min-w-0 focus-visible:outline-none"
          aria-label={`Abrir ideia número ${idea.number}: ${idea.title}`}
        >
          <h3 className="text-base font-semibold leading-snug tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
            {idea.title}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {idea.description}
          </p>

          <div className="flex items-center gap-2 flex-wrap pt-1">
            <CategoryBadge label={idea.categoryLabel} />
            <StatusBadge status={idea.status} />
            <span className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="tabular-nums">{idea.commentCount}</span>
                <span className="sr-only">comentários</span>
              </span>
              <span className="hidden sm:inline">por {idea.authorName}</span>
              <time dateTime={idea.createdAt} className="hidden md:inline">
                · {formatRelativeTime(idea.createdAt)}
              </time>
            </span>
          </div>
        </Link>
      </div>
    </Card>
  )
}
