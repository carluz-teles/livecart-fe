import type { Integration } from "@/types"

const stages = {
  idle: ["Sem sincronização em andamento", "Inicie uma sincronização para atualizar todos os produtos vinculados ao ERP."],
  queued: ["Na fila", "A sincronização está na fila. Você pode sair desta tela e acompanhar depois."],
  running: ["Em andamento", "Atualizando preço, estoque disponível e dados dos produtos no ritmo permitido pelo ERP."],
  retrying: ["Aguardando nova tentativa", "O progresso está salvo. A sincronização será retomada automaticamente, respeitando o limite do ERP."],
  completed: ["Concluída", "Todos os produtos desta sincronização foram atualizados."],
  completed_with_errors: ["Concluída com pendências", "O processamento terminou, mas alguns produtos não foram atualizados. Confira as pendências antes de iniciar outra sincronização."],
  failed: ["Interrompida", "A sincronização não conseguiu continuar. O progresso abaixo foi preservado; confira a integração e tente novamente."],
  interrupted: ["Execução anterior sem acompanhamento", "Não há confirmação de uma sincronização ativa. Inicie uma nova sincronização para acompanhar o catálogo."],
} as const

export function resyncProgress(integration?: Integration) {
  const checkpoint = integration?.erpResync
  const status = checkpoint?.status ?? (integration?.erpResyncRunning ? "running" : "idle")
  const stage = Object.prototype.hasOwnProperty.call(stages, status)
    ? stages[status as keyof typeof stages]
    : stages.interrupted
  const total = Math.max(0, checkpoint?.total ?? integration?.erpResyncTotal ?? 0)
  const done = Math.min(total, Math.max(0, checkpoint?.done ?? integration?.erpResyncDone ?? 0))
  return {
    status,
    label: stage[0],
    description: stage[1],
    running: ["queued", "running", "retrying"].includes(status),
    total,
    done,
    remaining: total - done,
    // Rounding to 100% before the final product has finished is misleading.
    percent: total > 0 ? Math.floor((done / total) * 1000) / 10 : null,
    succeeded: checkpoint?.succeeded ?? null,
    failed: checkpoint?.failed ?? null,
    updatedAt: checkpoint?.runId ? checkpoint.updatedAt : undefined,
    finishedAt: checkpoint?.runId ? checkpoint.finishedAt : undefined,
    nextAttemptAt: status === "retrying" ? checkpoint?.nextAttemptAt : undefined,
  }
}

export type ResyncProgressView = ReturnType<typeof resyncProgress>
