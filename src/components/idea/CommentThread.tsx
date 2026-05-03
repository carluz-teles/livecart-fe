"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CornerDownRight } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { useCreateComment } from "@/hooks/idea"
import { createCommentSchema, type CreateCommentFormData } from "@/schemas/idea.schema"
import { formatRelativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { IdeaCommentNode } from "@/types/idea.types"

const MAX_VISUAL_DEPTH = 4

interface CommentThreadProps {
  ideaId: string
  comments: IdeaCommentNode[]
}

export function CommentThread({ ideaId, comments }: CommentThreadProps) {
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

interface CommentItemProps {
  ideaId: string
  comment: IdeaCommentNode
  depth: number
}

function CommentItem({ ideaId, comment, depth }: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false)

  const indentDepth = Math.min(depth, MAX_VISUAL_DEPTH)
  const initials = comment.authorName
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?"

  return (
    <li
      id={`comment-${comment.id}`}
      className={cn(
        "border-l pl-4",
        indentDepth === 0 && "border-l-transparent pl-0",
      )}
      style={{ marginLeft: indentDepth > 0 ? `${(indentDepth - 1) * 16}px` : undefined }}
    >
      <article className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <header className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{comment.authorName}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={comment.createdAt}>{formatRelativeTime(comment.createdAt)}</time>
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
              <CornerDownRight className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
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
        </div>
      </article>

      {comment.replies.length > 0 && (
        <ol className="mt-4 flex flex-col gap-4" aria-label={`Respostas a ${comment.authorName}`}>
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

interface ReplyComposerProps {
  ideaId: string
  parentCommentId?: string
  onDone?: () => void
  autoFocus?: boolean
}

export function ReplyComposer({ ideaId, parentCommentId, onDone, autoFocus }: ReplyComposerProps) {
  const createComment = useCreateComment(ideaId)
  const form = useForm<CreateCommentFormData>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: { body: "", parentCommentId },
  })

  function handleSubmit(values: CreateCommentFormData) {
    createComment.mutate(
      { body: values.body, parentCommentId: parentCommentId ?? undefined },
      {
        onSuccess: () => {
          form.reset({ body: "", parentCommentId })
          onDone?.()
        },
        onError: (err: { message?: string }) => {
          toast.error("Erro ao publicar comentário", {
            description: err.message || "Tente novamente em instantes.",
          })
        },
      },
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  rows={3}
                  autoFocus={autoFocus}
                  placeholder={parentCommentId ? "Escreva uma resposta..." : "Adicione um comentário..."}
                  maxLength={5000}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-end gap-2">
          {onDone && (
            <Button type="button" variant="ghost" size="sm" onClick={onDone}>
              Cancelar
            </Button>
          )}
          <Button type="submit" size="sm" disabled={createComment.isPending}>
            {createComment.isPending ? "Enviando..." : parentCommentId ? "Responder" : "Comentar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
