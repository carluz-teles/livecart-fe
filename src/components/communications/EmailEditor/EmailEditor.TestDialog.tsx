"use client"

import { useEffect, useState } from "react"
import { Loader2, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EmailTestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultRecipient?: string
  isSending: boolean
  onConfirm: (recipientEmail: string) => Promise<void>
}

export function EmailEditorTestDialog({
  open,
  onOpenChange,
  defaultRecipient,
  isSending,
  onConfirm,
}: EmailTestDialogProps) {
  const [recipient, setRecipient] = useState(defaultRecipient ?? "")

  useEffect(() => {
    if (open) setRecipient(defaultRecipient ?? "")
  }, [open, defaultRecipient])

  const submit = async () => {
    if (!recipient.trim()) return
    try {
      await onConfirm(recipient.trim())
      onOpenChange(false)
    } catch {
      // toast already handled in mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Testar email</DialogTitle>
          <DialogDescription>
            Vamos enviar um email com este template + dados de exemplo para você
            ver o resultado real na caixa de entrada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="email-test-recipient">Email destinatário</Label>
          <Input
            id="email-test-recipient"
            type="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="seu@email.com"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Pré-preenchemos com seu email do dashboard.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={isSending || !recipient.trim()}>
            {isSending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-1.5 h-4 w-4" />
            )}
            Enviar teste
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
