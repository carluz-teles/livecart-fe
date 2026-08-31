"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ImageUploadButton } from "./ImageUploadButton"
import { formatCentsBRL, digitsToCents } from "./priceMask"

export interface VariantDraft {
  optionValues: string[]
  price: number // cents
  stock: number
  sku?: string
  imageUrl?: string
}

interface ProductFormVariantMatrixProps {
  optionNames: string[]
  variants: VariantDraft[]
  onChange: (next: VariantDraft[]) => void
  errors?: Array<Partial<Record<keyof VariantDraft, string>>>
}

export function ProductFormVariantMatrix({
  optionNames,
  variants,
  onChange,
  errors,
}: ProductFormVariantMatrixProps) {
  const updateVariant = (index: number, patch: Partial<VariantDraft>) => {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)))
  }

  if (variants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Defina ao menos uma opção e seus valores acima — as variantes serão
        geradas automaticamente.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <Label>
          Variantes <span className="text-muted-foreground font-normal">({variants.length})</span>
        </Label>
        <BulkActions variants={variants} onChange={onChange} />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{optionNames.join(" · ") || "Combinação"}</TableHead>
              <TableHead className="w-[140px]">Preço</TableHead>
              <TableHead className="w-[100px]">Estoque</TableHead>
              <TableHead className="w-[160px]">SKU</TableHead>
              <TableHead className="w-[220px]">Imagem (URL)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant, i) => {
              const error = errors?.[i]
              return (
                <TableRow key={variant.optionValues.join("⟂")}>
                  <TableCell className="font-medium">
                    <span className="inline-flex flex-wrap gap-1.5">
                      {variant.optionValues.map((val, idx) => (
                        <span
                          key={idx}
                          className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs"
                        >
                          {val}
                        </span>
                      ))}
                    </span>
                  </TableCell>
                  <TableCell>
                    <PriceCell
                      value={variant.price}
                      onChange={(price) => updateVariant(i, { price })}
                      error={error?.price}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(i, {
                          stock: e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 0,
                        })
                      }
                      aria-invalid={!!error?.stock}
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="OPCIONAL"
                      value={variant.sku ?? ""}
                      onChange={(e) => updateVariant(i, { sku: e.target.value })}
                      maxLength={100}
                      className="h-9 font-mono text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1.5">
                      <Input
                        type="url"
                        placeholder="https://..."
                        value={variant.imageUrl ?? ""}
                        onChange={(e) =>
                          updateVariant(i, { imageUrl: e.target.value })
                        }
                        aria-invalid={!!error?.imageUrl}
                        className={cn(
                          "h-9 text-xs",
                          error?.imageUrl && "border-destructive"
                        )}
                      />
                      <ImageUploadButton
                        label="Enviar"
                        className="h-7 w-full text-xs"
                        onUploaded={(url) => updateVariant(i, { imageUrl: url })}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

interface BulkActionsProps {
  variants: VariantDraft[]
  onChange: (next: VariantDraft[]) => void
}

function BulkActions({ variants, onChange }: BulkActionsProps) {
  const [open, setOpen] = useState(false)
  const [bulkPrice, setBulkPrice] = useState("")
  const [bulkStock, setBulkStock] = useState("")

  const apply = () => {
    let next = variants
    const price = bulkPrice ? digitsToCents(bulkPrice) : null
    const stock = bulkStock !== "" ? parseInt(bulkStock, 10) : null
    if (price !== null && !Number.isNaN(price)) {
      next = next.map((v) => ({ ...v, price }))
    }
    if (stock !== null && !Number.isNaN(stock)) {
      next = next.map((v) => ({ ...v, stock }))
    }
    onChange(next)
    setOpen(false)
    setBulkPrice("")
    setBulkStock("")
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
        Aplicar em todas
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Preço (R$)"
        inputMode="decimal"
        value={formatCentsBRL(digitsToCents(bulkPrice))}
        onChange={(e) => setBulkPrice(e.target.value)}
        className="h-8 w-28 text-xs"
      />
      <Input
        placeholder="Estoque"
        value={bulkStock}
        onChange={(e) => setBulkStock(e.target.value)}
        type="number"
        className="h-8 w-24 text-xs"
      />
      <Button type="button" size="sm" onClick={apply}>
        Aplicar
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setOpen(false)}
      >
        Cancelar
      </Button>
    </div>
  )
}

interface PriceCellProps {
  value: number
  onChange: (cents: number) => void
  error?: string
}

function PriceCell({ value, onChange, error }: PriceCellProps) {
  // Cents-accumulator BRL mask. Stored value stays in cents.
  const [display, setDisplay] = useState(() => formatCentsBRL(value))

  // Re-sync if the parent bulk-applied a price.
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    setDisplay(formatCentsBRL(value))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cents = digitsToCents(e.target.value)
    setDisplay(formatCentsBRL(cents))
    onChange(cents)
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        R$
      </span>
      <Input
        value={display}
        onChange={handleChange}
        inputMode="decimal"
        placeholder="0,00"
        aria-invalid={!!error}
        className={cn("h-9 pl-8 text-xs", error && "border-destructive")}
      />
    </div>
  )
}
