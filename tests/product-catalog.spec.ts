import { expect, test } from "@playwright/test"
import { createProductPayload, productFormFromERP, updateProductPayload } from "../src/hooks/product/product-form"
import { createProductSchema, updateProductSchema } from "../src/schemas/product.schema"
import type { ERPProduct } from "../src/types/integration.types"
import type { Product } from "../src/types/product.types"

const erpProduct: ERPProduct = {
  id: "848285025",
  name: "LUZ DECORATIVA GALHO - 2m",
  sku: "47169001",
  gtin: "7893979655073",
  price: 7990,
  stock: 7,
  active: true,
}

// Passing through Zod is essential: unknown fields used to disappear here.
const parsedForm = () => createProductSchema.parse(productFormFromERP(erpProduct, "tiny"))
const persistedProduct = (): Product => ({
  ...parsedForm(),
  id: "local-product",
  keyword: "2448",
  externalId: erpProduct.id,
  imageUrl: null,
  active: true,
  shippable: false,
  groupId: null,
  images: [],
  optionValues: [],
  createdAt: "2026-09-12T13:14:09Z",
  updatedAt: "2026-09-12T13:14:09Z",
})

test("importação salva SKU e código de barras mesmo sem medidas", () => {
  const payload = JSON.parse(JSON.stringify(createProductPayload(parsedForm())))
  expect(payload).toMatchObject({
    externalId: "848285025",
    externalSource: "tiny",
    shipping: { sku: "47169001", barcode: "7893979655073", weightGrams: null },
  })
})

test("identificadores mantêm zeros à esquerda e não dependem do perfil físico do ERP", () => {
  const data = createProductSchema.parse(productFormFromERP({
    ...erpProduct,
    sku: "0047169001",
    gtin: "07893979655073",
    shipping: { weightGrams: 100, heightCm: 10, widthCm: 20, lengthCm: 30, packageFormat: "box" },
  }, "tiny"))
  expect(createProductPayload(data).shipping).toMatchObject({
    sku: "0047169001", barcode: "07893979655073", weightGrams: 100,
  })
})

test("editar o nome preserva o código de barras na validação e omite identificadores inalterados", () => {
  const data = updateProductSchema.parse({ ...parsedForm(), name: "Galho editado", active: true })
  expect(data.shipping.barcode).toBe("7893979655073")
  const payload = JSON.parse(JSON.stringify(updateProductPayload(data, persistedProduct())))
  expect(payload.name).toBe("Galho editado")
  expect(payload.shipping).not.toHaveProperty("barcode")
  expect(payload.shipping).not.toHaveProperty("sku")
})

test("formulário legado aberto antes do SYNC não sobrescreve identificadores recuperados", () => {
  const original = persistedProduct()
  original.shipping = { ...original.shipping, sku: "", barcode: "" }
  const data = updateProductSchema.parse({ ...parsedForm(), shipping: original.shipping, active: true })
  const payload = JSON.parse(JSON.stringify(updateProductPayload(data, original)))
  expect(payload.shipping).not.toHaveProperty("sku")
  expect(payload.shipping).not.toHaveProperty("barcode")
})

test("alteração explícita de SKU e remoção do código de barras são enviadas", () => {
  const data = updateProductSchema.parse({
    ...parsedForm(), active: true,
    shipping: { ...parsedForm().shipping, sku: "NOVO-47169001", barcode: "" },
  })
  expect(updateProductPayload(data, persistedProduct()).shipping).toMatchObject({
    sku: "NOVO-47169001", barcode: "",
  })
})

test("retirar dimensões continua possível sem apagar os identificadores", () => {
  const original = persistedProduct()
  original.shipping = { ...original.shipping, weightGrams: 100, heightCm: 10, widthCm: 20, lengthCm: 30 }
  const data = updateProductSchema.parse({ ...parsedForm(), active: true })
  const payload = JSON.parse(JSON.stringify(updateProductPayload(data, original)))
  expect(payload.shipping).toMatchObject({ weightGrams: null, heightCm: null, widthCm: null, lengthCm: null })
  expect(payload.shipping).not.toHaveProperty("sku")
  expect(payload.shipping).not.toHaveProperty("barcode")
})

test("ERP que não informa GTIN continua podendo ser importado", () => {
  const data = createProductSchema.parse(productFormFromERP({ ...erpProduct, gtin: undefined }, "tiny"))
  expect(createProductPayload(data).shipping?.sku).toBe("47169001")
  expect(createProductPayload(data).shipping?.barcode).toBeUndefined()
})
