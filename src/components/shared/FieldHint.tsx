"use client"

import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface FieldHintProps {
  /** Texto curto do tooltip (≤140 caracteres, padrão do copy deck). */
  text: string
  label?: string
}

/**
 * Ícone de ajuda ao lado do label de um campo.
 *
 * Existe como componente porque o copy deck distingue tooltip (curto, sob
 * demanda) de texto de ajuda (longo, sempre visível) — e o texto longo dos
 * campos de risco, como o teto de quantidade, **não pode** virar tooltip.
 */
export function FieldHint({ text, label = "Ajuda" }: FieldHintProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="inline-flex text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
        {text}
      </TooltipContent>
    </Tooltip>
  )
}
