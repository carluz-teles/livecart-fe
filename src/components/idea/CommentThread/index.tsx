"use client"

import type { IdeaCommentNode } from "@/types/idea.types"

import { CommentItem } from "./CommentThread.Item"
import { ReplyComposer } from "./CommentThread.ReplyComposer"

interface CommentThreadProps {
  ideaId: string
  comments: IdeaCommentNode[]
}

function CommentThreadRoot({ ideaId, comments }: CommentThreadProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Seja a primeira pessoa a comentar.
      </p>
    )
  }

  return (
    <ol className="flex flex-col gap-4" aria-label="Discussão da ideia">
      {comments.map((c) => (
        <CommentItem key={c.id} ideaId={ideaId} comment={c} depth={0} />
      ))}
    </ol>
  )
}

CommentThreadRoot.Item = CommentItem
CommentThreadRoot.ReplyComposer = ReplyComposer

export { CommentThreadRoot as CommentThread, ReplyComposer }
