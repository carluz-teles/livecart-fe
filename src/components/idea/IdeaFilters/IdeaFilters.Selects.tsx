"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useIdeaCategories } from "@/hooks/idea"
import type { IdeaSort } from "@/types/idea.types"

const ALL_CATEGORIES = "__all__"

interface IdeaFiltersSelectsProps {
  category: string | undefined
  sort: IdeaSort
  onCategoryChange: (category: string | undefined) => void
  onSortChange: (sort: IdeaSort) => void
}

export function IdeaFiltersSelects({
  category,
  sort,
  onCategoryChange,
  onSortChange,
}: IdeaFiltersSelectsProps) {
  const { data: categories } = useIdeaCategories()

  return (
    <>
      <Select
        value={category ?? ALL_CATEGORIES}
        onValueChange={(v) =>
          onCategoryChange(v === ALL_CATEGORIES ? undefined : v)
        }
      >
        <SelectTrigger
          className="md:w-56"
          aria-label="Filtrar por categoria"
        >
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
    </>
  )
}
