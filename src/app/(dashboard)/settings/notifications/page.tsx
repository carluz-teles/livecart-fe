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
  HelpCircle,
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
import { Input } from "@/components/ui/input"
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

const MAX_BYTES = 1000

const templateSettingsSchema = z.object({
  enabled: z.boolean(),
  on_first_item: z.boolean().optional(),
  on_new_items: z.boolean().optional(),
  cooldown_seconds: z.number().min(0).max(3600).optional(),
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
  checkout_immediate:
    "Olá {handle}! 🛒\n\nVocê pediu {produto} na live!\n\nTotal: {total}\n\nFinalize aqui: {link}\n\n⏰ Válido por {expira_em}",
  item_added:
    "Oi {handle}! ➕\n\nNovo item adicionado: {produto}\n\nSeu carrinho agora tem {total_itens} itens\nTotal: {total}\n\nFinalize: {link}",
  checkout_reminder:
    "Oi {handle}! 🛒\n\nSeu carrinho com {total_itens} itens está esperando!\n\nTotal: {total}\n\nFinalize aqui: {link}\n\n⏰ Válido por {expira_em}",
}

interface TemplateEditorProps {
  title: string
  description: string
  typeKey: "checkout_immediate" | "item_added" | "checkout_reminder"
  settings: TemplateSettings | null
  onChange: (settings: TemplateSettings | null) => void
  onPreview: (template: string) => Promise<{ preview: string; byteCount: number; isValid: boolean; error?: string }>
  variables: TemplateVariable[]
  showFirstItemOptions?: boolean
}

function TemplateEditor({
  title,
  description,
  typeKey,
  settings,
  onChange,
  onPreview,
  variables,
  showFirstItemOptions = false,
}: TemplateEditorProps) {
  const [preview, setPreview] = useState<string>("")
  const [byteCount, setByteCount] = useState<number>(0)
  const [isValid, setIsValid] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)

  const enabled = settings?.enabled ?? false
  const template = settings?.template ?? defaultTemplates[typeKey]

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedPreview = useCallback(
    debounce(async (templateText: string) => {
      if (!templateText.trim()) {
        setPreview("")
        setByteCount(0)
        setIsValid(false)
        setError("Template não pode estar vazio")
        return
      }

      setIsPreviewing(true)
      try {
        const result = await onPreview(templateText)
        setPreview(result.preview)
        setByteCount(result.byteCount)
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
      on_first_item: settings?.on_first_item ?? true,
      on_new_items: settings?.on_new_items ?? true,
      cooldown_seconds: settings?.cooldown_seconds ?? 30,
    })
  }

  const handleTemplateChange = (newTemplate: string) => {
    onChange({
      ...settings,
      enabled: settings?.enabled ?? true,
      template: newTemplate,
      on_first_item: settings?.on_first_item ?? true,
      on_new_items: settings?.on_new_items ?? true,
      cooldown_seconds: settings?.cooldown_seconds ?? 30,
    })
  }

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById(`template-${typeKey}`) as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newTemplate = template.slice(0, start) + variable + template.slice(end)
      handleTemplateChange(newTemplate)
      // Restore cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length, start + variable.length)
      }, 0)
    }
  }

  const bytePercentage = (byteCount / MAX_BYTES) * 100
  const bytesRemaining = MAX_BYTES - byteCount

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
          {showFirstItemOptions && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label className="text-sm">Primeiro item</Label>
                  <p className="text-xs text-muted-foreground">Enviar quando carrinho é criado</p>
                </div>
                <Switch
                  checked={settings?.on_first_item ?? true}
                  onCheckedChange={(checked) =>
                    onChange({ ...settings!, on_first_item: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label className="text-sm">Novos itens</Label>
                  <p className="text-xs text-muted-foreground">Enviar ao adicionar item</p>
                </div>
                <Switch
                  checked={settings?.on_new_items ?? true}
                  onCheckedChange={(checked) =>
                    onChange({ ...settings!, on_new_items: checked })
                  }
                />
              </div>
            </div>
          )}

          {showFirstItemOptions && (
            <div className="space-y-2">
              <Label htmlFor={`cooldown-${typeKey}`}>
                Cooldown entre mensagens (segundos)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="ml-1 inline h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tempo mínimo entre mensagens para o mesmo usuário</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id={`cooldown-${typeKey}`}
                type="number"
                min={0}
                max={3600}
                value={settings?.cooldown_seconds ?? 30}
                onChange={(e) =>
                  onChange({
                    ...settings!,
                    cooldown_seconds: parseInt(e.target.value) || 0,
                  })
                }
                className="w-32"
              />
            </div>
          )}

          {/* Template Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`template-${typeKey}`}>Mensagem</Label>
              <div className="flex items-center gap-2">
                {isPreviewing && <Loader2 className="h-3 w-3 animate-spin" />}
                <Badge
                  variant={bytesRemaining < 0 ? "destructive" : bytesRemaining < 100 ? "secondary" : "outline"}
                >
                  {byteCount}/{MAX_BYTES} bytes
                </Badge>
              </div>
            </div>
            <Textarea
              id={`template-${typeKey}`}
              value={template}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="min-h-[150px] font-mono text-sm"
              placeholder="Digite sua mensagem..."
            />
            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all ${
                  bytePercentage > 100 ? "bg-destructive" : bytePercentage > 80 ? "bg-yellow-500" : "bg-primary"
                }`}
                style={{ width: `${Math.min(bytePercentage, 100)}%` }}
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
            <div className="flex flex-wrap gap-1">
              {variables.map((v) => (
                <TooltipProvider key={v.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs font-mono"
                        onClick={() => insertVariable(v.name)}
                      >
                        {v.name}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{v.description}</p>
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
        on_first_item: true,
        on_new_items: true,
        cooldown_seconds: 30,
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
            setValue("checkout_immediate", notifSettings.checkout_immediate)
          }
          if (notifSettings.item_added) {
            setValue("item_added", notifSettings.item_added)
          }
          if (notifSettings.checkout_reminder) {
            setValue("checkout_reminder", notifSettings.checkout_reminder)
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
        byteCount: result.byte_count,
        isValid: result.is_valid,
        error: result.error,
      }
    } catch (error) {
      console.error("Preview error:", error)
      return {
        preview: template,
        byteCount: new Blob([template]).size,
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
        description: "As configurações de notificação foram atualizadas.",
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mensagens automáticas
          </CardTitle>
          <CardDescription>
            Configure as mensagens enviadas automaticamente via Instagram Direct quando
            clientes adicionam produtos ao carrinho durante uma live.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Checkout Immediate */}
      <TemplateEditor
        title="Checkout imediato"
        description="Enviada quando o cliente adiciona um produto ao carrinho"
        typeKey="checkout_immediate"
        settings={settings.checkout_immediate}
        onChange={(s) => setValue("checkout_immediate", s, { shouldDirty: true })}
        onPreview={handlePreview}
        variables={variables}
        showFirstItemOptions={true}
      />

      {/* Item Added (disabled for now as per decision) */}
      {/* <TemplateEditor
        title="Item adicionado"
        description="Enviada quando um novo item é adicionado a um carrinho existente"
        typeKey="item_added"
        settings={settings.item_added}
        onChange={(s) => setValue("item_added", s, { shouldDirty: true })}
        onPreview={handlePreview}
        variables={variables}
      /> */}

      {/* Checkout Reminder */}
      <TemplateEditor
        title="Lembrete de checkout"
        description="Enviada quando a live termina (se ativado nas configurações da live)"
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
