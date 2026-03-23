"use client"

import { useState, useCallback } from "react"
import { Filter, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FilterPanelProps {
  children: React.ReactNode
  activeCount?: number
  onClearAll?: () => void
  title?: string
}

export function FilterPanel({
  children,
  activeCount = 0,
  onClearAll,
  title = "Filtros",
}: FilterPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          {title}
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[320px] sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            {title}
            {activeCount > 0 && onClearAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="mr-1 h-4 w-4" />
                Limpar tudo
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">{children}</div>

        <SheetFooter className="mt-6">
          <Button onClick={() => setOpen(false)} className="w-full">
            Aplicar Filtros
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function FilterSection({
  title,
  children,
  defaultOpen = true,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:text-foreground transition-colors">
        {title}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pb-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

interface FilterCheckboxGroupProps {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (values: string[]) => void
}

export function FilterCheckboxGroup({
  options,
  selected,
  onChange,
}: FilterCheckboxGroupProps) {
  const handleToggle = useCallback(
    (value: string) => {
      if (selected.includes(value)) {
        onChange(selected.filter((v) => v !== value))
      } else {
        onChange([...selected, value])
      }
    },
    [selected, onChange]
  )

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center gap-2 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selected.includes(option.value)}
            onChange={() => handleToggle(option.value)}
            className="h-4 w-4 rounded border-input bg-background"
          />
          <span className="text-sm">{option.label}</span>
        </label>
      ))}
    </div>
  )
}

interface FilterRangeProps {
  minValue?: number
  maxValue?: number
  onMinChange: (value: number | undefined) => void
  onMaxChange: (value: number | undefined) => void
  minPlaceholder?: string
  maxPlaceholder?: string
  prefix?: string
  formatValue?: (value: number) => string
  parseValue?: (value: string) => number
}

export function FilterRange({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minPlaceholder = "Min",
  maxPlaceholder = "Max",
  prefix,
  formatValue,
  parseValue,
}: FilterRangeProps) {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!value) {
      onMinChange(undefined)
      return
    }
    const parsed = parseValue ? parseValue(value) : parseInt(value, 10)
    if (!isNaN(parsed)) {
      onMinChange(parsed)
    }
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!value) {
      onMaxChange(undefined)
      return
    }
    const parsed = parseValue ? parseValue(value) : parseInt(value, 10)
    if (!isNaN(parsed)) {
      onMaxChange(parsed)
    }
  }

  const displayMin =
    minValue !== undefined
      ? formatValue
        ? formatValue(minValue)
        : String(minValue)
      : ""
  const displayMax =
    maxValue !== undefined
      ? formatValue
        ? formatValue(maxValue)
        : String(maxValue)
      : ""

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="numeric"
          value={displayMin}
          onChange={handleMinChange}
          placeholder={minPlaceholder}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            prefix && "pl-9"
          )}
        />
      </div>
      <span className="text-muted-foreground">-</span>
      <div className="relative flex-1">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="numeric"
          value={displayMax}
          onChange={handleMaxChange}
          placeholder={maxPlaceholder}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            prefix && "pl-9"
          )}
        />
      </div>
    </div>
  )
}

interface FilterToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function FilterToggle({ label, checked, onChange }: FilterToggleProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-input bg-background"
      />
      <span className="text-sm">{label}</span>
    </label>
  )
}
