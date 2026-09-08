"use client"

import { use, useState } from "react"
import { useEventComments } from "@/hooks/event/useEventComments"
import { EventComments } from "../EventComments/EventComments"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailComments() {
  const ctx = use(EventDetailContext)
  const [sessionId, setSessionId] = useState<string>()
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
