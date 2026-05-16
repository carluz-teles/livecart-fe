"use client"

import { useState } from "react"
import { Copy, ExternalLink, MapPin } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatZipBR } from "@/lib/format"
import type { CustomerShippingAddress } from "@/types/customer.types"

interface CustomerDetailAddressProps {
  address: CustomerShippingAddress | null | undefined
}

function buildFullAddress(addr: CustomerShippingAddress): string {
  const line1 = [addr.street, addr.number].filter(Boolean).join(", ")
  const line2 = [addr.complement, addr.neighborhood].filter(Boolean).join(" — ")
  const line3 = [addr.city, addr.state].filter(Boolean).join("/")
  const cep = addr.zipCode ? `CEP ${formatZipBR(addr.zipCode)}` : ""
  return [line1, line2, line3, cep].filter(Boolean).join("\n")
}

export function CustomerDetailAddress({ address }: CustomerDetailAddressProps) {
  const [copied, setCopied] = useState(false)

  if (!address || (!address.zipCode && !address.street && !address.city)) {
    return (
      <section className="space-y-3">
        <h3 className="text-sm font-semibold tracking-tight">
          Última entrega
        </h3>
        <div className="flex items-center gap-3 rounded-lg border border-dashed bg-muted/20 p-4">
          <MapPin className="h-5 w-5 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">
            Endereço aparecerá após o primeiro checkout completo.
          </p>
        </div>
      </section>
    )
  }

  const line1 = [address.street, address.number].filter(Boolean).join(", ")
  const line2 = [address.complement, address.neighborhood].filter(Boolean).join(" — ")
  const cityState = [address.city, address.state].filter(Boolean).join("/")
  const fullText = buildFullAddress(address)
  const mapsQuery = encodeURIComponent(
    [line1, address.neighborhood, cityState, address.zipCode]
      .filter(Boolean)
      .join(", "),
  )
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      toast.success("Endereço copiado")
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Não foi possível copiar")
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold tracking-tight">Última entrega</h3>
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          do checkout mais recente
        </span>
      </div>
      <div className="group relative overflow-hidden rounded-xl border bg-card p-4">
        {/* Subtle accent on the left edge */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-primary/40 via-primary/20 to-transparent"
        />
        <div className="flex items-start gap-3 pl-2">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5 text-sm leading-snug">
            {line1 && <p className="font-medium">{line1}</p>}
            {line2 && <p className="text-muted-foreground">{line2}</p>}
            {cityState && <p className="text-muted-foreground">{cityState}</p>}
            {address.zipCode && (
              <p className="font-mono text-xs text-muted-foreground/80">
                CEP {formatZipBR(address.zipCode)}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/70 hover:bg-accent hover:text-foreground"
              aria-label="Abrir no Google Maps"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/70 hover:bg-accent hover:text-foreground",
                copied && "bg-emerald-500/10 text-emerald-500 opacity-100",
              )}
              aria-label="Copiar endereço"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
