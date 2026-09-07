import { test, expect } from "@playwright/test"
import { QueryClient } from "@tanstack/react-query"
import { eventKeys } from "../src/hooks/event/useEvents"
import {
  commentOutcome,
  matchesCommentSearch,
  sessionName,
  uniqueComments,
} from "../src/components/event/EventComments/comments-model"
import type { EventComment } from "../src/types/event.types"

const comment = (overrides: Partial<EventComment> = {}): EventComment => ({
  id: "comment-1",
  platformCommentId: "instagram-1",
  handle: "cliente.exemplo",
  text: "Eu quero 8200",
  hasPurchaseIntent: true,
  hidden: false,
  createdAt: "2026-09-06T22:00:00Z",
  result: "added_to_cart",
  productName: "Decoração com laço",
  productKeyword: "8200",
  quantity: 2,
  ...overrides,
})

test("resultado ausente ou novo não é classificado como ausência de intenção", () => {
  for (const result of ["", "novo_resultado", "constructor", "__proto__"]) {
    for (const hasPurchaseIntent of [true, false]) {
      expect(commentOutcome(comment({ result, hasPurchaseIntent })).group).toBe(
        "desconhecido",
      )
    }
  }
  expect(
    commentOutcome(comment({ result: "no_intent", hasPurchaseIntent: false }))
      .group,
  ).toBe("neutro")
})

test("adição ao carrinho não afirma pagamento e parcial pertence à fila", () => {
  expect(commentOutcome(comment()).label).toBe("No carrinho")
  for (const result of [
    "partial_fulfillment",
    "waitlisted",
    "already_waitlisted",
  ]) {
    expect(commentOutcome(comment({ result })).group).toBe("espera")
  }
})

test("recusas e pausas mostram o motivo sem perder o comentário", () => {
  for (const result of [
    "out_of_stock",
    "no_product",
    "blocked",
    "max_quantity_reached",
    "not_in_promo",
    "paused",
    "event_not_started",
    "event_ended",
    "session_ended",
    "cart_terminated",
  ]) {
    const outcome = commentOutcome(comment({ result }))
    expect(outcome.group).toBe("perdida")
    expect(outcome.description.length).toBeGreaterThan(10)
  }
})

test("busca aceita perfil com arroba, acentos, código e termos combinados", () => {
  for (const search of [
    "@CLIENTE.EXEMPLO",
    "  decoracao  laco ",
    "8200",
    "quero 8200",
  ]) {
    expect(matchesCommentSearch(comment(), search)).toBe(true)
  }
  expect(matchesCommentSearch(comment(), "8200 outro-produto")).toBe(false)
  expect(
    matchesCommentSearch(
      comment({ handle: "@cliente.exemplo" }),
      "@cliente.exemplo",
    ),
  ).toBe(true)
})

test("comentário sem produto ainda pode ser encontrado por texto e perfil", () => {
  const unmatched = comment({
    result: "no_product",
    productName: undefined,
    productKeyword: undefined,
  })
  expect(matchesCommentSearch(unmatched, "8200")).toBe(true)
  expect(matchesCommentSearch(unmatched, "@cliente.exemplo")).toBe(true)
  expect(sessionName()).toBe("Sem transmissão identificada")
})

test("páginas sobrepostas não inflam contagens nem descartam comentários iguais com IDs distintos", () => {
  const original = comment()
  const newer = comment({ result: "waitlisted" })
  const another = comment({ id: "comment-2" })
  const pages = [[original], [newer, another]]
  expect(uniqueComments(pages)).toEqual([newer, another])
  expect(pages[0][0]).toBe(original)
  expect(uniqueComments()).toEqual([])
})

test("atualização invalida todas as transmissões do evento e preserva outras lojas e eventos", async () => {
  const client = new QueryClient()
  const affected = [
    eventKeys.detailComments("store-a", "event-a"),
    eventKeys.detailComments("store-a", "event-a", "session-1"),
    eventKeys.detailComments("store-a", "event-a", "session-2"),
  ]
  const unaffected = [
    eventKeys.detailComments("store-b", "event-a", "session-1"),
    eventKeys.detailComments("store-a", "event-b", "session-1"),
  ]
  try {
    for (const key of [...affected, ...unaffected])
      client.setQueryData(key, { pages: [[comment()]], pageParams: [0] })
    await client.invalidateQueries({
      queryKey: eventKeys.commentsRoot("store-a", "event-a"),
    })
    for (const key of affected)
      expect(client.getQueryState(key)?.isInvalidated).toBe(true)
    for (const key of unaffected)
      expect(client.getQueryState(key)?.isInvalidated).toBe(false)
  } finally {
    client.clear()
  }
})
