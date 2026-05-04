"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp, CornerDownRight } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatRelativeTime, getInitials } from "@/lib/format"
import { getDescendantCount } from "@/lib/idea-comments"
import { cn } from "@/lib/utils"
import type { IdeaCommentNode } from "@/types/idea.types"

import { MAX_VISUAL_DEPTH } from "./CommentThread.constants"
import { ReplyComposer } from "./CommentThread.ReplyComposer"

interface CommentItemProps {
  ideaId: string
  comment: IdeaCommentNode
  depth: number
}

export function CommentItem({ ideaId, comment, depth }: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [repliesOpen, setRepliesOpen] = useState(false)

  const indentDepth = Math.min(depth, MAX_VISUAL_DEPTH)
  const replyCount = useMemo(() => getDescendantCount(comment), [comment])
  const initials = getInitials(comment.authorName)

  return (
    <li
      id={`comment-${comment.id}`}
      className={cn(
        "border-l pl-4",
        indentDepth === 0 && "border-l-transparent pl-0",
      )}
      style={{
        marginLeft:
          indentDepth > 0 ? `${(indentDepth - 1) * 16}px` : undefined,
      }}
    >
      <article className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <header className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {comment.authorName}
            </span>
            <span aria-hidden="true">·</span>
            <time dateTime={comment.createdAt}>
              {formatRelativeTime(comment.createdAt)}
            </time>
          </header>
          <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {comment.body}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={() => setReplyOpen((v) => !v)}
              aria-expanded={replyOpen}
            >
              <CornerDownRight
                className="mr-1 h-3.5 w-3.5"
                aria-hidden="true"
              />
              Responder
            </Button>
          </div>

          {replyOpen && (
            <div className="mt-3">
              <ReplyComposer
                ideaId={ideaId}
                parentCommentId={comment.id}
                onDone={() => setReplyOpen(false)}
              />
            </div>
          )}

          {comment.replies.length > 0 && (
            <div className="mt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 -ml-2 px-2 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary"
                onClick={() => setRepliesOpen((v) => !v)}
                aria-expanded={repliesOpen}
                aria-controls={`replies-${comment.id}`}
              >
                {repliesOpen ? (
                  <ChevronUp className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <ChevronDown
                    className="mr-1 h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                )}
                {repliesOpen
                  ? "Ocultar respostas"
                  : `Ver ${replyCount} ${replyCount === 1 ? "resposta" : "respostas"}`}
              </Button>
            </div>
          )}
        </div>
      </article>

      {comment.replies.length > 0 && repliesOpen && (
        <ol
          id={`replies-${comment.id}`}
          className="mt-4 flex flex-col gap-4"
          aria-label={`Respostas a ${comment.authorName}`}
        >
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              ideaId={ideaId}
              comment={reply}
              depth={depth + 1}
            />
          ))}
        </ol>
      )}
    </li>
  )
}
