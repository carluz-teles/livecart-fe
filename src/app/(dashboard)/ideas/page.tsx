"use client"

import { Suspense } from "react"

import { PageHeader } from "@/components/shared/PageHeader"
import { CreateIdeaSheet } from "@/components/idea/CreateIdeaSheet"
import { IdeaFilters } from "@/components/idea/IdeaFilters"
import { IdeaFeed } from "@/components/idea/IdeaFeed"
import { useIdeaListUrlState, useIdeas } from "@/hooks/idea"

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
