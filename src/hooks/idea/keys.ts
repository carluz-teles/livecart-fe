import type { ListIdeasParams } from "@/types/idea.types"

// Plain query-key factory — kept out of any "use client" file so Server
// Components (e.g. /ideas/page.tsx prefetch) can import the real object
// instead of a client-reference proxy.
export const ideaKeys = {
  all: ["ideas"] as const,
  lists: () => [...ideaKeys.all, "list"] as const,
  list: (params?: ListIdeasParams) =>
    [...ideaKeys.lists(), params ?? {}] as const,
  details: () => [...ideaKeys.all, "detail"] as const,
  detail: (id: string) => [...ideaKeys.details(), id] as const,
  categories: () => [...ideaKeys.all, "categories"] as const,
}
