"use client"

import { use, useState } from "react"
import { Check, Copy, Mail, MessageCircle } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { formatDateTime } from "@/lib/format"
import { OrderDetailContext } from "./OrderDetailContext"

// Routes the regenerate-checkout flow end to end. Mounted once by the
// Provider so any trigger (Payment alert, Actions dropdown) just calls
// requestRegenerate() and gets the same confirm + share sheet UI.
export function OrderDetailRegenerateController() {
  const ctx = use(OrderDetailContext)
  if (!ctx) return null

  const { regenerate, order } = ctx.state
  const {
    cancelRegenerate,
    confirmRegenerate,
    closeRegenerateShare,
  } = ctx.actions

  return (
    <>
      <AlertDialog
        open={regenerate.confirmOpen}
        onOpenChange={(open) => {
          if (!open) cancelRegenerate()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reabrir checkout?</AlertDialogTitle>
            <AlertDialogDescription>
              Vamos gerar um novo prazo para o cliente concluir o pagamento.
              O link atual deixa de funcionar — use a próxima tela para
              compartilhar o novo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRegenerate}
              disabled={regenerate.isPending}
            >
              {regenerate.isPending ? "Gerando…" : "Gerar novo link"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!regenerate.share}
        onOpenChange={(open) => {
          if (!open) closeRegenerateShare()
        }}
      >
        {regenerate.share && (
          <ShareSheet
            url={regenerate.share.url}
            expiresAt={regenerate.share.expiresAt}
            customerName={order.customer?.name ?? ""}
            customerPhone={order.customer?.phone ?? ""}
            customerEmail={order.customer?.email ?? ""}
            shortId={order.shortId}
          />
        )}
      </Dialog>
    </>
  )
}

interface ShareSheetProps {
  url: string
  expiresAt: string
  customerName: string
  customerPhone: string
  customerEmail: string
  shortId: number
}

function ShareSheet({
  url,
  expiresAt,
  customerName,
  customerPhone,
  customerEmail,
  shortId,
}: ShareSheetProps) {
  const [copied, setCopied] = useState(false)

  const greeting = customerName ? `Olá, ${customerName.split(" ")[0]}!` : "Olá!"
  const message = `${greeting} Aqui está o link para finalizar seu pedido #${shortId}: ${url}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Link copiado")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Não foi possível copiar")
    }
  }

  // wa.me strips non-digits — we sanitize so the link works regardless of the
  // BR-formatted phone the customer typed at checkout (e.g. "+55 (11) 9...").
  const whatsappHref = customerPhone
    ? `https://wa.me/${customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    : null

  const emailHref = customerEmail
    ? `mailto:${customerEmail}?subject=${encodeURIComponent(`Finalize seu pedido #${shortId}`)}&body=${encodeURIComponent(message)}`
    : null

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Checkout reaberto</DialogTitle>
        <DialogDescription>
          Novo prazo até {formatDateTime(expiresAt)}.
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-center gap-2">
        <Input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="font-mono text-xs"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleCopy}
          aria-label="Copiar link"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {whatsappHref ? (
          <Button asChild variant="outline">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </a>
          </Button>
        ) : (
          <Button variant="outline" disabled title="Cliente sem telefone">
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>
        )}
        {emailHref ? (
          <Button asChild variant="outline">
            <a href={emailHref}>
              <Mail className="mr-2 h-4 w-4" />
              E-mail
            </a>
          </Button>
        ) : (
          <Button variant="outline" disabled title="Cliente sem e-mail">
            <Mail className="mr-2 h-4 w-4" />
            E-mail
          </Button>
        )}
      </div>
    </DialogContent>
  )
}
