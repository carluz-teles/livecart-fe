"use client"

import { OrderListProvider } from "./OrderList.Provider"
import { OrderListStats } from "./OrderList.Stats"
import { OrderListFilters } from "./OrderList.Filters"
import { OrderListTable } from "./OrderList.Table"
import { OrderListPagination } from "./OrderList.Pagination"
import { OrderListEmpty } from "./OrderList.Empty"
import { OrderListRow } from "./OrderList.Row"
import { OrderListTabs } from "./OrderList.Tabs"

interface FrameProps {
  children: React.ReactNode
}

function OrderListFrame({ children }: FrameProps) {
  return <div className="flex flex-col gap-6">{children}</div>
}

export const OrderList = {
  Provider: OrderListProvider,
  Frame: OrderListFrame,
  Stats: OrderListStats,
  Tabs: OrderListTabs,
  Filters: OrderListFilters,
  Table: OrderListTable,
  Row: OrderListRow,
  Pagination: OrderListPagination,
  Empty: OrderListEmpty,
}
