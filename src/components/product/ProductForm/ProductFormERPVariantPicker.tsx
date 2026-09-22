"use client"

import { useState } from "react"
import { ProductImage as Image } from "@/components/product/ProductImage"
import { Loader2, Package } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useImportERPProduct } from "@/hooks/integration"
import { formatCurrency } from "@/lib/format"
import { getERPSearchErrorMessage } from "@/lib/api-errors"
import { cn } from "@/lib/utils"
import type { ERPProduct } from "@/types"
import { useERPConectado } from "@/hooks/integration"

interface ProductFormERPVariantPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parent: ERPProduct | null
  integrationId: string
  // Called after a successful import so the parent ProductForm sheet can
  // close itself and show whatever it wants to show next.
  onImported: () => void
}

export function ProductFormERPVariantPicker({
  open,
  onOpenChange,
  parent,
  integrationId,
  onImported,
}: ProductFormERPVariantPickerProps) {
  const erp = useERPConectado()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const importProduct = useImportERPProduct()

  const variants = parent?.variants ?? []
  const eligible = variants.filter(v => v.active && !v.alreadyImported)
  const selectedEligible = eligible.filter(v => selected.has(v.id))
  const allSelected = eligible.length > 0 && selectedEligible.length === eligible.length
  const someSelected = selectedEligible.length > 0
  // Empty selection = backend imports every variant. We surface that copy in
  // the button label so the admin knows what they're committing to.
  const importingCount = someSelected ? selectedEligible.length : eligible.length

  const handleClose = (next: boolean) => {
    if (importProduct.isPending) return
    if (!next) setSelected(new Set())
    onOpenChange(next)
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected((prev) =>
      eligible.every(v => prev.has(v.id)) ? new Set() : new Set(eligible.map((v) => v.id))
    )
  }

  const handleImport = () => {
    if (!parent || importProduct.isPending || eligible.length === 0) return
    importProduct.mutate(
      {
        integrationId,
        tinyProductId: parent.id,
        variantIds: eligible.filter(v => !someSelected || selected.has(v.id)).map(v => v.id),
      },
      {
        onSuccess: (result) => {
          // Trust the server's count over what we asked for — it accounts
          // for any backend-side filtering (e.g. variants already present).
          const count = result.imported.length
          toast.success("Produto importado", {
            description: `${count} ${count === 1 ? "variante adicionada" : "variantes adicionadas"} ao catálogo.`,
          })
          setSelected(new Set())
          onOpenChange(false)
          onImported()
        },
        onError: (err) => {
          toast.error("Falha ao importar", {
            description: getERPSearchErrorMessage(err),
          })
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {parent?.imageUrl ? (
              <Image
                src={parent.imageUrl}
                fallbackSources={parent.imageUrls}
                alt=""
                width={28}
                height={28}
                unoptimized
                className="h-7 w-7 rounded-md object-cover"
              />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                <Package className="h-4 w-4 text-muted-foreground" />
              </span>
            )}
            Importar &ldquo;{parent?.name}&rdquo;
          </DialogTitle>
          <DialogDescription>
            Esse produto tem {variants.length}{" "}
            {variants.length === 1 ? "variante" : "variantes"} no {erp.nome}. Marque as
            que quer importar. As disponíveis para importação serão processadas em etapas; as já cadastradas serão preservadas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <button
              type="button"
              onClick={toggleAll}
              disabled={importProduct.isPending}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {allSelected ? "Limpar seleção" : "Selecionar todas"}
            </button>
            <span>
              {someSelected
                ? `${selectedEligible.length} de ${eligible.length} selecionadas`
                : `Importará as restantes (${eligible.length})`}
            </span>
          </div>

          <div className="max-h-[400px] overflow-y-auto rounded-md border">
            <ul className="divide-y">
              {variants.map((variant) => {
                const checked = selected.has(variant.id)
                return (
                  <li
                    key={variant.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                      checked && "bg-primary/5"
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(variant.id)}
                      disabled={importProduct.isPending || !variant.active || variant.alreadyImported}
                      aria-label={`Selecionar variante ${variant.sku ?? variant.id}`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        {Object.entries(variant.attributes ?? {}).map(([k, v]) => (
                          <span
                            key={k}
                            className="inline-flex items-baseline gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs"
                          >
                            <span className="text-muted-foreground">{k}:</span>
                            <span className="font-medium">{v}</span>
                          </span>
                        ))}
                      </div>
                      {variant.sku && (
                        <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                          {variant.sku}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-shrink-0 items-baseline gap-3 text-xs">
                      <span className="font-semibold tabular-nums">
                        {formatCurrency(variant.price)}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-5 px-1.5 text-[10px] tabular-nums",
                          variant.stock === 0 && "text-destructive border-destructive/30"
                        )}
                      >
                        {variant.alreadyImported ? "Já cadastrada" : !variant.active ? "Inativa" : variant.stockKnown === false ? "A confirmar" : `${variant.stock} un`}
                      </Badge>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {importProduct.isError && (
          <p role="alert" className="text-sm text-destructive">
            {getERPSearchErrorMessage(importProduct.error)}{" "}
            {importProduct.progress.completed > 0 && `${importProduct.progress.completed} variantes já foram processadas. Tente novamente para continuar com as restantes.`}
          </p>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={importProduct.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={importProduct.isPending || eligible.length === 0}
          >
            {importProduct.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {importProduct.isPending ? `Importando ${importProduct.progress.completed} de ${importProduct.progress.total}…` : `Importar ${importingCount} ${importingCount === 1 ? "variante" : "variantes"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
