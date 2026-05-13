"use client"

import { useState } from "react"
import { Ban, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
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
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  useBlockedHandle,
  useBlockHandle,
  useUnblockHandle,
} from "@/hooks/customer"
import type { Customer } from "@/types"

interface CustomerDetailBlockActionProps {
  customer: Customer
}

export function CustomerDetailBlockAction({ customer }: CustomerDetailBlockActionProps) {
  const blocked = useBlockedHandle(customer.handle)
  const blockMutation = useBlockHandle()
  const unblockMutation = useUnblockHandle()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reason, setReason] = useState("")

  const isPending = blockMutation.isPending || unblockMutation.isPending

  const handleBlock = async () => {
    try {
      await blockMutation.mutateAsync({
        handle: customer.handle,
        reason: reason.trim() || undefined,
      })
      toast.success(`@${customer.handle} bloqueado`, {
        description:
          "Carrinhos abertos foram cancelados e o estoque foi devolvido.",
      })
      setReason("")
      setConfirmOpen(false)
    } catch {
      toast.error("Falha ao bloquear cliente")
    }
  }

  const handleUnblock = async () => {
    try {
      await unblockMutation.mutateAsync(customer.handle)
      toast.success(`@${customer.handle} desbloqueado`, {
        description: "O cliente já pode comprar de novo na próxima live.",
      })
    } catch {
      toast.error("Falha ao desbloquear cliente")
    }
  }

  if (blocked) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleUnblock}
        disabled={isPending}
        className="gap-2"
      >
        <ShieldCheck className="h-4 w-4" />
        Desbloquear
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setConfirmOpen(true)}
        disabled={isPending}
        className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
      >
        <Ban className="h-4 w-4" />
        Bloquear
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bloquear @{customer.handle}?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                Carrinhos abertos serão cancelados, o estoque devolvido e os
                próximos comentários desse cliente serão ignorados.
              </span>
              <span className="block">
                Pedidos já pagos ficam intactos.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="block-reason">Motivo (opcional)</Label>
            <Textarea
              id="block-reason"
              placeholder="Ex.: gerou vários carrinhos e nunca pagou"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Só você e seu time veem isso.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlock}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {blockMutation.isPending ? "Bloqueando..." : "Bloquear"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
