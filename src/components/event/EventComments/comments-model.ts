import {
  DESFECHO,
  lerDesfecho,
  type TomDoDesfecho,
} from "@/lib/desfecho-do-comentario"
import type { EventComment, EventSession } from "@/types/event.types"

export type CommentOutcome = TomDoDesfecho | "desconhecido"
export type OutcomeFilter = CommentOutcome | "todos"

export const OUTCOME_LABELS: Record<OutcomeFilter, string> = {
  todos: "Todos os resultados",
  ok: "Adicionados ao carrinho",
  espera: "Na fila / parciais",
  perdida: "Não atendidos",
  neutro: "Sem intenção de compra",
  desconhecido: "Resultado indisponível",
}

export const SESSION_LABELS: Record<string, string> = {
  live: "Live",
  post: "Post",
  reel: "Reel",
  story: "Story",
}

export function sessionName(session?: EventSession) {
  return session
    ? `${SESSION_LABELS[session.type] ?? "Transmissão"} ${session.sequenceOrder}`
    : "Sem transmissão identificada"
}

const EXTRA_RESULTS: Record<string, { label: string; description: string }> = {
  paused: {
    label: "Processamento pausado",
    description:
      "O processamento estava pausado quando este comentário chegou.",
  },
  event_not_started: {
    label: "Evento não iniciado",
    description: "O comentário chegou antes da abertura do evento.",
  },
  event_ended: {
    label: "Evento encerrado",
    description: "A janela de vendas do evento já estava encerrada.",
  },
  session_ended: {
    label: "Transmissão encerrada",
    description: "Esta transmissão já não aceitava pedidos.",
  },
  cart_terminated: {
    label: "Carrinho encerrado",
    description: "O carrinho já estava encerrado ao processar este pedido.",
  },
}

export function commentOutcome(comment: EventComment): {
  group: CommentOutcome
  label: string
  description: string
} {
  const extra = Object.hasOwn(EXTRA_RESULTS, comment.result)
    ? EXTRA_RESULTS[comment.result]
    : undefined
  if (extra) return { group: "perdida", ...extra }

  const outcome = Object.hasOwn(DESFECHO, comment.result)
    ? lerDesfecho(comment.result)
    : null
  if (outcome) {
    return {
      group: outcome.tom,
      label:
        comment.result === "added_to_cart" ? "No carrinho" : outcome.rotulo,
      description:
        outcome.nota ??
        "O comentário adicionou um item ao carrinho. O pagamento é acompanhado no pedido.",
    }
  }
  if (comment.result === "no_intent") {
    return {
      group: "neutro",
      label: "Sem intenção de compra",
      description:
        "Não foi identificado um pedido de produto neste comentário.",
    }
  }
  // Um resultado ausente ou novo não prova ausência de intenção, nem que o
  // processamento ainda esteja em andamento.
  return {
    group: "desconhecido",
    label: "Resultado indisponível",
    description: comment.hasPurchaseIntent
      ? "Há intenção de compra registrada, mas o resultado não está disponível nesta tela."
      : "Não há um resultado reconhecido para este comentário.",
  }
}

export function normalizeCommentSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim()
}

export function matchesCommentSearch(comment: EventComment, search: string) {
  const text = normalizeCommentSearch(
    [
      `@${comment.handle.replace(/^@/, "")}`,
      comment.text,
      comment.productName,
      comment.productKeyword,
    ]
      .filter(Boolean)
      .join(" "),
  )
  return normalizeCommentSearch(search)
    .split(/\s+/)
    .every((term) => text.includes(term))
}

export function uniqueComments(pages: EventComment[][] = []) {
  const comments = new Map<string, EventComment>()
  for (const page of pages)
    for (const comment of page) comments.set(comment.id, comment)
  return [...comments.values()]
}

export function formatCommentDate(iso: string, includeTime = false) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "Data indisponível"
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime
      ? ({ hour: "2-digit", minute: "2-digit", second: "2-digit" } as const)
      : {}),
  })
}

export function formatCommentTime(iso: string) {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}
