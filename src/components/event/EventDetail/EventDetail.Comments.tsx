"use client"

import { use, useState } from "react"
import {
  EyeOff,
  Loader2,
  MessageCircle,
  MessageSquareReply,
  Trash2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useEventComments,
  useReplyComment,
  useHideComment,
  useDeleteComment,
} from "@/hooks/event"
import type { EventComment } from "@/types/event.types"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailComments() {
  const ctx = use(EventDetailContext)
  const eventId = ctx?.state.event.id ?? ""
  const { data: comments, isLoading } = useEventComments(eventId)

  const [replyFor, setReplyFor] = useState<EventComment | null>(null)
  const [replyText, setReplyText] = useState("")
  const [deleteFor, setDeleteFor] = useState<EventComment | null>(null)

  const reply = useReplyComment(eventId)
  const hide = useHideComment(eventId)
  const del = useDeleteComment(eventId)

  if (!ctx) return null

  const submitReply = () => {
    if (!replyFor || !replyText.trim()) return
    reply.mutate(
      { commentId: replyFor.platformCommentId, text: replyText.trim() },
      {
        onSuccess: () => {
          setReplyFor(null)
          setReplyText("")
        },
      }
    )
  }

  const confirmDelete = () => {
    if (!deleteFor) return
    del.mutate(deleteFor.platformCommentId, { onSuccess: () => setDeleteFor(null) })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="h-4 w-4" />
              Comentários
            </CardTitle>
            <CardDescription>
              Responda, oculte ou exclua comentários da live no Instagram
            </CardDescription>
          </div>
          {comments && comments.length > 0 && (
            <Badge variant="secondary">{comments.length} comentário(s)</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-md border p-3">
                <Skeleton className="h-7 w-7 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-48" />
                </div>
              </div>
            ))
          ) : !comments || comments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-muted-foreground">Nenhum comentário ainda</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentRow
                key={comment.id}
                comment={comment}
                onReply={() => {
                  setReplyFor(comment)
                  setReplyText("")
                }}
                onHide={(hidden) =>
                  hide.mutate({ commentId: comment.platformCommentId, hidden })
                }
                onDelete={() => setDeleteFor(comment)}
                hidePending={hide.isPending}
                deletePending={del.isPending}
              />
            ))
          )}
        </div>
      </CardContent>

      {/* Reply dialog (creates a public reply comment on Instagram) */}
      <Dialog open={!!replyFor} onOpenChange={(open) => !open && setReplyFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Responder comentário</DialogTitle>
            <DialogDescription>
              Sua resposta será publicada como comentário no Instagram, em resposta a
              @{replyFor?.handle}.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Escreva sua resposta..."
            rows={3}
            maxLength={1000}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyFor(null)}>
              Cancelar
            </Button>
            <Button onClick={submitReply} disabled={!replyText.trim() || reply.isPending}>
              {reply.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publicar resposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteFor} onOpenChange={(open) => !open && setDeleteFor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir comentário?</AlertDialogTitle>
            <AlertDialogDescription>
              O comentário de @{deleteFor?.handle} será removido permanentemente do
              Instagram. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

interface CommentRowProps {
  comment: EventComment
  onReply: () => void
  onHide: (hidden: boolean) => void
  onDelete: () => void
  hidePending: boolean
  deletePending: boolean
}

function CommentRow({
  comment,
  onReply,
  onHide,
  onDelete,
  hidePending,
  deletePending,
}: CommentRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
        {comment.handle.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">@{comment.handle}</span>
          {comment.hasPurchaseIntent && (
            <Badge variant="secondary" className="text-xs">
              intenção de compra
            </Badge>
          )}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{comment.text}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onReply}>
                <MessageSquareReply className="h-4 w-4" />
                <span className="sr-only">Responder comentário</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Responder (comentário público)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onHide(true)}
                disabled={hidePending}
              >
                {hidePending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                <span className="sr-only">Ocultar comentário</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ocultar / reexibir comentário</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={onDelete}
                disabled={deletePending}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Excluir comentário</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Excluir comentário</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
