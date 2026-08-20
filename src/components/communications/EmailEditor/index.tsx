"use client"

import { useEffect, useRef, useState } from "react"
import { Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEmailCommunication } from "@/hooks/communications"
import { useStore } from "@/hooks/store/useStore"
import type { PostPaymentNotificationType } from "@/types/notification.types"

import { NotificationEditorHeader } from "../NotificationEditor/NotificationEditor.Header"
import { NotificationEditorFooter } from "../NotificationEditor/NotificationEditor.Footer"

import {
  EmailMessageEditor,
  type EmailMessageEditorHandle,
} from "./EmailEditor.MessageEditor"
import { EmailEditorPreview } from "./EmailEditor.Preview"
import { EmailEditorTestDialog } from "./EmailEditor.TestDialog"

interface EmailEditorProps {
  type: PostPaymentNotificationType
}

function EmailEditor({ type }: EmailEditorProps) {
  const {
    isLoading,
    meta,
    template,
    variables,
    ownerEmail,
    save,
    isSaving,
    sendTest,
    isSendingTest,
  } = useEmailCommunication(type)
  const { data: store } = useStore()

  const [enabled, setEnabled] = useState(true)
  const [subject, setSubject] = useState("")
  const [bodyHTML, setBodyHTML] = useState("")
  const [testOpen, setTestOpen] = useState(false)
  const editorRef = useRef<EmailMessageEditorHandle | null>(null)
  const [snapshot, setSnapshot] = useState({
    enabled: true,
    subject: "",
    bodyHTML: "",
  })

  // Idempotente por VALOR — mesmo guard do editor de DM: refetch (foco de
  // janela) re-executa o efeito e sobrescreveria o que o lojista digita.
  const appliedLoadKey = useRef("")

  useEffect(() => {
    if (isLoading) return
    const initial = {
      enabled: template?.enabled ?? true,
      subject: template?.subject ?? "",
      bodyHTML: template?.body_html ?? "",
    }
    const loadKey = `${type}|${initial.enabled}|${initial.subject}|${initial.bodyHTML}`
    if (appliedLoadKey.current === loadKey) return
    appliedLoadKey.current = loadKey
    setEnabled(initial.enabled)
    setSubject(initial.subject)
    setBodyHTML(initial.bodyHTML)
    setSnapshot(initial)
    // Mesmo sync do editor de DM: o TipTap monta antes das settings chegarem
    // e sem isto o corpo editado e a prévia contavam histórias diferentes.
    editorRef.current?.setHTML(initial.bodyHTML)
  }, [isLoading, template, type])

  const dirty =
    enabled !== snapshot.enabled ||
    subject !== snapshot.subject ||
    bodyHTML !== snapshot.bodyHTML

  const handleSave = async () => {
    await save({ enabled, subject, bodyHTML })
    setSnapshot({ enabled, subject, bodyHTML })
  }

  const handleDiscard = () => {
    setEnabled(snapshot.enabled)
    setSubject(snapshot.subject)
    setBodyHTML(snapshot.bodyHTML)
    editorRef.current?.setHTML(snapshot.bodyHTML)
  }

  const handleSendTest = async (recipientEmail: string) => {
    await sendTest(recipientEmail, { enabled, subject, bodyHTML })
  }


  // Mesma regra do editor de DM: montar antes das settings chegarem cria duas
  // verdades (corpo editado × prévia). Skeleton até existir uma só.
  if (isLoading) {
    return (
      <div className="flex min-h-full flex-col gap-4">
        <Skeleton className="h-16 w-full rounded-md" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[clamp(300px,48dvh,600px)] rounded-md" />
          <Skeleton className="h-[clamp(300px,48dvh,600px)] rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col gap-4">
      <NotificationEditorHeader
        title={meta.title}
        description={meta.description}
        Icon={meta.Icon}
        enabled={enabled}
        onEnabledChange={setEnabled}
        trailing={
          <Button
            type="button"
            variant="outline"
            onClick={() => setTestOpen(true)}
          >
            <Mail className="mr-1.5 h-4 w-4" />
            Testar email
          </Button>
        }
      />

      {/* Altura fluida com piso e teto: em notebook (lg de LARGURA, mas
          baixo de ALTURA) o antigo flex-1/min-h-0 espremia o editor e cortava
          o preview; agora cada painel tem ~45dvh com rolagem própria e a
          página rola quando precisar. */}
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-4">
          <div className="shrink-0 rounded-md border bg-card p-5">
            <Label htmlFor="email-subject" className="text-sm font-medium">
              Assunto
            </Label>
            <Input
              id="email-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Pedido #{numero_pedido} confirmado"
              className="mt-2"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Vazio = usa o assunto padrão &quot;Pedido #X · Sua loja&quot;.
            </p>
          </div>

          <div className="flex h-[clamp(300px,48dvh,600px)] flex-col">
            <EmailMessageEditor
              ref={editorRef}
              initialHTML={bodyHTML}
              variables={variables}
              onHTMLChange={setBodyHTML}
            />
          </div>
        </div>

        <aside className="flex h-[clamp(300px,48dvh,600px)] flex-col lg:sticky lg:top-4">
          <EmailEditorPreview
            type={type}
            subject={subject}
            bodyHTML={bodyHTML}
            storeName={store?.name}
            storeLogoUrl={store?.logoUrl ?? undefined}
            ownerEmail={ownerEmail}
          />
        </aside>
      </div>

      <NotificationEditorFooter
        dirty={dirty}
        saving={isSaving}
        onCancel={handleDiscard}
        onSave={handleSave}
      />

      <EmailEditorTestDialog
        open={testOpen}
        onOpenChange={setTestOpen}
        defaultRecipient={ownerEmail}
        isSending={isSendingTest}
        onConfirm={handleSendTest}
      />
    </div>
  )
}

EmailEditor.MessageEditor = EmailMessageEditor
EmailEditor.Preview = EmailEditorPreview
EmailEditor.TestDialog = EmailEditorTestDialog

export { EmailEditor }
