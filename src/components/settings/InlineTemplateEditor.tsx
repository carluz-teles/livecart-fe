"use client"

import { useState, useEffect, useCallback, type ReactNode } from "react"
import {
  Eye,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
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
import { cn } from "@/lib/utils"
import {
  toDisplayFormat,
  toTechnicalFormat,
  variableFriendlyNames,
} from "@/schemas/checkout-settings.schema"
import type { TemplateVariable } from "@/types/notification.types"

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

const MAX_CHARS = 1000

interface PreviewResult {
  preview: string
  charCount: number
  isValid: boolean
  error?: string
}

export interface InlineTemplateEditorProps {
  // Display
  label: string
  description: string
  id: string

  // Toggle state
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void

  // Template state
  template: string
  defaultTemplate: string
  onTemplateChange: (template: string) => void

  // Template config
  variables: TemplateVariable[]
  onPreview: (template: string) => Promise<PreviewResult>

  // Additional fields (optional)
  additionalFields?: ReactNode

  // Disabled state
  disabled?: boolean
}

export function InlineTemplateEditor({
  label,
  description,
  id,
  enabled,
  onEnabledChange,
  template,
  defaultTemplate,
  onTemplateChange,
  variables,
  onPreview,
  additionalFields,
  disabled = false,
}: InlineTemplateEditorProps) {
  const [preview, setPreview] = useState<string>("")
  const [charCount, setCharCount] = useState<number>(0)
  const [isValid, setIsValid] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)

  // Use template or default
  const currentTemplate = template || defaultTemplate
  const displayTemplate = toDisplayFormat(currentTemplate)

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
    if (currentTemplate && enabled) {
      debouncedPreview(currentTemplate)
    }
  }, [currentTemplate, enabled, debouncedPreview])

  const handleToggle = (checked: boolean) => {
    onEnabledChange(checked)
    // If enabling and no template set, use default
    if (checked && !template) {
      onTemplateChange(defaultTemplate)
    }
  }

  const handleTemplateChange = (displayText: string) => {
    // Convert friendly format back to technical format before saving
    const technicalTemplate = toTechnicalFormat(displayText)
    onTemplateChange(technicalTemplate)
  }

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById(
      `template-${id}`
    ) as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      // Insert friendly format in the display
      const friendlyVar = `{${variableFriendlyNames[variable] || variable.slice(1, -1)}}`
      const newTemplate =
        displayTemplate.slice(0, start) + friendlyVar + displayTemplate.slice(end)
      handleTemplateChange(newTemplate)
      // Restore cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(
          start + friendlyVar.length,
          start + friendlyVar.length
        )
      }, 0)
    }
  }

  const charPercentage = (charCount / MAX_CHARS) * 100
  const charsRemaining = MAX_CHARS - charCount

  return (
    <div
      className={cn(
        "rounded-lg border bg-card transition-all",
        enabled && "ring-1 ring-primary/20"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="space-y-0.5">
          <Label
            htmlFor={`toggle-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            {label}
          </Label>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Switch
          id={`toggle-${id}`}
          checked={enabled}
          onCheckedChange={handleToggle}
          disabled={disabled}
        />
      </div>

      {/* Expandable content when enabled */}
      {enabled && (
        <div className="border-t px-4 pb-4 pt-3 space-y-4">
          {/* Additional fields */}
          {additionalFields && (
            <div className="pb-2">{additionalFields}</div>
          )}

          {/* Template Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`template-${id}`} className="text-sm">
                Mensagem
              </Label>
              <div className="flex items-center gap-2">
                {isPreviewing && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
                <Badge
                  variant={
                    charsRemaining < 0
                      ? "destructive"
                      : charsRemaining < 100
                        ? "secondary"
                        : "outline"
                  }
                  className="text-xs"
                >
                  {charCount}/{MAX_CHARS}
                </Badge>
              </div>
            </div>
            <Textarea
              id={`template-${id}`}
              value={displayTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="min-h-[120px] text-sm resize-none"
              placeholder="Digite sua mensagem..."
              disabled={disabled}
            />
            {/* Progress bar */}
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all",
                  charPercentage > 100
                    ? "bg-destructive"
                    : charPercentage > 80
                      ? "bg-yellow-500"
                      : "bg-primary"
                )}
                style={{ width: `${Math.min(charPercentage, 100)}%` }}
              />
            </div>
            {!isValid && error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
          </div>

          {/* Variables */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Variáveis disponíveis
            </Label>
            <div className="flex flex-wrap gap-1">
              {variables.map((v) => (
                <TooltipProvider key={v.name} delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => insertVariable(v.name)}
                        disabled={disabled}
                      >
                        {variableFriendlyNames[v.name] || v.name}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="font-medium">{v.description}</p>
                      <p className="text-muted-foreground text-xs">
                        Ex: {v.example}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          {/* Preview */}
          <Collapsible open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs"
              >
                <Eye className="h-3.5 w-3.5" />
                {isPreviewOpen ? "Ocultar prévia" : "Ver prévia"}
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    isPreviewOpen && "rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="rounded-md border bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1.5">
                  Prévia com dados de exemplo:
                </p>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                  {preview}
                </pre>
                <div className="mt-2 flex items-center gap-1 text-xs">
                  {isValid ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Válida
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
        </div>
      )}
    </div>
  )
}
