"use client"

import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CategoryBadge } from "./CategoryBadge"
import { StatusBadge } from "./StatusBadge"
import { VoteButton } from "./VoteButton"
import { CommentThread, ReplyComposer } from "./CommentThread"
import { formatDateTime } from "@/lib/format"
import { getIdeaStatusMeta } from "@/lib/idea-meta"
import type { IdeaDetail as IdeaDetailType } from "@/types/idea.types"

interface IdeaDetailProps {
  idea: IdeaDetailType
}

export function IdeaDetail({ idea }: IdeaDetailProps) {
  const statusMeta = getIdeaStatusMeta(idea.status)

  return (
    <div className="grid gap-6 lg:grid-cols-[88px_1fr]">
      <div className="hidden lg:flex justify-end">
        <VoteButton
          ideaId={idea.id}
          ideaNumber={idea.number}
          voteCount={idea.voteCount}
          votedByMe={idea.votedByMe}
          isAuthor={idea.isAuthor}
          size="lg"
        />
      </div>

      <Card className="p-6 md:p-8">
        <header className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2 min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono font-medium text-sm">#{idea.number}</span>
                <span aria-hidden="true">·</span>
                <span>publicada por <span className="font-medium text-foreground">{idea.authorName}</span></span>
                <span aria-hidden="true">·</span>
                <time dateTime={idea.createdAt}>{formatDateTime(idea.createdAt)}</time>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight leading-tight">
                {idea.title}
              </h1>
            </div>

            <div className="lg:hidden">
              <VoteButton
                ideaId={idea.id}
                ideaNumber={idea.number}
                voteCount={idea.voteCount}
                votedByMe={idea.votedByMe}
                isAuthor={idea.isAuthor}
                size="lg"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge label={idea.categoryLabel} />
            <StatusBadge status={idea.status} />
            <span className="text-xs text-muted-foreground">{statusMeta.description}</span>
          </div>
        </header>

        <Separator className="my-6" />

        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {idea.description}
        </p>

        <Separator className="my-6" />

        <section aria-labelledby="discussion-heading" className="flex flex-col gap-4">
          <h2 id="discussion-heading" className="text-sm font-semibold tracking-tight">
            Discussão
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {idea.commentCount} {idea.commentCount === 1 ? "comentário" : "comentários"}
            </span>
          </h2>

          <ReplyComposer ideaId={idea.id} />

          <CommentThread ideaId={idea.id} comments={idea.comments} />
        </section>
      </Card>
    </div>
  )
}
