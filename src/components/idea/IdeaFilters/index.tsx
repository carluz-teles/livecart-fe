"use client"

import type { IdeaSort, IdeaTab } from "@/types/idea.types"

import { IdeaFiltersSearch } from "./IdeaFilters.Search"
import { IdeaFiltersSelects } from "./IdeaFilters.Selects"
import { IdeaFiltersTabs } from "./IdeaFilters.Tabs"

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

function IdeaFiltersRoot({
  tab,
  category,
  q,
  sort,
  onTabChange,
  onCategoryChange,
  onSearchChange,
  onSortChange,
}: IdeaFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <IdeaFiltersTabs tab={tab} onChange={onTabChange} />

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <IdeaFiltersSearch q={q} onChange={onSearchChange} />
        <IdeaFiltersSelects
          category={category}
          sort={sort}
          onCategoryChange={onCategoryChange}
          onSortChange={onSortChange}
        />
      </div>
    </div>
  )
}

IdeaFiltersRoot.Tabs = IdeaFiltersTabs
IdeaFiltersRoot.Search = IdeaFiltersSearch
IdeaFiltersRoot.Selects = IdeaFiltersSelects

export { IdeaFiltersRoot as IdeaFilters }
