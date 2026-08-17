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

interface BlockProfileButtonProps {
  /** Arroba sem @. O componente normaliza por segurança. */
  handle: string
  size?: "sm" | "default"
  /** Quando true, o estado bloqueado/desbloqueado vem de fora (a busca já
   *  devolve `blocked` por linha) e evita esperar a lista completa carregar. */
  blocked?: boolean
}

// Botão de bloquear/desbloquear um perfil, com o diálogo de confirmação e o
// campo de motivo.
//
// Vive em shared porque a mesma ação acontece em dois lugares: no detalhe do
// cliente e na tela de Perfis bloqueados. Duplicar o diálogo duplicaria também a
// cópia que explica as consequências do bloqueio — e é justamente essa cópia que
// a lojista lê antes de confirmar.
//
// Fala "perfil", não "cliente": o caso mais comum é a conta secundária da
// PRÓPRIA loja, que instrui a audiência e acaba gerando pedido no nome dela.
export function BlockProfileButton({
  handle,
  size = "sm",
  blocked: blockedProp,
}: BlockProfileButtonProps) {
  const normalized = handle.replace(/^@+/, "").toLowerCase()
  // Só consulta a lista quando o chamador não sabe o estado — a busca da tela
  // de perfis já devolve `blocked` por linha.
  const blockedRow = useBlockedHandle(blockedProp === undefined ? normalized : undefined)
  const isBlocked = blockedProp ?? !!blockedRow

  const blockMutation = useBlockHandle()
  const unblockMutation = useUnblockHandle()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reason, setReason] = useState("")

  const isPending = blockMutation.isPending || unblockMutation.isPending

  const handleBlock = async () => {
    try {
      await blockMutation.mutateAsync({
        handle: normalized,
        reason: reason.trim() || undefined,
      })
      toast.success(`@${normalized} bloqueado`, {
        description:
          "Carrinhos abertos foram cancelados e o estoque foi devolvido.",
      })
      setReason("")
      setConfirmOpen(false)
    } catch {
      toast.error("Falha ao bloquear o perfil")
    }
  }

  const handleUnblock = async () => {
    try {
      await unblockMutation.mutateAsync(normalized)
      toast.success(`@${normalized} desbloqueado`, {
        description: "As mensagens dele voltam a gerar pedido na próxima live.",
      })
    } catch {
      toast.error("Falha ao desbloquear o perfil")
    }
  }

  if (isBlocked) {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={handleUnblock}
        disabled={isPending}
        className="gap-2"
      >
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        Desbloquear
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size={size}
        onClick={() => setConfirmOpen(true)}
        disabled={isPending}
        className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
      >
        <Ban className="h-4 w-4" aria-hidden="true" />
        Bloquear
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bloquear @{normalized}?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                As próximas mensagens desse perfil serão ignoradas em qualquer
                canal — comentário na live, comentário em post e resposta de
                story. Nenhum pedido novo será criado.
              </span>
              <span className="block">
                Carrinhos abertos serão cancelados e o estoque devolvido.{" "}
                <strong className="font-medium text-foreground">
                  Pedidos já pagos ficam intactos.
                </strong>
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="block-reason">Motivo (opcional)</Label>
            <Textarea
              id="block-reason"
              placeholder="Ex.: conta que uso para instruir a audiência"
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
