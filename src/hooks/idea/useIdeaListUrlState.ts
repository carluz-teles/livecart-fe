"use client"

import { useCallback, useMemo, useTransition } from "react"
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
  page: number
  params: ListIdeasParams
  // True while the URL change triggered by setTab/setSort/etc. is still
  // resolving (RSC roundtrip + new client query). Components can use this
  // to render a skeleton without waiting for the URL to settle.
  isPending: boolean
  setTab: (tab: IdeaTab) => void
  setSort: (sort: IdeaSort) => void
  setCategory: (category: string | undefined) => void
  setSearch: (q: string) => void
  setPage: (page: number) => void
}

function asPage(v: string | null): number {
  const n = Number.parseInt(v ?? "", 10)
  return Number.isFinite(n) && n >= 1 ? n : 1
}

export function useIdeaListUrlState(): UseIdeaListUrlStateReturn {
  const router = useRouter()
  const searchParams = useSearchParams()
  // router.replace re-runs the Server Component (RSC roundtrip) for
  // search-param changes. Wrapping it in a transition makes that change
  // non-urgent, so the click stays responsive and we get a built-in
  // pending flag the UI can use for a skeleton.
  const [isPending, startTransition] = useTransition()

  const tab = asTab(searchParams.get("tab"))
  const sort = asSort(searchParams.get("sort"))
  const category = searchParams.get("category") ?? undefined
  const q = searchParams.get("q") ?? undefined
  const page = asPage(searchParams.get("page"))

  const params: ListIdeasParams = useMemo(
    () => ({
      tab,
      sort,
      category,
      q,
      pagination: { page, limit: DEFAULT_PAGINATION.limit },
    }),
    [tab, sort, category, q, page],
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
      startTransition(() => {
        router.replace(qs ? `/ideas?${qs}` : "/ideas", { scroll: false })
      })
    },
    [router, searchParams],
  )

  // Filter changes reset pagination — staying on page 5 after switching tab
  // would otherwise show the wrong page of a different list.
  const setTab = useCallback(
    (t: IdeaTab) =>
      updateParam({ tab: t === "all" ? undefined : t, page: undefined }),
    [updateParam],
  )

  const setSort = useCallback(
    (s: IdeaSort) =>
      updateParam({ sort: s === "trending" ? undefined : s, page: undefined }),
    [updateParam],
  )

  const setCategory = useCallback(
    (c: string | undefined) => updateParam({ category: c, page: undefined }),
    [updateParam],
  )

  const setSearch = useCallback(
    (s: string) => updateParam({ q: s || undefined, page: undefined }),
    [updateParam],
  )

  const setPage = useCallback(
    (p: number) => updateParam({ page: p <= 1 ? undefined : String(p) }),
    [updateParam],
  )

  return {
    tab,
    sort,
    category,
    q,
    page,
    params,
    isPending,
    setTab,
    setSort,
    setCategory,
    setSearch,
    setPage,
  }
}
