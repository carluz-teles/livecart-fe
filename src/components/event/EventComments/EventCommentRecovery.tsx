"use client"

import { useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRecoverComment } from "@/hooks/event/useRecoverComment"
import type { EventComment } from "@/types/event.types"

export function EventCommentRecovery({ eventId, comment, active }: {
  eventId: string
  comment: EventComment
  active: boolean
}) {
  const [open, setOpen] = useState(false)
  const recovery = useRecoverComment(eventId)
  if (comment.recoveryStatus === "rejected") return (
    <section aria-label="Recuperar compra" className="rounded-lg border p-4 space-y-2">
      <p className="text-sm font-medium">Recuperação interrompida</p>
      <p className="text-sm">{comment.recoveryReason || "Confira o carrinho e o evento antes de ajustar este pedido manualmente."}</p>
    </section>
  )
  if (comment.recoveryStatus) return null
  if (!recovery.canRecover || comment.result !== "no_product") return null

  return (
    <section aria-label="Recuperar compra" className="rounded-lg border p-4 space-y-3">
      <p className="text-sm text-muted-foreground">
        Já cadastrou o produto? Confira o código e a quantidade deste comentário antes de recuperar a compra.
      </p>
      {!active && <p className="text-sm">A recuperação está disponível enquanto o evento aceita pedidos.</p>}
      {recovery.isSuccess ? (
        <p role="status" className="text-sm">Solicitação registrada. Acompanhe o resultado nos comentários.</p>
      ) : (
        <AlertDialog open={open} onOpenChange={(value) => { if (!recovery.isPending) setOpen(value) }}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={!active}><RefreshCw aria-hidden className="size-4" />Recuperar comentário</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Recuperar este pedido?</AlertDialogTitle>
              <AlertDialogDescription>
                O LiveCart verificará o código e a quantidade do comentário original e tentará adicionar os itens ao carrinho. Estoque, bloqueios e prazo do evento continuam sendo respeitados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <blockquote className="border-l-2 pl-3 whitespace-pre-wrap break-words">{comment.text}</blockquote>
            {recovery.errorMessage && <p role="alert" className="text-sm text-destructive">{recovery.errorMessage}</p>}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={recovery.isPending}>Voltar</AlertDialogCancel>
              <Button disabled={recovery.isPending} onClick={() => {
                recovery.mutate(comment.id, { onSuccess: () => setOpen(false) })
              }}>
                {recovery.isPending && <Loader2 aria-hidden className="size-4 animate-spin" />}
                {recovery.isPending ? "Solicitando recuperação…" : "Confirmar recuperação"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </section>
  )
}
