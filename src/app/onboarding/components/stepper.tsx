"use client"

import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export interface StepDef {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface StepperProps {
  steps: StepDef[]
  current: number // índice do passo atual
}

// Indicador de progresso acessível: <ol> navegável por leitores de tela,
// aria-current no passo ativo, check nos concluídos.
export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="flex items-center justify-center gap-0" aria-label="Progresso do cadastro">
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <li
            key={step.id}
            aria-current={active ? "step" : undefined}
            className="flex items-center"
          >
            {i > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  "mx-1.5 h-0.5 w-6 rounded-full transition-colors sm:mx-2 sm:w-10",
                  done ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <span className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border-2 transition-all",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-primary/10 text-primary ring-4 ring-primary/15",
                  !done && !active && "border-border bg-card text-muted-foreground"
                )}
              >
                {done ? <Check className="size-4" aria-hidden="true" /> : <step.icon className="size-4" aria-hidden="true" />}
              </span>
              <span
                className={cn(
                  "text-[11px] font-medium sm:text-xs",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
                {done && <span className="sr-only"> (concluído)</span>}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
