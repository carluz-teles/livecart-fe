"use client"

import { use, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useEventComments } from "@/hooks/event/useEventComments"
import { EventComments } from "../EventComments/EventComments"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailComments() {
  const ctx = use(EventDetailContext)
  const params = useSearchParams()
  const initialSession = params.get("commentsSession")
  const [sessionId, setSessionId] = useState<string | undefined>(() =>
    ctx?.state.event.sessions?.some((session) => session.id === initialSession) ? initialSession! : undefined,
  )
  const query = useEventComments(ctx?.state.event.id ?? "", sessionId)

  if (!ctx) return null

  return (
    <EventComments
      event={ctx.state.event}
      sessionId={sessionId}
      onSessionChange={setSessionId}
      pages={query.data?.pages}
      loading={query.isLoading}
      error={query.isError}
      refreshing={query.isRefetching}
      updatedAt={query.dataUpdatedAt}
      hasMore={query.hasNextPage}
      loadingMore={query.isFetchingNextPage}
      loadMoreError={query.isFetchNextPageError}
      onLoadMore={() => {
        void query.fetchNextPage()
      }}
      onRefresh={() => {
        void query.refetch()
      }}
    />
  )
}
