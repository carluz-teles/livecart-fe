"use client"

import { Plus, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EventCouponsEmptyProps {
  onCreate: () => void
}

export function EventCouponsEmpty({ onCreate }: EventCouponsEmptyProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full bg-muted"
        aria-hidden="true"
      >
        <Ticket className="h-5 w-5 text-muted-foreground" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
        Cupons
      </span>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        Cupons valem para toda a campanha — anuncie um código durante a transmissão
        para incentivar a compra na hora.
      </p>
      <Button onClick={onCreate} size="sm" className="mt-2">
        <Plus className="mr-2 h-4 w-4" />
        Criar cupom
      </Button>
    </div>
  )
}
