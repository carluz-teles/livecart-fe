"use client"

import { useEffect, useRef, useState } from "react"
import { Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_460px]">
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
          <EmailEditorPreview
            subject={subject}
            bodyHTML={bodyHTML}
            storeName={store?.name}
            storeSlug={store?.slug}
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
