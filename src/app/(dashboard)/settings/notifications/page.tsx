"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  MessageSquare,
  Loader2,
  Eye,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react"

// Simple debounce implementation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { storeService } from "@/services/api/store.service"
import { notificationService } from "@/services/api/notification.service"
import type { TemplateVariable, TemplateSettings } from "@/types/notification.types"

const MAX_CHARS = 1000

// Friendly names for template variables
const variableFriendlyNames: Record<string, string> = {
  "{handle}": "@ Perfil",
  "{produto}": "Produto",
  "{keyword}": "Palavra-chave",
  "{quantidade}": "Quantidade",
  "{total_itens}": "Nº de itens",
  "{total}": "Valor total",
  "{link}": "Link",
  "{loja}": "Nome da loja",
  "{expira_em}": "Tempo restante",
  "{live_titulo}": "Título da live",
}

// Convert technical variables to display format: {handle} -> {@ Perfil}
function toDisplayFormat(template: string): string {
  let result = template
  for (const [technical, friendly] of Object.entries(variableFriendlyNames)) {
    result = result.replaceAll(technical, `{${friendly}}`)
  }
  return result
}

// Convert display format back to technical: {@ Perfil} -> {handle}
function toTechnicalFormat(template: string): string {
  let result = template
  for (const [technical, friendly] of Object.entries(variableFriendlyNames)) {
    result = result.replaceAll(`{${friendly}}`, technical)
  }
  return result
}

const templateSettingsSchema = z.object({
  enabled: z.boolean(),
  template: z.string().min(1, "Template não pode estar vazio").max(1500),
})

const notificationSettingsSchema = z.object({
  checkout_immediate: templateSettingsSchema.nullable(),
  item_added: templateSettingsSchema.nullable(),
  checkout_reminder: templateSettingsSchema.nullable(),
})

type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>

// Default templates
const defaultTemplates = {
  // Mensagem durante a live - quando cliente pede um produto
  checkout_immediate:
    "Oi {handle}! 🛒\n\nAnotei seu pedido de {produto}!\n\nSeu carrinho: {total}\n\nQuando quiser finalizar: {link}",
  // Mensagem de fim de live - quando a live termina (informativo)
  item_added:
    "Oi {handle}! 👋\n\nSeu carrinho foi fechado!\n\nSeus itens estão esperando por você:\n🛒 {total_itens} itens - {total}\n\nFinalize quando quiser: {link}\n\n⏰ Válido por {expira_em}",
  // Lembrete de expiração - antes do carrinho expirar
  checkout_reminder:
    "Ei {handle}! ⏰\n\nSeu carrinho vai expirar em breve!\n\n{total_itens} itens - {total}\n\nFinaliza logo: {link}",
}

interface TemplateEditorProps {
  title: string
  description: string
  typeKey: "checkout_immediate" | "item_added" | "checkout_reminder"
  settings: TemplateSettings | null
  onChange: (settings: TemplateSettings | null) => void
  onPreview: (template: string) => Promise<{ preview: string; charCount: number; isValid: boolean; error?: string }>
  variables: TemplateVariable[]
}

