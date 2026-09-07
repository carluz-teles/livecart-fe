"use client"
import { use } from "react"
import { ListPagination } from "@/components/shared/ListPagination"
import { CustomerListContext } from "./CustomerListContext"
export function CustomerListPagination() {
  const ctx = use(CustomerListContext)
  if (!ctx) return null
  const { pagination, totalPages, total, isLoading, isFetching, error } =
    ctx.state
  return (
    <ListPagination
      {...pagination}
      total={error ? undefined : total}
      totalPages={totalPages}
      onPageChange={ctx.actions.setPage}
      busy={isLoading || isFetching}
      noun="clientes"
    />
  )
}
