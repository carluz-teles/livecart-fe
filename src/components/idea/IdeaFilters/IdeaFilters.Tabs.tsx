"use client"

import { useEffect, useState } from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { IdeaTab } from "@/types/idea.types"

interface IdeaFiltersTabsProps {
  tab: IdeaTab
  onChange: (tab: IdeaTab) => void
}

// During the URL transition the `tab` prop (driven by useSearchParams) lags
// the click — so the highlight wouldn't move until the RSC roundtrip
// resolved. We mirror the value locally and bump it synchronously on click,
// then snap back when the URL settles.
export function IdeaFiltersTabs({ tab, onChange }: IdeaFiltersTabsProps) {
  const [optimistic, setOptimistic] = useState<IdeaTab>(tab)

  useEffect(() => {
    setOptimistic(tab)
  }, [tab])

  function handleChange(v: string) {
    const next = v as IdeaTab
    setOptimistic(next)
    onChange(next)
  }

  return (
    <Tabs value={optimistic} onValueChange={handleChange}>
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
