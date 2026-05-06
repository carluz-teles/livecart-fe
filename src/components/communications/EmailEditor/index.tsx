"use client"

import { useEffect, useRef, useState } from "react"
import { Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEmailCommunication } from "@/hooks/communications"
import type { PostPaymentNotificationType } from "@/types/notification.types"

import { NotificationEditorHeader } from "../NotificationEditor/NotificationEditor.Header"
import { NotificationEditorFooter } from "../NotificationEditor/NotificationEditor.Footer"

import {
  EmailMessageEditor,
  type EmailMessageEditorHandle,
} from "./EmailEditor.MessageEditor"
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

  useEffect(() => {
    if (isLoading) return
    const initial = {
      enabled: template?.enabled ?? true,
      subject: template?.subject ?? "",
      bodyHTML: template?.body_html ?? "",
    }
    setEnabled(initial.enabled)
    setSubject(initial.subject)
    setBodyHTML(initial.bodyHTML)
    setSnapshot(initial)
  }, [isLoading, template])

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

  return (
    <div className="flex flex-col gap-6">
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

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-4">
          <div className="rounded-md border bg-card p-5">
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

          <EmailMessageEditor
            ref={editorRef}
            initialHTML={bodyHTML}
            variables={variables}
            onHTMLChange={setBodyHTML}
          />
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-md border bg-card p-5">
            <h2 className="text-sm font-medium tracking-tight mb-4">Prévia</h2>
            <div className="rounded-md border bg-white p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Assunto
              </p>
              <p className="font-medium text-sm mb-4">
                {subject || `Pedido #1234 · Sua loja`}
              </p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Corpo
              </p>
              <div
                className="email-editor-content text-[15px] leading-[1.6] text-foreground"
                dangerouslySetInnerHTML={{
                  __html:
                    bodyHTML ||
                    `<p style="color:hsl(var(--muted-foreground));font-style:italic">Vazio: usaremos o template padrão da LiveCart.</p>`,
                }}
              />
            </div>
            <p className="mt-3 text-[11px] text-center text-muted-foreground">
              No envio real, o email vem dentro de um shell com logo da loja e rodapé.
            </p>
          </div>
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
EmailEditor.TestDialog = EmailEditorTestDialog

export { EmailEditor }
