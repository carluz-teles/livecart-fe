"use client"

import { ProductSpreadsheetImport } from "@/components/product/ProductSpreadsheetImport"
import { useProductImport } from "@/hooks/product/useProductImport"
import { useListReturnURL } from "@/hooks/shared/useListUrlState"

export default function ProductImportPage() {
  const { storeId, preview, apply } = useProductImport()
  const backHref = useListReturnURL("/products")
  if (!storeId) return <p role="status">Carregando loja…</p>
  return (
    <ProductSpreadsheetImport
      key={storeId}
      backHref={backHref}
      onPreview={preview.mutateAsync}
      onApply={apply.mutateAsync}
    />
  )
}
