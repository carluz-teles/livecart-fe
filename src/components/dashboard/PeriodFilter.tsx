"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { PeriodRange } from "@/types/dashboard.types"

export type PeriodPreset = "today" | "7d" | "30d" | "90d" | "custom"

const presets: { id: PeriodPreset; label: string }[] = [
  { id: "today", label: "Hoje" },
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "90d", label: "90 dias" },
]

function iso(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function rangeForPreset(preset: Exclude<PeriodPreset, "custom">): PeriodRange {
  const now = new Date()
  const days = preset === "today" ? 0 : preset === "7d" ? 7 : preset === "30d" ? 30 : 90
  const from = new Date(now)
  from.setDate(from.getDate() - days)
  return { from: iso(from), to: iso(now) }
}

interface PeriodFilterProps {
  preset: PeriodPreset
  range: PeriodRange
  onChange: (preset: PeriodPreset, range: PeriodRange) => void
}

// Filtro global do dashboard: todos os números da Visão geral respondem pelo
// mesmo intervalo (redesign jul/2026 — antes cada card usava uma janela).
export function PeriodFilter({ preset, range, onChange }: PeriodFilterProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange | undefined>()

  const customLabel =
    preset === "custom"
      ? `${new Date(range.from + "T00:00:00").toLocaleDateString("pt-BR")} – ${new Date(
          range.to + "T00:00:00"
        ).toLocaleDateString("pt-BR")}`
      : "Personalizado"

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-card p-1">
      {presets.map((p) => {
        const id = p.id as Exclude<PeriodPreset, "custom">
        return (
          <Button
            key={id}
            variant={preset === id ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => onChange(id, rangeForPreset(id))}
          >
            {p.label}
          </Button>
        )
      })}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={preset === "custom" ? "default" : "ghost"}
            size="sm"
            className={cn("h-7 gap-1.5 px-3 text-xs")}
          >
            <CalendarIcon className="size-3.5" />
            {customLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={draft}
            onSelect={(r) => {
              setDraft(r)
              if (r?.from && r?.to) {
                onChange("custom", { from: iso(r.from), to: iso(r.to) })
                setOpen(false)
              }
            }}
            disabled={{ after: new Date() }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
