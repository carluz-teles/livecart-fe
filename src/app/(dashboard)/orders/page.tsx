"use client"

import { OrderList } from "@/components/order/OrderList"
import { Card, CardContent } from "@/components/ui/card"

export default function OrdersPage() {
  return (
    <OrderList.Provider>
      <OrderList.Frame>
        <OrderList.Header />
        <OrderList.Tabs />
        <OrderList.Stats />
        <Card>
          <CardContent className="pt-6">
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
