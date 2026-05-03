"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIdeaCategories } from "@/hooks/idea"
import type { IdeaSort, IdeaTab } from "@/types/idea.types"

const ALL_CATEGORIES = "__all__"

interface IdeaFiltersProps {
  tab: IdeaTab
  category: string | undefined
  q: string | undefined
  sort: IdeaSort
  onTabChange: (tab: IdeaTab) => void
  onCategoryChange: (category: string | undefined) => void
  onSearchChange: (q: string) => void
  onSortChange: (sort: IdeaSort) => void
}

export function IdeaFilters({
  tab,
  category,
  q,
  sort,
  onTabChange,
  onCategoryChange,
  onSearchChange,
  onSortChange,
}: IdeaFiltersProps) {
  const { data: categories } = useIdeaCategories()
  const [searchInput, setSearchInput] = useState(q ?? "")

  // Debounce search to avoid hammering the API on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      onSearchChange(searchInput)
    }, 300)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  // External resets (e.g. tab change) re-sync the input.
  useEffect(() => {
    setSearchInput(q ?? "")
  }, [q])

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={tab} onValueChange={(v) => onTabChange(v as IdeaTab)}>
        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          <TabsTrigger value="all" className="data-[state=active]:bg-muted">Todas</TabsTrigger>
          <TabsTrigger value="new" className="data-[state=active]:bg-muted">Novas</TabsTrigger>
          <TabsTrigger value="mine" className="data-[state=active]:bg-muted">Minhas</TabsTrigger>
          <TabsTrigger value="under_study" className="data-[state=active]:bg-muted">Em estudo</TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-muted">Desenvolvidas</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Buscar por título, descrição ou número (#42)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
            aria-label="Buscar ideias"
          />
        </div>

        <Select
          value={category ?? ALL_CATEGORIES}
          onValueChange={(v) => onCategoryChange(v === ALL_CATEGORIES ? undefined : v)}
        >
          <SelectTrigger className="md:w-56" aria-label="Filtrar por categoria">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>Todas as categorias</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => onSortChange(v as IdeaSort)}>
          <SelectTrigger className="md:w-40" aria-label="Ordenação">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="new">Mais recentes</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
