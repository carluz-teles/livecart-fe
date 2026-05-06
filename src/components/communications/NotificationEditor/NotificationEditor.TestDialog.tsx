"use client"

import { useEffect, useState } from "react"
import { Copy, Send, CheckCircle2, RefreshCw, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useStartTestSetup,
  useTestNotification,
  useTestRecipient,
} from "@/hooks/communications"
import type { NotificationType } from "@/types/notification.types"

interface NotificationEditorTestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: NotificationType
  template: string
}

export function NotificationEditorTestDialog({
  open,
  onOpenChange,
  type,
  template,
}: NotificationEditorTestDialogProps) {
  const recipientQuery = useTestRecipient({ pollWhileSetupActive: open })
  const startSetup = useStartTestSetup()
  const sendTest = useTestNotification()

  const recipient = recipientQuery.data
  const setupActive = recipient?.setup_code_active ?? false
  const configured = recipient?.configured ?? false

  // When the user completes the setup flow externally (sends DM), we surface
  // a friendly confirmation instead of leaving them on the polling screen.
  const [justConfigured, setJustConfigured] = useState(false)
  useEffect(() => {
    if (configured && setupActive === false && open) {
      // Polling found us configured — leave a transient highlight.
      setJustConfigured(true)
      const t = setTimeout(() => setJustConfigured(false), 4000)
      return () => clearTimeout(t)
    }
    return
  }, [configured, setupActive, open])

  const copyCode = () => {
    if (!recipient?.setup_code) return
    navigator.clipboard.writeText(recipient.setup_code).catch(() => undefined)
    toast.success("Código copiado")
  }

  const startSetupFlow = () => {
    startSetup.mutate()
  }

  const send = () => {
    sendTest.mutate(
      { type, template },
      {
        onSuccess: () => onOpenChange(false),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Testar notificação</DialogTitle>
          <DialogDescription>
            {configured
              ? "Vamos enviar essa mensagem agora pelo Instagram pro destinatário configurado."
              : "Configure um destinatário pra receber as notificações de teste."}
          </DialogDescription>
        </DialogHeader>

        {recipientQuery.isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : configured ? (
          <ConfiguredState
            handle={recipient?.handle}
            highlight={justConfigured}
            onReconfigure={startSetupFlow}
            isReconfiguring={startSetup.isPending}
          />
        ) : setupActive ? (
          <SetupActiveState
            code={recipient?.setup_code ?? ""}
            onCopy={copyCode}
          />
        ) : (
          <NoRecipientState
            onStart={startSetupFlow}
            isStarting={startSetup.isPending}
          />
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {configured && (
            <Button onClick={send} disabled={sendTest.isPending}>
              {sendTest.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-1.5 h-4 w-4" />
              )}
              Enviar agora
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function NoRecipientState({
  onStart,
  isStarting,
}: {
  onStart: () => void
  isStarting: boolean
}) {
  return (
    <div className="space-y-3 rounded-md border bg-muted/40 p-4 text-sm">
      <p className="text-muted-foreground">
        Pra testar de verdade, a gente precisa de uma conta do Instagram que
        possa receber a DM. Você vai mandar um código rapidinho do seu IG
        pessoal pro @ da loja — e a gente captura quem é você.
      </p>
      <Button onClick={onStart} disabled={isStarting}>
        {isStarting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
        Configurar destinatário
      </Button>
    </div>
  )
}

function SetupActiveState({
  code,
  onCopy,
}: {
  code: string
  onCopy: () => void
}) {
  return (
    <div className="space-y-3">
      <ol className="space-y-2 text-sm text-muted-foreground">
        <li>1. Abra o Instagram no seu celular</li>
        <li>2. Vá até a conversa com o @ da sua loja</li>
        <li>3. Mande este código:</li>
      </ol>
      <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-3">
        <code className="flex-1 font-mono text-base font-semibold tracking-wide">
          {code}
        </code>
        <Button variant="outline" size="sm" onClick={onCopy} className="h-8">
          <Copy className="mr-1.5 h-3.5 w-3.5" />
          Copiar
        </Button>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Aguardando você mandar a DM... Esta página atualiza sozinha.
      </p>
    </div>
  )
}

function ConfiguredState({
  handle,
  highlight,
  onReconfigure,
  isReconfiguring,
}: {
  handle?: string
  highlight: boolean
  onReconfigure: () => void
  isReconfiguring: boolean
}) {
  return (
    <div className="space-y-3">
      <div
        className={`flex items-center gap-3 rounded-md border bg-card p-3 transition-colors ${
          highlight ? "border-emerald-500/40 bg-emerald-500/5" : ""
        }`}
      >
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        <div className="flex-1">
          <p className="text-sm font-medium">Destinatário configurado</p>
          <p className="text-xs text-muted-foreground">
            {handle ? `@${handle}` : "Conta do Instagram capturada via DM"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReconfigure}
          disabled={isReconfiguring}
        >
          {isReconfiguring ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          )}
          Trocar
        </Button>
      </div>
    </div>
  )
}
