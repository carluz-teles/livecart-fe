"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { IdeaTab } from "@/types/idea.types"

interface IdeaFiltersTabsProps {
  tab: IdeaTab
  onChange: (tab: IdeaTab) => void
}

export function IdeaFiltersTabs({ tab, onChange }: IdeaFiltersTabsProps) {
  return (
    <Tabs value={tab} onValueChange={(v) => onChange(v as IdeaTab)}>
      <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
        <TabsTrigger value="all" className="data-[state=active]:bg-muted">
          Todas
        </TabsTrigger>
        <TabsTrigger value="new" className="data-[state=active]:bg-muted">
          Novas
        </TabsTrigger>
        <TabsTrigger value="mine" className="data-[state=active]:bg-muted">
          Minhas
        </TabsTrigger>
        <TabsTrigger
          value="under_study"
          className="data-[state=active]:bg-muted"
        >
          Em estudo
        </TabsTrigger>
        <TabsTrigger value="completed" className="data-[state=active]:bg-muted">
          Desenvolvidas
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
