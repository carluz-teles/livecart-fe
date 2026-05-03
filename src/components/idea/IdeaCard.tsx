"use client"

import Link from "next/link"
import { MessageSquare } from "lucide-react"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "./StatusBadge"
import { CategoryBadge } from "./CategoryBadge"
import { VoteButton } from "./VoteButton"
import { formatRelativeTime } from "@/lib/format"
import type { IdeaListItem } from "@/types/idea.types"

interface IdeaCardProps {
  idea: IdeaListItem
}

export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <Link
        href={`/ideas/${idea.id}`}
        className="flex flex-col gap-3 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Abrir ideia número ${idea.number}: ${idea.title}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono font-medium">#{idea.number}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{idea.authorName}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={idea.createdAt}>{formatRelativeTime(idea.createdAt)}</time>
            </div>
            <h3 className="text-base font-semibold leading-snug tracking-tight line-clamp-2">
              {idea.title}
            </h3>
          </div>
          <div className="shrink-0" onClick={(e) => e.preventDefault()}>
            <VoteButton
              ideaId={idea.id}
              ideaNumber={idea.number}
              voteCount={idea.voteCount}
              votedByMe={idea.votedByMe}
              isAuthor={idea.isAuthor}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {idea.description}
        </p>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge label={idea.categoryLabel} />
            <StatusBadge status={idea.status} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="tabular-nums">{idea.commentCount}</span>
            <span className="sr-only">comentários</span>
          </div>
        </div>
      </Link>
    </Card>
  )
}
