import { expect, test } from "@playwright/test"
import { resyncProgress } from "../src/hooks/integration/resync-progress"
import type { Integration, ERPResyncProgress as Checkpoint } from "../src/types/integration.types"

function integration(checkpoint: Partial<Checkpoint> = {}): Integration {
  return {
    id: "tiny", storeId: "store", type: "erp", provider: "tiny", status: "active",
    priority: 0, createdAt: "2026-09-17T12:00:00Z",
    erpResync: {
      runId: "new-run", status: "running", total: 1537, done: 700,
      succeeded: 698, failed: 2, startedAt: "2026-09-17T12:00:00Z",
      updatedAt: "2026-09-17T12:30:00Z", nextAttemptAt: "2026-09-17T12:31:00Z",
      ...checkpoint,
    },
  }
}

test("SYNC mostra processados, atualizados, falhas e restantes separadamente", () => {
  const progress = resyncProgress(integration())
  expect(progress).toMatchObject({ done: 700, succeeded: 698, failed: 2, remaining: 837, percent: 45.5 })

})

test("conclusão com falhas mantém o resumo sem anunciar sucesso total", () => {
  const progress = resyncProgress(integration({
    status: "completed_with_errors", done: 1537, succeeded: 1535, failed: 2,
    finishedAt: "2026-09-17T13:00:00Z",
  }))
  expect(progress).toMatchObject({ running: false, remaining: 0, percent: 100, failed: 2 })
  expect(progress.label).toBe("Concluída com pendências")
  expect(progress.description).toContain("alguns produtos não foram atualizados")
})

test("retentativa preserva progresso e informa quando pode retomar", () => {
  const progress = resyncProgress(integration({ status: "retrying" }))
  expect(progress).toMatchObject({ running: true, done: 700, remaining: 837, nextAttemptAt: "2026-09-17T12:31:00Z" })
  expect(progress.description).toContain("progresso está salvo")
})

test("não arredonda para 100% antes do último produto", () => {
  expect(resyncProgress(integration({ total: 10000, done: 9999 })).percent).toBe(99.9)
})

test("marcador legado interrompido não bloqueia novo SYNC nem exibe data zero", () => {
  const progress = resyncProgress(integration({
    runId: "", status: "interrupted", done: 0, total: 0, updatedAt: "0001-01-01T00:00:00Z",
  }))
  expect(progress).toMatchObject({ running: false, percent: null, updatedAt: undefined })
  expect(progress.description).toContain("Inicie uma nova sincronização")
})

test("resposta antiga sem checkpoint continua exibindo os contadores disponíveis", () => {
  const row = integration()
  delete row.erpResync
  row.erpResyncRunning = true
  row.erpResyncDone = 10
  row.erpResyncTotal = 20
  expect(resyncProgress(row)).toMatchObject({ running: true, percent: 50, succeeded: null, failed: null })
})

test("loja sem sincronização não recebe percentual inventado", () => {
  expect(resyncProgress()).toMatchObject({ status: "idle", running: false, percent: null, total: 0 })
})
