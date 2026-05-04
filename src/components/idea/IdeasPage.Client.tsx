"use client"

import { Suspense } from "react"

import { PageHeader } from "@/components/shared/PageHeader"
import { CreateIdeaSheet } from "@/components/idea/CreateIdeaSheet"
import { IdeaFilters } from "@/components/idea/IdeaFilters"
import { IdeaFeed } from "@/components/idea/IdeaFeed"
import { useIdeaListUrlState, useIdeas } from "@/hooks/idea"

// useSearchParams() inside the body must sit under a Suspense boundary so
// the route can prerender the shell. Server-prefetched cache feeds the
// initial render — the client never sees a flash on first paint.
export function IdeasPageClient() {
  return (
    <Suspense fallback={<IdeasPageFallback />}>
      <IdeasPageBody />
    </Suspense>
  )
}

function IdeasPageBody() {
  const {
    tab,
    sort,
    category,
    q,
    page,
    params,
    setTab,
    setSort,
    setCategory,
    setSearch,
    setPage,
  } = useIdeaListUrlState()

  const { data, isLoading, isError, refetch } = useIdeas(params)
  const ideas = data?.data ?? []
  const totalPages = data?.pagination.totalPages ?? 1

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
        onTabChange={setTab}
        onCategoryChange={setCategory}
        onSearchChange={setSearch}
        onSortChange={setSort}
      />

      <IdeaFeed
        ideas={ideas}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />

      {!isLoading && !isError && ideas.length > 0 && (
        <IdeaFeed.Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
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
