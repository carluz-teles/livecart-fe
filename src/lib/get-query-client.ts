import {
  QueryClient,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query"
import { cache } from "react"

// Server-only QueryClient factory. React's cache() makes this per-request
// inside an RSC pass — every Server Component that imports this gets the
// same instance for the duration of one request, so sibling prefetches
// share the cache and the dehydrated state lands on the client whole.
//
// Pattern from TanStack Query v5 advanced SSR docs:
// https://tanstack.com/query/v5/docs/framework/react/guides/advanced-ssr
export const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000,
        },
        dehydrate: {
          // Dehydrate pending queries too so clients can pick them up
          // mid-flight when streaming becomes interesting later.
          shouldDehydrateQuery: (query) =>
            defaultShouldDehydrateQuery(query) ||
            query.state.status === "pending",
        },
      },
    }),
)
