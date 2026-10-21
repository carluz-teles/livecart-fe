"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { EventComments } from "../../../../src/components/event/EventComments/EventComments"
import { useEventComments } from "../../../../src/hooks/event/useEventComments"

function Comments() {
  const params = useSearchParams()
  const query = useEventComments("audit-event")
  return <EventComments
    event={{ id: "audit-event", status: params.get("ended") ? "ended" : "active", sessions: [] }}
    onSessionChange={() => undefined}
    pages={query.data?.pages}
    loading={query.isLoading}
    error={query.isError}
    refreshing={query.isRefetching}
    updatedAt={query.dataUpdatedAt}
    hasMore={query.hasNextPage}
    loadingMore={query.isFetchingNextPage}
    loadMoreError={query.isFetchNextPageError}
    onLoadMore={() => { void query.fetchNextPage() }}
    onRefresh={() => { void query.refetch() }}
  />
}

export default function Page() {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  return <QueryClientProvider client={client}><Suspense><Comments /></Suspense></QueryClientProvider>
}
