"use client"

import { CustomerListProvider } from "./CustomerList.Provider"
import { CustomerListHeader } from "./CustomerList.Header"
import { CustomerListStats } from "./CustomerList.Stats"
import { CustomerListToolbar } from "./CustomerList.Toolbar"
import { CustomerListTable } from "./CustomerList.Table"
import { CustomerListPagination } from "./CustomerList.Pagination"

interface FrameProps {
  children: React.ReactNode
}

function CustomerListFrame({ children }: FrameProps) {
  return <div className="flex flex-col gap-6">{children}</div>
}

export const CustomerList = {
  Provider: CustomerListProvider,
  Frame: CustomerListFrame,
  Header: CustomerListHeader,
  Stats: CustomerListStats,
  Toolbar: CustomerListToolbar,
  Table: CustomerListTable,
  Pagination: CustomerListPagination,
}
