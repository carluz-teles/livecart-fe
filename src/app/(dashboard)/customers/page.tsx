"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CustomerList } from "@/components/customer/CustomerList"
import { CustomerDetail } from "@/components/customer/CustomerDetail"

export default function CustomersPage() {
  return (
    <CustomerList.Provider>
      <CustomerList.Frame>
        <CustomerList.Header />
        <CustomerList.Stats />
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <CustomerList.Toolbar />
              <CustomerList.Table />
              <CustomerList.Pagination />
            </div>
          </CardContent>
        </Card>
      </CustomerList.Frame>
      <CustomerDetail />
    </CustomerList.Provider>
  )
}
