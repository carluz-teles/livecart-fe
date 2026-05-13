"use client"

import { Ban, Mail, Phone } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useBlockedHandle } from "@/hooks/customer"
import type { Customer } from "@/types/customer.types"
import { CustomerDetailBlockAction } from "./CustomerDetail.BlockAction"

interface CustomerDetailHeaderProps {
  customer: Customer | undefined
  isLoading: boolean
}

function initials(handle: string) {
  return handle.slice(0, 2).toUpperCase()
}

export function CustomerDetailHeader({ customer, isLoading }: CustomerDetailHeaderProps) {
  const blocked = useBlockedHandle(customer?.handle)

  if (isLoading || !customer) {
    return (
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 ring-2 ring-primary/20">
          <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
            {initials(customer.handle)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold tracking-tight">
              @{customer.handle}
            </span>
            {blocked && (
              <Badge
                variant="destructive"
                className="gap-1 text-[10px] uppercase tracking-wide"
              >
                <Ban className="h-3 w-3" />
                Bloqueado
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            {customer.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {customer.email}
              </span>
            )}
            {customer.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {customer.phone}
              </span>
            )}
            {!customer.email && !customer.phone && (
              <span className="text-xs italic">
                Contato será preenchido após o checkout
              </span>
            )}
            {blocked?.reason && (
              <span className="mt-1 max-w-xs text-xs italic text-destructive/80">
                Motivo: {blocked.reason}
              </span>
            )}
          </div>
        </div>
      </div>
      <CustomerDetailBlockAction customer={customer} />
    </div>
  )
}
