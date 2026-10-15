"use client"
import { ProductSpreadsheetImport } from "../../../../src/components/product/ProductSpreadsheetImport"
import { productService } from "../../../../src/services/api/product.service"
export default function Page() {
  return <ProductSpreadsheetImport backHref="/products" onPreview={request => productService.previewImport("audit-store", request, "fixture")} onApply={request => productService.applyImport("audit-store", request, "fixture")} />
}
