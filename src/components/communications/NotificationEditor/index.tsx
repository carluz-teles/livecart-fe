"use client"

import { useEffect, useRef, useState } from "react"
import { Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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

  // Idempotente por VALOR: o react-query devolve um objeto novo a cada
  // refetch (foco de janela incluso) e o efeito re-executa; sem este guard,
  // o sync abaixo sobrescreveria o texto que o lojista está digitando com o
  // salvo do servidor.
  const appliedLoadKey = useRef("")

  useEffect(() => {
    if (isLoading) return
    const fallback = defaultTemplates[type]
    const initialEnabled = template?.enabled ?? false
    const initialTemplate = template?.template ?? fallback
    const initialMinutes = cartSettings?.expirationReminderMinutes ?? 15

    const loadKey = `${type}|${initialEnabled}|${initialMinutes}|${initialTemplate}`
    if (appliedLoadKey.current === loadKey) return
    appliedLoadKey.current = loadKey

    setEnabled(initialEnabled)
    setDraft(initialTemplate)
    setReminderMinutes(initialMinutes)
    setSnapshot({
      enabled: initialEnabled,
      template: initialTemplate,
      reminderMinutes: initialMinutes,
    })
    // O TipTap inicializa com o conteúdo disponível NA MONTAGEM; quando as
    // settings chegam depois, só o estado `draft` era atualizado — o editor
    // mostrava o template default e a prévia (que segue o draft) mostrava o
    // salvo: duas mensagens diferentes na mesma tela (20/08/2026).
    editorRef.current?.setTemplate(initialTemplate)
  }, [isLoading, template, cartSettings, type])

  const dirty =
    enabled !== snapshot.enabled ||
    draft !== snapshot.template ||
    false

  const handleSave = async () => {
    await save({
      enabled,
      template: draft,
      expirationReminderMinutes:
        undefined,
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

  // Montar o editor antes das settings chegarem foi a raiz da prévia
  // divergente — o skeleton segura a montagem até existir UMA verdade.
  if (isLoading) {
    return (
      <div className="flex min-h-full flex-col gap-4">
        <Skeleton className="h-16 w-full rounded-md" />
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <Skeleton className="h-[520px] rounded-xl" />
          <Skeleton className="h-[520px] rounded-xl" />
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
            <Zap className="mr-1.5 h-4 w-4" />
            Testar mensagem
          </Button>
        }
      />

      {/* Dois cards com altura NATURAL (mockup 20/08/2026): nada de fração
          da viewport com rolagem interna — o conteúdo define a altura e a
          página rola quando precisar, sem scroll de mouse dentro dos painéis
          em monitor menor. */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="flex flex-col rounded-xl border bg-card p-5 sm:p-6">
          <NotificationEditorTriggerConfig
            type={type}
            expirationReminderMinutes={reminderMinutes}
            cartExpirationMinutes={cartSettings?.expirationMinutes ?? 30}
            onMinutesChange={setReminderMinutes}
          />

          <div className="mb-3 mt-6">
            <h2 className="text-sm font-semibold tracking-tight">Mensagem</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Personalize o conteúdo da mensagem enviada na DM do Instagram.
            </p>
          </div>
          <div className="flex flex-1 flex-col">
            <MessageEditor
              ref={editorRef}
              initialTemplate={draft}
              defaultTemplate={defaultTemplates[type]}
              variables={variables}
              onTemplateChange={setDraft}
            />
          </div>
        </section>

        {/* Os dois cards têm a MESMA altura (linha do grid = o mais alto); o
            miolo flexível de cada um — editor de um lado, fundo do chat do
            outro — absorve a folga. Sem altura fixa, sem rolagem interna. */}
        <section className="flex flex-col rounded-xl border bg-card p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold tracking-tight">
              Prévia da mensagem
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Veja como sua mensagem aparecerá para o cliente no Instagram.
            </p>
          </div>
          <div className="flex flex-1 flex-col">
            <InstagramPreview storeName="minhaloja" message={previewText} />
          </div>
        </section>
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
// Valores de exemplo da PRÉ-VISUALIZAÇÃO. Toda variável oferecida pelo menu
// precisa estar aqui: o que falta sai literal no preview, e era o caso de
// {evento}, {sessao}, {prazo_final} e {comeca_em} — as variáveis da campanha,
// oferecidas pelo backend e mostradas cruas justamente nos textos que existem
// para explicar o modelo. Idem as de pós-pagamento.
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
  // Campanha e transmissão.
  evento: "Semana Black",
  live_titulo: "Semana Black",
  sessao: "Live de segunda",
  prazo_final: "09/11 às 23h59",
  comeca_em: "03/11 às 20h",
  tempo_extra: "30 minutos",
  // Pós-pagamento (e-mail).
  nome_cliente: "Ana Reis",
  numero_pedido: "1234",
  lista_produtos: "2× Vestido Linho — R$ 247,80",
  forma_pagamento: "PIX",
  link_pedido: "livecart.app/order/1234",
  transportadora: "Sedex via Correios",
  tracking_code: "BR123456789BR",
  prazo_entrega: "até 5 dias úteis",
  endereco_entrega: "Rua das Flores, 123 — São Paulo/SP",
  valor_frete: "R$ 18,90",
}

function renderWithSamples(template: string): string {
  return template.replace(/\{([a-z_]+)\}/g, (_, name: string) => SAMPLE[name] ?? `{${name}}`)
}
