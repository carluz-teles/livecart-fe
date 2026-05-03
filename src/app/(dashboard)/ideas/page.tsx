"use client"

import { Suspense, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { PageHeader } from "@/components/shared/PageHeader"
import { CreateIdeaSheet } from "@/components/idea/CreateIdeaSheet"
import { IdeaFilters } from "@/components/idea/IdeaFilters"
import { IdeaFeed } from "@/components/idea/IdeaFeed"
import { useIdeas } from "@/hooks/idea"
import { DEFAULT_PAGINATION } from "@/types/api.types"
import type { IdeaSort, IdeaTab, ListIdeasParams } from "@/types/idea.types"

const VALID_TABS: IdeaTab[] = ["all", "new", "mine", "under_study", "completed"]
const VALID_SORTS: IdeaSort[] = ["trending", "new"]

function asTab(v: string | null): IdeaTab {
  return VALID_TABS.includes(v as IdeaTab) ? (v as IdeaTab) : "all"
}
function asSort(v: string | null): IdeaSort {
  return VALID_SORTS.includes(v as IdeaSort) ? (v as IdeaSort) : "trending"
}

// Next 15 forces useSearchParams() readers to be wrapped in <Suspense> so the
// page can statically pre-render the shell while the URL params resolve on
// the client. The inner component owns the param-dependent state.
export default function IdeasPage() {
  return (
    <Suspense fallback={<IdeasPageFallback />}>
      <IdeasPageContent />
    </Suspense>
  )
}

function IdeasPageContent() {
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

  const { data, isLoading, isError, refetch } = useIdeas(params)
  const ideas = data?.data ?? []

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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Canal de Ideias"
        description="Compartilhe sugestões, vote nas que importam e acompanhe o que entra no roadmap."
      >
        <CreateIdeaSheet />
      </PageHeader>

      <IdeaFilters
        tab={tab}
        category={category}
        q={q}
        sort={sort}
        onTabChange={(t) => updateParam({ tab: t === "all" ? undefined : t })}
        onCategoryChange={(c) => updateParam({ category: c })}
        onSearchChange={(s) => updateParam({ q: s || undefined })}
        onSortChange={(s) => updateParam({ sort: s === "trending" ? undefined : s })}
      />

      <IdeaFeed
        ideas={ideas}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />
    </div>
  )
}

function IdeasPageFallback() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Canal de Ideias"
        description="Compartilhe sugestões, vote nas que importam e acompanhe o que entra no roadmap."
      >
        <CreateIdeaSheet />
      </PageHeader>
      <IdeaFeed ideas={[]} isLoading isError={false} />
    </div>
  )
}
