"use client"

import { MessageCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { SessionComment } from "@/types/event.types"

interface CommentsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionNumber: number
  comments: SessionComment[]
  totalComments: number
}

export function CommentsModal({
  open,
  onOpenChange,
  sessionNumber,
  comments,
  totalComments,
}: CommentsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Comentarios da Sessao {sessionNumber}
          </DialogTitle>
          <DialogDescription>
            {totalComments} comentario(s) recebido(s)
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[50vh] overflow-y-auto">
          {!comments || comments.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Nenhum comentario registrado
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {comments.map((comment, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {comment.handle.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-primary">
                        @{comment.handle}
                      </p>
                      <p className="text-sm text-foreground break-words">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
