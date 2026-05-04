import { auth } from "@clerk/nextjs/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { IdeasPageClient } from "@/components/idea/IdeasPage.Client"
import { ideaKeys } from "@/hooks/idea"
import { getQueryClient } from "@/lib/get-query-client"
import { ideaService } from "@/services/api/idea.service"
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

function asTab(v: string | string[] | undefined): IdeaTab {
  const s = typeof v === "string" ? v : undefined
  return VALID_TABS.includes(s as IdeaTab) ? (s as IdeaTab) : "all"
}

function asSort(v: string | string[] | undefined): IdeaSort {
  const s = typeof v === "string" ? v : undefined
  return VALID_SORTS.includes(s as IdeaSort) ? (s as IdeaSort) : "trending"
}

function asString(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined
}

function asPage(v: string | string[] | undefined): number {
  const s = typeof v === "string" ? v : undefined
  const n = Number.parseInt(s ?? "", 10)
  return Number.isFinite(n) && n >= 1 ? n : 1
}

interface IdeasPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function IdeasPage({ searchParams }: IdeasPageProps) {
  const sp = await searchParams

  // Same shape useIdeaListUrlState produces on the client — keys must match
  // exactly so React Query reuses the prefetched entry on first paint.
  const params: ListIdeasParams = {
    tab: asTab(sp.tab),
    sort: asSort(sp.sort),
    category: asString(sp.category),
    q: asString(sp.q),
    pagination: { page: asPage(sp.page), limit: DEFAULT_PAGINATION.limit },
  }

  const queryClient = getQueryClient()
  const { getToken } = await auth()
  const token = await getToken()

  // allSettled: a 401/500 on either prefetch must not 500 the page —
  // the client query will refetch and surface the error in IdeaFeed.
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ideaKeys.list(params),
      queryFn: () => ideaService.list(params, token),
    }),
    queryClient.prefetchQuery({
      queryKey: ideaKeys.categories(),
      queryFn: () => ideaService.listCategories(token),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IdeasPageClient />
    </HydrationBoundary>
  )
}
