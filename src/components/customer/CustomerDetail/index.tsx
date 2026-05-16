"use client"

import { use } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useCustomer } from "@/hooks/customer"
import { CustomerListContext } from "../CustomerList/CustomerListContext"
import { CustomerDetailHero } from "./CustomerDetail.Hero"
import { CustomerDetailIdentity } from "./CustomerDetail.Identity"
import { CustomerDetailAddress } from "./CustomerDetail.Address"
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
        className="flex w-full flex-col gap-0 overflow-y-auto bg-background p-0 sm:max-w-xl"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Detalhes do cliente</SheetTitle>
          <SheetDescription>
            Identidade, métricas, endereço da última entrega e histórico de pedidos.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 p-6">
          <CustomerDetailHero customer={customer} isLoading={isLoading} />

          {customer && (
            <>
              <CustomerDetailStats customer={customer} isLoading={isLoading} />
              <Separator className="opacity-60" />
              <CustomerDetailIdentity customer={customer} />
              <CustomerDetailAddress address={customer.lastShippingAddress ?? null} />
              <Separator className="opacity-60" />
            </>
          )}

          {selectedCustomerId && (
            <CustomerDetailOrders
              customerId={selectedCustomerId}
              onClose={closeCustomer}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

CustomerDetail.Hero = CustomerDetailHero
CustomerDetail.Stats = CustomerDetailStats
CustomerDetail.Identity = CustomerDetailIdentity
CustomerDetail.Address = CustomerDetailAddress
CustomerDetail.Orders = CustomerDetailOrders
