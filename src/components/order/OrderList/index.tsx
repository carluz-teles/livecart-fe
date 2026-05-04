"use client"

import { OrderListProvider } from "./OrderList.Provider"
import { OrderListHeader } from "./OrderList.Header"
import { OrderListStats } from "./OrderList.Stats"
import { OrderListFilters } from "./OrderList.Filters"
import { OrderListTable } from "./OrderList.Table"
import { OrderListPagination } from "./OrderList.Pagination"
import { OrderListEmpty } from "./OrderList.Empty"
import { OrderListTabs } from "./OrderList.Tabs"

interface FrameProps {
  children: React.ReactNode
}

function OrderListFrame({ children }: FrameProps) {
  return <div className="flex flex-col gap-6">{children}</div>
}

// Row was removed in the TanStack Table migration — cell rendering moved into
// per-column ColumnDef.cell functions. The few row-level concerns (click to
// open, stuck-row visual) live in OrderList.Table now.
export const OrderList = {
  Provider: OrderListProvider,
  Frame: OrderListFrame,
  Header: OrderListHeader,
  Stats: OrderListStats,
  Tabs: OrderListTabs,
  Filters: OrderListFilters,
  Table: OrderListTable,
  Pagination: OrderListPagination,
  Empty: OrderListEmpty,
}
