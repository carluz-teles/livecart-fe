"use client"

import { OrderList } from "@/components/order/OrderList"
import { PageHeader } from "@/components/shared/PageHeader"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function OrdersPage() {
  return (
    <OrderList.Provider>
      <OrderList.Frame>
        <PageHeader
          title="Pedidos"
          description="Acompanhe e gerencie os pedidos das suas lives"
        />
        <OrderList.Stats />
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pedidos</CardTitle>
            <CardDescription>
              Visualize e gerencie todos os pedidos das suas lives.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <OrderList.Filters />
              <OrderList.Table />
              <OrderList.Pagination />
            </div>
          </CardContent>
        </Card>
      </OrderList.Frame>
    </OrderList.Provider>
  )
}
