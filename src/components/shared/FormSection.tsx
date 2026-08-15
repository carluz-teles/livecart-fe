"use client"

import { FieldHint } from "@/components/shared/FieldHint"
import { cn } from "@/lib/utils"

interface FormSectionProps {
  title: string
  /** Explicação sob demanda, no ícone ao lado do título. */
  hint?: string
  /** Uma linha permanente. Use só quando a seção inteira precisa de contexto —
   *  explicação de campo pertence ao `hint` do campo. */
  description?: string
  /** Primeira seção do formulário: sem régua acima, porque não há o que separar. */
  first?: boolean
  children: React.ReactNode
}

/**
 * Cabeçalho de seção dos formulários de evento e transmissão.
 *
 * Mora aqui, e não dentro de um dos dois, porque os dois usam. Enquanto o
 * `EventForm` tinha a cópia local, o `SessionForm` não tinha nenhuma — e era
 * exatamente essa a diferença que fazia um parecer arrumado e o outro uma lista
 * corrida de campos.
 *
 * A régua e o respiro acima é o que separa uma seção da outra. Sem eles o título
 * cola no último campo da seção anterior e o formulário lê como uma lista
 * contínua em vez de decisões distintas.
 *
 * O título é caixa alta e em tom secundário de propósito: precisa se distinguir
 * de um LABEL de campo. Quando os dois eram `text-sm font-semibold`, o olho não
 * tinha como saber o que era cabeçalho e o que era campo.
 */
export function FormSection({
  title,
  hint,
  description,
  first = false,
  children,
}: FormSectionProps) {
  return (
    <section className={cn("space-y-4", !first && "border-t pt-6")}>
      <div className="space-y-1.5">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
          {hint && <FieldHint text={hint} />}
        </h3>
        {description && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}
