"use client"

import { useState } from "react"
import { Plus, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface OptionDraft {
  name: string
  values: string[]
}

interface ProductFormOptionsBuilderProps {
  options: OptionDraft[]
  onChange: (next: OptionDraft[]) => void
  errors?: {
    options?: Array<{ name?: string; values?: string }>
    root?: string
  }
}

const MAX_OPTIONS = 3

export function ProductFormOptionsBuilder({
  options,
  onChange,
  errors,
}: ProductFormOptionsBuilderProps) {
  const updateOption = (index: number, patch: Partial<OptionDraft>) => {
    const next = options.map((o, i) => (i === index ? { ...o, ...patch } : o))
    onChange(next)
  }

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index))
  }

  const addOption = () => {
    if (options.length >= MAX_OPTIONS) return
    onChange([...options, { name: "", values: [] }])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <Label>
          Opções <span className="text-destructive">*</span>
        </Label>
        <span className="text-xs text-muted-foreground">
          até {MAX_OPTIONS}
        </span>
      </div>

      {errors?.root && (
        <p className="text-xs text-destructive">{errors.root}</p>
      )}

      <div className="space-y-3">
        {options.map((option, index) => (
          <OptionCard
            key={index}
            option={option}
            error={errors?.options?.[index]}
            onChange={(patch) => updateOption(index, patch)}
            onRemove={
              options.length > 1 ? () => removeOption(index) : undefined
            }
          />
        ))}
      </div>

      {options.length < MAX_OPTIONS && (
        <Button type="button" variant="outline" size="sm" onClick={addOption}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Adicionar opção
        </Button>
      )}
    </div>
  )
}

interface OptionCardProps {
  option: OptionDraft
  error?: { name?: string; values?: string }
  onChange: (patch: Partial<OptionDraft>) => void
  onRemove?: () => void
}

function OptionCard({ option, error, onChange, onRemove }: OptionCardProps) {
  const [draft, setDraft] = useState("")

  const commitValue = () => {
    const v = draft.trim()
    if (!v) return
    if (option.values.includes(v)) {
      setDraft("")
      return
    }
    onChange({ values: [...option.values, v] })
    setDraft("")
  }

  const removeValue = (value: string) => {
    onChange({ values: option.values.filter((v) => v !== value) })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      commitValue()
    } else if (e.key === "Backspace" && draft === "" && option.values.length > 0) {
      // Convenience: backspace on empty input pops the last chip.
      e.preventDefault()
      removeValue(option.values[option.values.length - 1])
    }
  }

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-1">
          <Input
            placeholder="Ex.: Cor"
            value={option.name}
            onChange={(e) => onChange({ name: e.target.value })}
            aria-invalid={!!error?.name}
          />
          {error?.name && (
            <p className="text-xs text-destructive">{error.name}</p>
          )}
        </div>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            aria-label="Remover opção"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">
          Valores — Enter ou vírgula para adicionar
        </p>
        <div
          className={cn(
            "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 text-sm",
            error?.values && "border-destructive"
          )}
        >
          {option.values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
            >
              {value}
              <button
                type="button"
                onClick={() => removeValue(value)}
                aria-label={`Remover ${value}`}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder={option.values.length === 0 ? "Ex.: Preto" : ""}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commitValue}
            className="min-w-[80px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        {error?.values && (
          <p className="text-xs text-destructive">{error.values}</p>
        )}
      </div>
    </div>
  )
}
