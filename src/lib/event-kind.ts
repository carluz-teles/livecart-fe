/**
 * A espécie de um evento sai das SESSÕES dele, nunca de `event.type`.
 *
 * Por que este módulo existe: `live_events.type` é dropado pela migration
 * 000119, e antes disso ele já mentia. Um Evento passou a ser a campanha
 * guarda-chuva — pode ter uma live na segunda e um story na quinta — e um
 * campo único no container não tem como descrever isso. O backend passou a
 * enviar `sessionTypes` (os tipos distintos de `live_sessions.type`) na lista
 * e no detalhe justamente para que a tela olhe para dentro da campanha.
 *
 * Este arquivo é o ÚNICO lugar do frontend que decide "que espécie de evento é
 * este". Espalhar `type === "post"` por dez componentes foi o que tornou o drop
 * da coluna um risco de derrubar a tela inteira.
 */

/** Espécie de UMA transmissão — espelha o CHECK de `live_sessions.type`. */
export type SessionType = "live" | "post" | "reel" | "story"

export interface EventKind {
  /** Espécies distintas presentes na campanha, na ordem em que apareceram. */
  types: SessionType[]
  /** Há pelo menos uma transmissão ao vivo. */
  hasLive: boolean
  /**
   * A campanha só tem publicações (post/reel/story) — nenhuma live.
   *
   * É este o predicado que substitui o antigo `isPostLikeEvent(event.type)`.
   * Campanha SEM sessão nenhuma responde `false` de propósito: ela ainda não
   * escolheu o que é, e esconder "adicionar sessão" nela deixaria o lojista
   * sem saída.
   */
  isPublicationOnly: boolean
  /** Mais de uma espécie na mesma campanha — o guarda-chuva de fato. */
  isMixed: boolean
  /** Rótulo curto para badge. */
  label: string
  icon: "radio" | "instagram" | "aperture" | "layers"
}

const SESSION_TYPES: readonly string[] = ["live", "post", "reel", "story"]

const SINGLE_TYPE_LABEL: Record<SessionType, { label: string; icon: EventKind["icon"] }> = {
  live: { label: "Live", icon: "radio" },
  post: { label: "Post", icon: "instagram" },
  reel: { label: "Reel", icon: "instagram" },
  story: { label: "Story", icon: "aperture" },
}

/** Só o que o cálculo precisa — serve para `Event` (lista) e para o detalhe. */
export interface EventKindSource {
  sessionTypes?: string[] | null
  sessions?: { type: string }[] | null
}

/**
 * Deriva a espécie da campanha. Prefere `sessionTypes` (vem tanto na lista
 * quanto no detalhe) e cai para `sessions[].type` quando a resposta é de uma
 * versão anterior do backend. Em nenhum ramo lê `event.type`.
 */
export function getEventKind(source: EventKindSource): EventKind {
  const raw =
    source.sessionTypes && source.sessionTypes.length > 0
      ? source.sessionTypes
      : (source.sessions ?? []).map((s) => s.type)

  const types: SessionType[] = []
  for (const t of raw) {
    if (!SESSION_TYPES.includes(t)) continue
    if (types.includes(t as SessionType)) continue
    types.push(t as SessionType)
  }

  const hasLive = types.includes("live")
  const isPublicationOnly = types.length > 0 && !hasLive
  const isMixed = types.length > 1

  if (types.length === 0) {
    return {
      types,
      hasLive: false,
      isPublicationOnly: false,
      isMixed: false,
      label: "Evento",
      icon: "layers",
    }
  }
  if (isMixed) {
    return { types, hasLive, isPublicationOnly, isMixed, label: "Misto", icon: "layers" }
  }
  const single = SINGLE_TYPE_LABEL[types[0]]
  return { types, hasLive, isPublicationOnly, isMixed, label: single.label, icon: single.icon }
}

/** Rótulo plural das espécies, para legendas ("live · story"). */
export function describeEventKind(kind: EventKind): string {
  if (kind.types.length === 0) return "sem transmissão"
  return kind.types.map((t) => SINGLE_TYPE_LABEL[t].label.toLowerCase()).join(" · ")
}
