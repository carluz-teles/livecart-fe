"use client"

import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateTimeFieldProps {
  /** ISO8601 ou null. */
  value: string | null | undefined
  onChange: (iso: string | null) => void
  placeholder?: string
  /** Hora usada quando o lojista escolhe a data e ainda não escolheu a hora. */
  defaultHour?: number
  defaultMinute?: number
  /** Quando falso, some o botão de limpar — usado no campo obrigatório. */
  clearable?: boolean
  disabledBefore?: Date
}

/**
 * Seletor de data + hora.
 *
 * Extraído do `EventForm`, onde vivia inline: a janela da campanha precisa de
 * DOIS campos iguais (início e fim) e duplicar o calendário era o caminho mais
 * curto para os dois divergirem em detalhe de comportamento.
 */
export function DateTimeField({
  value,
  onChange,
  placeholder = "Selecione data e hora",
  defaultHour = 10,
  defaultMinute = 0,
  clearable = true,
  disabledBefore,
}: DateTimeFieldProps) {
  const selectedDate = value ? new Date(value) : undefined
  const timeValue = selectedDate ? format(selectedDate, "HH:mm") : ""

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange(null)
      return
    }
    // Preserva a hora já escolhida — trocar o dia não pode zerar o horário.
    if (selectedDate) {
      date.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0)
    } else {
      date.setHours(defaultHour, defaultMinute, 0, 0)
    }
    onChange(date.toISOString())
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(":").map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return
    const date = selectedDate ? new Date(selectedDate) : new Date()
    date.setHours(hours, minutes, 0, 0)
    onChange(date.toISOString())
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            // min-w-0 + truncate: sem os dois, o texto da data define a largura
            // MÍNIMA do botão. Dentro de uma grid a coluna não encolhe abaixo do
            // conteúdo (min-width:auto), e o painel inteiro ganhava barra de
            // rolagem horizontal — com o campo de fim cortado ao meio.
            "w-full min-w-0 justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {/* Formato curto: "16 de agosto de 2026 às 23:59" tem 29 caracteres e
              não cabe num controle de meia coluna. O ano abreviado mantém a
              data completa — importa para evento agendado para o ano seguinte. */}
          <span className="truncate">
            {value
              ? format(new Date(value), "dd/MM/yy 'às' HH:mm", { locale: ptBR })
              : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={disabledBefore ? (date) => date < disabledBefore : undefined}
          locale={ptBR}
        />
        <div className="border-t p-3">
          <Label className="text-sm">Horário</Label>
          <Input type="time" value={timeValue} onChange={handleTimeChange} className="mt-1" />
        </div>
        {clearable && value && (
          <div className="border-t p-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => onChange(null)}
            >
              Limpar data
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
