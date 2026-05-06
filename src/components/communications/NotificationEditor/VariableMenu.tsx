"use client"

import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { variableFriendlyNames } from "@/schemas/checkout-settings.schema"
import type { TemplateVariable } from "@/types/notification.types"

interface VariableMenuProps {
  variables: TemplateVariable[]
  onPick: (technicalName: string) => void
}

export function VariableMenu({ variables, onPick }: VariableMenuProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5">
          <Plus className="h-4 w-4" />
          Variável
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-1.5">
        <ul className="flex flex-col">
          {variables.map((v) => {
            const friendly = variableFriendlyNames[v.name] ?? v.name
            const technical = v.name.replace(/[{}]/g, "")
            return (
              <li key={v.name}>
                <button
                  type="button"
                  onClick={() => onPick(technical)}
                  className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted"
                >
                  <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="flex-1">
                    <span className="block font-medium">{friendly}</span>
                    <span className="block text-xs text-muted-foreground">
                      Ex: {v.example}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
