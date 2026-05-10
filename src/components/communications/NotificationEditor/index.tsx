"use client"

import { useEffect, useRef, useState } from "react"
import { Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCommunication } from "@/hooks/communications"
import { defaultTemplates } from "@/schemas/checkout-settings.schema"
import type { CartNotificationType } from "@/types/notification.types"

import { InstagramPreview } from "../InstagramPreview"
import {
  MessageEditor,
  type MessageEditorHandle,
} from "./MessageEditor"
import { NotificationEditorHeader } from "./NotificationEditor.Header"
import { NotificationEditorTriggerConfig } from "./NotificationEditor.TriggerConfig"
import { NotificationEditorTestDialog } from "./NotificationEditor.TestDialog"
import { NotificationEditorFooter } from "./NotificationEditor.Footer"

interface NotificationEditorProps {
  type: CartNotificationType
}

function NotificationEditor({ type }: NotificationEditorProps) {
  const {
    isLoading,
    meta,
    template,
    variables,
    cartSettings,
    save,
    isSaving,
  } = useCommunication(type)

  // Local form state — kept in sync with server state on (re)load.
  const [enabled, setEnabled] = useState(false)
  const [draft, setDraft] = useState("")
  const [reminderMinutes, setReminderMinutes] = useState(15)
  const [testOpen, setTestOpen] = useState(false)
  const editorRef = useRef<MessageEditorHandle | null>(null)

  // Snapshot for diffing
  const [snapshot, setSnapshot] = useState({
    enabled: false,
    template: "",
    reminderMinutes: 15,
  })

  useEffect(() => {
    if (isLoading) return
    const fallback = defaultTemplates[type]
    const initialEnabled = template?.enabled ?? false
    const initialTemplate = template?.template ?? fallback
    const initialMinutes = cartSettings?.expirationReminderMinutes ?? 15

    setEnabled(initialEnabled)
    setDraft(initialTemplate)
    setReminderMinutes(initialMinutes)
    setSnapshot({
      enabled: initialEnabled,
      template: initialTemplate,
      reminderMinutes: initialMinutes,
    })
  }, [isLoading, template, cartSettings, type])

  const dirty =
    enabled !== snapshot.enabled ||
    draft !== snapshot.template ||
    (type === "checkout_reminder" && reminderMinutes !== snapshot.reminderMinutes)

  const handleSave = async () => {
    await save({
      enabled,
      template: draft,
      expirationReminderMinutes:
        type === "checkout_reminder" ? reminderMinutes : undefined,
    })
    setSnapshot({ enabled, template: draft, reminderMinutes })
  }

  const handleDiscard = () => {
    setEnabled(snapshot.enabled)
    setReminderMinutes(snapshot.reminderMinutes)
    setDraft(snapshot.template)
    editorRef.current?.setTemplate(snapshot.template)
  }

  // Render-time preview text (variables become friendly tokens like @cliente)
  // We render with sample values so the lojista sees the real shape of the DM.
  const previewText = renderWithSamples(draft)

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
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
            <Zap className="mr-1.5 h-4 w-4" />
            Testar notificação
          </Button>
        }
      />

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2 lg:grid-rows-1">
        <div className="flex min-h-0 flex-col gap-4">
          <NotificationEditorTriggerConfig
            type={type}
            expirationReminderMinutes={reminderMinutes}
            cartExpirationMinutes={cartSettings?.expirationMinutes ?? 30}
            onMinutesChange={setReminderMinutes}
          />
          <div className="flex min-h-0 flex-1 flex-col">
            <MessageEditor
              ref={editorRef}
              initialTemplate={draft}
              defaultTemplate={defaultTemplates[type]}
              variables={variables}
              onTemplateChange={setDraft}
            />
          </div>
        </div>

        <aside className="flex min-h-0 flex-col">
          <InstagramPreview storeName="minhaloja" message={previewText} />
        </aside>
      </div>

      <NotificationEditorFooter
        dirty={dirty}
        saving={isSaving}
        onCancel={handleDiscard}
        onSave={handleSave}
      />

      <NotificationEditorTestDialog
        open={testOpen}
        onOpenChange={setTestOpen}
        type={type}
        template={draft}
      />
    </div>
  )
}

NotificationEditor.Header = NotificationEditorHeader
NotificationEditor.TriggerConfig = NotificationEditorTriggerConfig
NotificationEditor.MessageEditor = MessageEditor
NotificationEditor.TestDialog = NotificationEditorTestDialog
NotificationEditor.Footer = NotificationEditorFooter

export { NotificationEditor }

// Sample values used to render the live preview. Mirrors BE notification.SampleVariables.
const SAMPLE: Record<string, string> = {
  handle: "@julia",
  produto: "Vestido Linho",
  keyword: "ABCD",
  quantidade: "2",
  total_itens: "3",
  total: "R$ 247,80",
  link: "livecart.io/c/A8K2",
  loja: "Minha Loja",
  expira_em: "15 minutos",
  live_titulo: "Black Friday 2026",
}

function renderWithSamples(template: string): string {
  return template.replace(/\{([a-z_]+)\}/g, (_, name: string) => SAMPLE[name] ?? `{${name}}`)
}
