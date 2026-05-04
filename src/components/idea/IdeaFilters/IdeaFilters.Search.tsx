"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/shared/useDebounce"

interface IdeaFiltersSearchProps {
  q: string | undefined
  onChange: (q: string) => void
}

export function IdeaFiltersSearch({ q, onChange }: IdeaFiltersSearchProps) {
  const [input, setInput] = useState(q ?? "")
  const debounced = useDebounce(input, 300)

  // Push the debounced value upstream when the user types.
  useEffect(() => {
    onChange(debounced)
  }, [debounced, onChange])

  // Re-sync local input when an outside change clears or replaces it.
  useEffect(() => {
    setInput(q ?? "")
  }, [q])

  return (
    <div className="relative flex-1">
      <Search
        className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        placeholder="Buscar por título, descrição ou número (#42)..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="pl-8"
        aria-label="Buscar ideias"
      />
    </div>
  )
}
