"use client"

import { useEffect, useState } from "react"
import { Check, Copy, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface PagarmeConnectWizardProps {
  webhookUrl: string | undefined
}

const STORAGE_KEY = "pagarme-wizard-checked-v1"
type Step = "url" | "events"

// Numbered checklist that lives at the top of the connect dialog. The user
// usually configures Pagar.me in a separate tab; persisting which step they
// already crossed off (in localStorage, not React state) lets them tab back
// and forth without losing context. Resets when the user disconnects and
// reconnects — they get a new webhook secret anyway.
export function PagarmeConnectWizard({ webhookUrl }: PagarmeConnectWizardProps) {
  const [checked, setChecked] = useState<Record<Step, boolean>>(() => emptyChecked())

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<Record<Step, boolean>>
      setChecked({
        url: !!parsed.url,
        events: !!parsed.events,
      })
    } catch {
      // ignore — fall back to all unchecked
    }
  }, [])

  const toggle = (step: Step) => {
    setChecked((prev) => {
      const next = { ...prev, [step]: !prev[step] }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore quota errors — UX still works without persistence
      }
      return next
    })
  }

  return (
    <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Configure no painel da Pagar.me</h4>
        <a
          href="https://dashboard.pagar.me"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
        >
          Abrir painel
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <ol className="space-y-3">
        <Step
          number={1}
          checked={checked.url}
          onToggle={() => toggle("url")}
          title="Cole esta URL em Configurações → Webhooks"
        >
          <InlineCopy value={webhookUrl ?? ""} placeholder="Carregando URL..." />
        </Step>

        <Step
          number={2}
          checked={checked.events}
          onToggle={() => toggle("events")}
          title="Marque os eventos"
        >
          <div className="flex flex-wrap gap-1.5">
            {["order.paid", "order.payment_failed", "order.canceled"].map((evt) => (
              <code
                key={evt}
                className="rounded bg-background px-1.5 py-0.5 text-[11px] font-mono"
              >
                {evt}
              </code>
            ))}
          </div>
        </Step>

      </ol>
    </div>
  )
}

function emptyChecked(): Record<Step, boolean> {
  return { url: false, events: false }
}

interface StepProps {
  number: number
  title: string
  description?: string
  checked: boolean
  onToggle: () => void
  children?: React.ReactNode
}

function Step({ number, title, description, checked, onToggle, children }: StepProps) {
  return (
    <li className="flex items-start gap-3">
      <Checkbox
        id={`pagarme-step-${number}`}
        checked={checked}
        onCheckedChange={onToggle}
        className="mt-0.5"
      />
      <div className="min-w-0 flex-1 space-y-1.5">
        <label
          htmlFor={`pagarme-step-${number}`}
          className={cn(
            "flex items-baseline gap-1.5 text-sm font-medium leading-snug",
            checked && "text-muted-foreground line-through decoration-muted-foreground/40",
          )}
        >
          <span className="text-xs text-muted-foreground">{number}.</span>
          <span>{title}</span>
        </label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {children && <div className="pt-0.5">{children}</div>}
      </div>
    </li>
  )
}

interface InlineCopyProps {
  value: string
  label?: string
  placeholder?: string
}

function InlineCopy({ value, label, placeholder }: InlineCopyProps) {
  const [copied, setCopied] = useState(false)
  const hasValue = !!value.trim()
  const display = value

  const onCopy = async () => {
    if (!hasValue) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // navigator.clipboard fails in non-secure contexts; silently no-op
    }
  }

  return (
    <div className="space-y-1">
      {label && (
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      )}
      <div className="flex items-center gap-1 rounded-md border bg-background px-2 py-1.5">
        <code
          className={cn(
            "min-w-0 flex-1 break-all font-mono text-xs leading-relaxed",
            !hasValue && "text-muted-foreground italic",
          )}
        >
          {hasValue ? display : placeholder ?? "—"}
        </code>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={onCopy}
          disabled={!hasValue}
          aria-label={`Copiar ${label ?? "valor"}`}
        >
          {copied ? (
            <Check className="h-3 w-3 text-emerald-600" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  )
}