function TemplateEditor({
  title,
  description,
  typeKey,
  settings,
  onChange,
  onPreview,
  variables,
}: TemplateEditorProps) {
  const [preview, setPreview] = useState<string>("")
  const [charCount, setCharCount] = useState<number>(0)
  const [isValid, setIsValid] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)

  const enabled = settings?.enabled ?? false
  const template = settings?.template ?? defaultTemplates[typeKey]
  // Display template with friendly variable names
  const displayTemplate = toDisplayFormat(template)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedPreview = useCallback(
    debounce(async (templateText: string) => {
      if (!templateText.trim()) {
        setPreview("")
        setCharCount(0)
        setIsValid(false)
        setError("Template não pode estar vazio")
        return
      }

      setIsPreviewing(true)
      try {
        const result = await onPreview(templateText)
        setPreview(result.preview)
        setCharCount(result.charCount)
        setIsValid(result.isValid)
        setError(result.error || "")
      } catch (err) {
        console.error("Preview error:", err)
      } finally {
        setIsPreviewing(false)
      }
    }, 500),
    [onPreview]
  )

  // Preview on template change
  useEffect(() => {
    if (template) {
      debouncedPreview(template)
    }
  }, [template, debouncedPreview])

  const handleToggle = (checked: boolean) => {
    onChange({
      enabled: checked,
      template: settings?.template || defaultTemplates[typeKey],
    })
  }

  const handleTemplateChange = (displayText: string) => {
    // Convert friendly format back to technical format before saving
    const technicalTemplate = toTechnicalFormat(displayText)
    onChange({
      enabled: settings?.enabled ?? true,
      template: technicalTemplate,
    })
  }

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById(`template-${typeKey}`) as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      // Insert friendly format in the display
      const friendlyVar = `{${variableFriendlyNames[variable] || variable.slice(1, -1)}}`
      const newTemplate = displayTemplate.slice(0, start) + friendlyVar + displayTemplate.slice(end)
      handleTemplateChange(newTemplate)
      // Restore cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + friendlyVar.length, start + friendlyVar.length)
      }, 0)
    }
  }

  const charPercentage = (charCount / MAX_CHARS) * 100
  const charsRemaining = MAX_CHARS - charCount

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Switch checked={enabled} onCheckedChange={handleToggle} />
        </div>
      </CardHeader>
      {enabled && (
        <CardContent className="space-y-4">
          {/* Template Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`template-${typeKey}`}>Mensagem</Label>
              <div className="flex items-center gap-2">
                {isPreviewing && <Loader2 className="h-3 w-3 animate-spin" />}
                <Badge
                  variant={charsRemaining < 0 ? "destructive" : charsRemaining < 100 ? "secondary" : "outline"}
                >
                  {charCount}/{MAX_CHARS} caracteres
                </Badge>
              </div>
            </div>
            <Textarea
              id={`template-${typeKey}`}
              value={displayTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="min-h-[150px] text-sm"
              placeholder="Digite sua mensagem..."
            />
            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all ${
                  charPercentage > 100 ? "bg-destructive" : charPercentage > 80 ? "bg-yellow-500" : "bg-primary"
                }`}
                style={{ width: `${Math.min(charPercentage, 100)}%` }}
              />
            </div>
            {!isValid && error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
          </div>

          {/* Variables */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Variáveis disponíveis (clique para inserir)</Label>
            <div className="flex flex-wrap gap-1.5">
              {variables.map((v) => (
                <TooltipProvider key={v.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-xs"
                        onClick={() => insertVariable(v.name)}
                      >
                        {variableFriendlyNames[v.name] || v.name}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{v.description}</p>
                      <p className="text-muted-foreground">Insere: <code className="font-mono">{v.name}</code></p>
                      <p className="text-muted-foreground">Ex: {v.example}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          {/* Preview */}
          <Collapsible open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="gap-1">
                <Eye className="h-4 w-4" />
                {isPreviewOpen ? "Ocultar prévia" : "Ver prévia"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground mb-2">Prévia com dados de exemplo:</p>
                <pre className="whitespace-pre-wrap text-sm">{preview}</pre>
                <div className="mt-2 flex items-center gap-1 text-xs">
                  {isValid ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Mensagem válida
                    </span>
                  ) : (
                    <span className="text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {error}
                    </span>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      )}
    </Card>
  )
}

export default function NotificationSettingsPage() {
  const { getToken } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [variables, setVariables] = useState<TemplateVariable[]>([])

  const form = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      checkout_immediate: {
        enabled: true,
        template: defaultTemplates.checkout_immediate,
      },
      item_added: {
        enabled: true,
        template: defaultTemplates.item_added,
      },
      checkout_reminder: {
        enabled: true,
        template: defaultTemplates.checkout_reminder,
      },
    },
  })

  const { watch, setValue, handleSubmit, formState: { isDirty } } = form
  const settings = watch()

  // Load settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const token = await getToken()
        const store = await storeService.getCurrent(token)
        setStoreId(store.id)

        // Load notification settings
        const notifSettings = await notificationService.getSettings(store.id, token)
        if (notifSettings) {
          if (notifSettings.checkout_immediate) {
            setValue("checkout_immediate", {
              enabled: notifSettings.checkout_immediate.enabled,
              template: notifSettings.checkout_immediate.template,
            })
          }
          if (notifSettings.item_added) {
            setValue("item_added", {
              enabled: notifSettings.item_added.enabled,
              template: notifSettings.item_added.template,
            })
          }
          if (notifSettings.checkout_reminder) {
            setValue("checkout_reminder", {
              enabled: notifSettings.checkout_reminder.enabled,
              template: notifSettings.checkout_reminder.template,
            })
          }
        }

        // Load available variables
        const varsResponse = await notificationService.getVariables(store.id, token)
        setVariables(varsResponse.variables)
      } catch (error) {
        console.error("Failed to load notification settings:", error)
        toast.error("Erro ao carregar configurações", {
          description: "Não foi possível carregar as configurações de notificação.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [getToken, setValue])

  const handlePreview = async (template: string) => {
    try {
      const token = await getToken()
      const result = await notificationService.previewTemplate(storeId!, template, token)
      return {
        preview: result.preview,
        charCount: result.preview.length,
        isValid: result.is_valid,
        error: result.error,
      }
    } catch (error) {
      console.error("Preview error:", error)
      return {
        preview: template,
        charCount: template.length,
        isValid: false,
        error: "Erro ao gerar prévia",
      }
    }
  }

  const onSubmit = async (data: NotificationSettingsFormData) => {
    if (!storeId) return

    setIsSaving(true)
    try {
      const token = await getToken()
      await notificationService.updateSettings(storeId, data, token)

      toast.success("Configurações salvas", {
        description: "Os templates de notificação foram atualizados.",
      })

      form.reset(data)
    } catch (error) {
      console.error("Failed to save notification settings:", error)
      toast.error("Erro ao salvar", {
        description: "Não foi possível salvar as configurações de notificação.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardContent className="flex items-start gap-3 pt-6">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Configure os templates das mensagens automáticas enviadas via Instagram Direct.
            As configurações de <strong>quando enviar</strong> (primeiro item, novos itens, lembrete)
            estão em <strong>Configurações &gt; Carrinho &gt; Mensagens automáticas</strong>.
          </p>
        </CardContent>
      </Card>

      {/* Durante a Live */}
      <TemplateEditor
        title="Mensagem durante a live"
        description="Enviada quando o cliente adiciona produtos ao carrinho durante uma live ativa"
        typeKey="checkout_immediate"
        settings={settings.checkout_immediate}
        onChange={(s) => setValue("checkout_immediate", s, { shouldDirty: true })}
        onPreview={handlePreview}
        variables={variables}
      />

      {/* Fim de Live */}
      <TemplateEditor
        title="Mensagem de fim de live"
        description="Enviada automaticamente quando a live é finalizada para clientes com carrinho"
        typeKey="item_added"
        settings={settings.item_added}
        onChange={(s) => setValue("item_added", s, { shouldDirty: true })}
        onPreview={handlePreview}
        variables={variables}
      />

      {/* Lembrete de Expiração */}
      <TemplateEditor
        title="Lembrete de expiração"
        description="Enviada alguns minutos antes do carrinho expirar (configurável em Carrinho)"
        typeKey="checkout_reminder"
        settings={settings.checkout_reminder}
        onChange={(s) => setValue("checkout_reminder", s, { shouldDirty: true })}
        onPreview={handlePreview}
        variables={variables}
      />

      {/* Actions */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving || !isDirty}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar alterações
        </Button>
      </div>
    </form>
  )
}
