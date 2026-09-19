import { expect, test } from "@playwright/test"
import { integrationService } from "../src/services/api/integration.service"

const originalFetch = globalThis.fetch

test.afterEach(() => { globalThis.fetch = originalFetch })

test("busca lista prévias e consulta apenas o produto selecionado", async () => {
  const requests: string[] = []
  globalThis.fetch = async (input) => {
    requests.push(String(input))
    return new Response(JSON.stringify({ data: {} }), { status: 200 })
  }
  await integrationService.searchProducts("store", "integration", "Luz & Natal", "token")
  await integrationService.getProductDetails("store", "integration", "product-1", "token")
  expect(requests[0]).toContain("summary=true&search=Luz%20%26%20Natal")
  expect(requests[1]).toContain("/products/product-1")
  expect(requests).toHaveLength(2)
})

test("trocar a busca cancela a requisição sem apresentar timeout", async () => {
  globalThis.fetch = async (_, init) => new Promise((_, reject) => {
    init!.signal!.addEventListener("abort", () => reject(new DOMException("Cancelled", "AbortError")))
  })
  const abort = new AbortController()
  const request = integrationService.searchProducts("store", "integration", "Natal", "token", abort.signal)
  abort.abort()
  await expect(request).rejects.toMatchObject({ name: "AbortError" })
})

test("importação aguarda uma resposta válida que passa dos dez segundos antigos", async () => {
  globalThis.fetch = async (_, init) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(new Response(JSON.stringify({ data: { id: "barcode-match", products: [{ id: "barcode-match" }] } }), { status: 200 })), 10_200)
    init!.signal!.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(new DOMException("Timed out", "AbortError"))
    }, { once: true })
  })
  const [result, selected] = await Promise.all([
    integrationService.searchProducts("store", "integration", "7893979655073", "token"),
    integrationService.getProductDetails("store", "integration", "barcode-match", "token"),
  ])
  expect(result.products[0].id).toBe("barcode-match")
  expect(selected.id).toBe("barcode-match")
})
