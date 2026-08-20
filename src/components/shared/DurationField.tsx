"use client"

import { useEffect, useState } from "react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/**
 * Campo de duração com unidade (minutos / horas / dias).
 *
 * A API só fala MINUTOS — `cart_expiration_minutes` é a unidade canônica do
 * banco e de todo o backend, e isso não muda aqui. O que muda é a conversa com
 * o lojista: "4320 minutos" não é um prazo, é uma conta. Nasceu do pedido de
 * 20/08/2026 — o teto subiu de 24h para 30 dias e ninguém digita 43200.
 *
 * Vazio significa "herda o padrão da loja" (null), como no
 * InheritableNumberField que este campo substitui nos formulários de evento.
 */

type Unidade = "minutos" | "horas" | "dias"

const FATOR: Record<Unidade, number> = { minutos: 1, horas: 60, dias: 1440 }

function melhorUnidade(minutos: number): Unidade {
  if (minutos % 1440 === 0) return "dias"
  if (minutos % 60 === 0) return "horas"
  return "minutos"
}

/** "3 dias", "2 horas", "45 minutos" — a maior unidade exata. */
export function formatarMinutos(minutos: number): string {
  const unidade = melhorUnidade(minutos)
  const quantia = minutos / FATOR[unidade]
  if (quantia === 1) {
    return unidade === "dias" ? "1 dia" : unidade === "horas" ? "1 hora" : "1 minuto"
  }
  return `${quantia} ${unidade}`
}

interface DurationFieldProps {
  /** Valor em MINUTOS (unidade canônica da API). null = herda da loja. */
  value: number | null | undefined
  onChange: (minutes: number | null) => void
  /** Piso em minutos (o CHECK do banco é 15). */
  minMinutes: number
  /** Teto em minutos (o backend valida 43200 = 30 dias). */
  maxMinutes?: number
  /** Padrão da loja, exibido no placeholder quando o campo herda. */
  inheritedValue?: number | null
  disabled?: boolean
  id?: string
}

export function DurationField({
  value,
  onChange,
  minMinutes,
  maxMinutes,
  inheritedValue,
  disabled,
  id,
}: DurationFieldProps) {
  const [unidade, setUnidade] = useState<Unidade>(() =>
    value != null ? melhorUnidade(value) : "minutos"
  )

  // Reset externo (form.reset, troca de evento): se o valor novo não é exato
  // na unidade escolhida, re-deriva. Não briga com a digitação — tudo que o
  // próprio campo emite é múltiplo do fator da unidade corrente.
  useEffect(() => {
    if (value != null && value % FATOR[unidade] !== 0) {
      setUnidade(melhorUnidade(value))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const quantia = value != null ? value / FATOR[unidade] : ""
  const placeholder =
    inheritedValue != null
      ? `Padrão da loja: ${formatarMinutos(inheritedValue)}`
      : "Padrão da loja"

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        step={1}
        min={1}
        className="w-24"
        value={quantia}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          const parsed = parseInt(e.target.value, 10)
          onChange(Number.isNaN(parsed) ? null : parsed * FATOR[unidade])
        }}
        aria-label="Duração"
      />
      <Select
        value={unidade}
        disabled={disabled}
        onValueChange={(u) => {
          const nova = u as Unidade
          setUnidade(nova)
          // Troca de unidade preserva a QUANTIA digitada: "2" + horas→dias
          // vira 2 dias. Preservar os minutos viraria fração ilegível.
          if (typeof quantia === "number") {
            onChange(quantia * FATOR[nova])
          }
        }}
      >
        <SelectTrigger className="w-32" aria-label="Unidade">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="minutos">minutos</SelectItem>
          <SelectItem value="horas">horas</SelectItem>
          <SelectItem value="dias">dias</SelectItem>
        </SelectContent>
      </Select>
      {(minMinutes > 0 || maxMinutes) && (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatarMinutos(minMinutes)}
          {maxMinutes ? ` a ${formatarMinutos(maxMinutes)}` : " no mínimo"}
        </span>
      )}
    </div>
  )
}
