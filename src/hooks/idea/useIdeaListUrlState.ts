"use client"

import { useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { DEFAULT_PAGINATION } from "@/types/api.types"
import type { IdeaSort, IdeaTab, ListIdeasParams } from "@/types/idea.types"

const VALID_TABS: IdeaTab[] = [
  "all",
  "new",
  "mine",
  "under_study",
  "completed",
]
const VALID_SORTS: IdeaSort[] = ["trending", "new"]

function asTab(v: string | null): IdeaTab {
  return VALID_TABS.includes(v as IdeaTab) ? (v as IdeaTab) : "all"
}

function asSort(v: string | null): IdeaSort {
  return VALID_SORTS.includes(v as IdeaSort) ? (v as IdeaSort) : "trending"
}

interface UseIdeaListUrlStateReturn {
  tab: IdeaTab
  sort: IdeaSort
  category: string | undefined
  q: string | undefined
  params: ListIdeasParams
  setTab: (tab: IdeaTab) => void
  setSort: (sort: IdeaSort) => void
  setCategory: (category: string | undefined) => void
  setSearch: (q: string) => void
}

export function useIdeaListUrlState(): UseIdeaListUrlStateReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  const tab = asTab(searchParams.get("tab"))
  const sort = asSort(searchParams.get("sort"))
  const category = searchParams.get("category") ?? undefined
  const q = searchParams.get("q") ?? undefined

  const params: ListIdeasParams = useMemo(
    () => ({ tab, sort, category, q, pagination: DEFAULT_PAGINATION }),
    [tab, sort, category, q],
  )

  const updateParam = useCallback(
    (patches: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(patches)) {
        if (value === undefined || value === "") {
          next.delete(key)
        } else {
          next.set(key, value)
        }
      }
      const qs = next.toString()
      router.replace(qs ? `/ideas?${qs}` : "/ideas", { scroll: false })
    },
    [router, searchParams],
  )

  const setTab = useCallback(
    (t: IdeaTab) => updateParam({ tab: t === "all" ? undefined : t }),
    [updateParam],
  )

  const setSort = useCallback(
    (s: IdeaSort) =>
      updateParam({ sort: s === "trending" ? undefined : s }),
    [updateParam],
  )

  const setCategory = useCallback(
    (c: string | undefined) => updateParam({ category: c }),
    [updateParam],
  )

  const setSearch = useCallback(
    (s: string) => updateParam({ q: s || undefined }),
    [updateParam],
  )

  return {
    tab,
    sort,
    category,
    q,
    params,
    setTab,
    setSort,
    setCategory,
    setSearch,
  }
}
