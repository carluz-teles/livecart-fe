"use client"

import { use } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCustomer } from "@/hooks/customer"
import { CustomerListContext } from "../CustomerList/CustomerListContext"
import { CustomerDetailHeader } from "./CustomerDetail.Header"
import { CustomerDetailStats } from "./CustomerDetail.Stats"
import { CustomerDetailOrders } from "./CustomerDetail.Orders"

export function CustomerDetail() {
  const ctx = use(CustomerListContext)
  const selectedCustomerId = ctx?.state.selectedCustomerId ?? null
  const closeCustomer = ctx?.actions.closeCustomer ?? (() => {})

  const { data: customer, isLoading } = useCustomer(selectedCustomerId ?? "")

  if (!ctx) return null

  return (
    <Sheet open={!!selectedCustomerId} onOpenChange={(open) => !open && closeCustomer()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-6 overflow-y-auto sm:max-w-lg"
      >
        <SheetHeader className="space-y-0 text-left">
          <SheetTitle className="sr-only">Detalhes do cliente</SheetTitle>
          <SheetDescription className="sr-only">
            Resumo do cliente, métricas e histórico de pedidos.
          </SheetDescription>
          <CustomerDetailHeader customer={customer} isLoading={isLoading} />
        </SheetHeader>

        <CustomerDetailStats customer={customer} isLoading={isLoading} />

        {selectedCustomerId && (
          <CustomerDetailOrders
            customerId={selectedCustomerId}
            onClose={closeCustomer}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

CustomerDetail.Header = CustomerDetailHeader
CustomerDetail.Stats = CustomerDetailStats
CustomerDetail.Orders = CustomerDetailOrders
