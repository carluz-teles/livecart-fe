"use client"

/**
 * O QUE FOI DITO NA TRANSMISSÃO, E O QUE VIROU VENDA.
 *
 * ═══ POR TRANSMISSÃO, E NÃO POR CAMPANHA ═══
 *
 * Uma campanha guarda-chuva tem várias: a live de segunda, o story de terça, o
 * post de quinta. A lista era um caldo só — 142 falas de três dias juntas, sem
 * como rever UMA transmissão. E rever uma transmissão é justamente o gesto: "o
 * que aconteceu na live de ontem?".
 *
 * ═══ SEM MODERAÇÃO ═══
 *
 * Havia botões de responder, ocultar e excluir. Eles não funcionam em
 * comentário de LIVE — a moderação do Instagram é de comentário de post, e a
 * live não expõe isso. Botão que não funciona é pior do que botão ausente:
 * quem clica aprende a desconfiar da tela inteira.
 *
 * O que sobrou é uma linha do tempo de leitura, com HORÁRIO — sem ele isto era
 * uma lista, não uma linha do tempo, e numa live o quando é metade da história
 * (a rajada de dez falas no mesmo minuto é o pico da transmissão).
 */

import { use, useMemo, useState } from "react"
import { Instagram, MessageCircle, Radio, Users, Video } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useEventComments } from "@/hooks/event"
import {
  fraseDoDesfecho,
  lerDesfecho,
  TOM_CLASSE,
  type TomDoDesfecho,
} from "@/lib/desfecho-do-comentario"
import { cn } from "@/lib/utils"
import type { EventComment, EventSession } from "@/types/event.types"
import { EventDetailContext } from "./EventDetailContext"

/** Ícone por tipo de transmissão — o lojista reconhece a live pelo símbolo. */
const ICONE_DO_TIPO: Record<string, React.ComponentType<{ className?: string }>> = {
  live: Radio,
  post: Instagram,
  reel: Video,
  story: Users,
}

const ROTULO_DO_TIPO: Record<string, string> = {
  live: "Live",
  post: "Post",
  reel: "Reel",
  story: "Story",
}

function nomeDaTransmissao(s: EventSession): string {
  const rotulo = ROTULO_DO_TIPO[s.type] ?? s.type
  return `${rotulo} ${s.sequenceOrder}`
}

/** "19:42" — o horário da fala, na hora local de quem lê. */
function horario(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

/** "03/09" — só aparece quando a fala é de outro dia que a anterior. */
function dia(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

export function EventDetailComments() {
  const ctx = use(EventDetailContext)
  const eventId = ctx?.state.event.id ?? ""
  const sessoes = ctx?.state.event.sessions ?? []
  const { data: comments, isLoading } = useEventComments(eventId)

  const [sessaoFiltro, setSessaoFiltro] = useState<string>("todas")
  const [tomFiltro, setTomFiltro] = useState<TomDoDesfecho | "todos">("todos")

  // As duas contagens são derivadas, nunca guardadas: guardar contagem obriga a
  // invalidá-la, e a lista já está na mão.
  const { porSessao, daSessao, porTom, visiveis } = useMemo(() => {
    const todas = comments ?? []

    const porSessao = new Map<string, number>()
    for (const c of todas) {
      const k = c.sessionId || "sem-sessao"
      porSessao.set(k, (porSessao.get(k) ?? 0) + 1)
    }

    const daSessao =
      sessaoFiltro === "todas"
        ? todas
        : todas.filter((c) => (c.sessionId || "sem-sessao") === sessaoFiltro)

    // O desfecho é contado DENTRO da transmissão escolhida. Contar sobre a
    // campanha inteira faria os números da tira mentirem sobre o que está na
    // tela — e é justamente para conferir uma transmissão que ela existe.
    const porTom = { ok: 0, espera: 0, perdida: 0, neutro: 0 }
    for (const c of daSessao) porTom[lerDesfecho(c.result)?.tom ?? "neutro"]++

    const visiveis =
      tomFiltro === "todos"
        ? daSessao
        : daSessao.filter((c) => (lerDesfecho(c.result)?.tom ?? "neutro") === tomFiltro)

    return { porSessao, daSessao, porTom, visiveis }
  }, [comments, sessaoFiltro, tomFiltro])

  if (!ctx) return null

  const total = comments?.length ?? 0
  // Só as transmissões que TÊM fala entram no seletor: oferecer uma live sem
  // comentário é oferecer uma tela vazia.
  const comFala = sessoes.filter((s) => (porSessao.get(s.id) ?? 0) > 0)
  const semSessao = porSessao.get("sem-sessao") ?? 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="h-4 w-4" />
              Comentários
            </CardTitle>
            <CardDescription>
              O que foi dito em cada transmissão, e o que virou venda.
            </CardDescription>
          </div>
          {total > 0 && (
            <Badge variant="secondary" className="shrink-0">
              {total} {total === 1 ? "comentário" : "comentários"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-md border p-3">
                <Skeleton className="h-7 w-7 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3.5 w-56" />
                </div>
              </div>
            ))}
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-muted-foreground">Nenhum comentário ainda</p>
            <p className="max-w-sm text-sm text-muted-foreground/70">
              As falas aparecem aqui conforme a transmissão acontece, com o que cada
              uma virou.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* ── TRANSMISSÃO ─────────────────────────────────────────────
                Primeiro eixo, e o mais importante: a pergunta é "o que
                aconteceu NAQUELA live". Só aparece quando há mais de uma
                transmissão com fala — num evento de uma live só, o seletor
                seria um botão que não escolhe nada. */}
            {comFala.length + (semSessao > 0 ? 1 : 0) > 1 && (
              <Eixo rotulo="Transmissão">
                <Chip
                  ativo={sessaoFiltro === "todas"}
                  onClick={() => setSessaoFiltro("todas")}
                  rotulo="Todas"
                  n={total}
                />
                {comFala.map((s) => {
                  const Icone = ICONE_DO_TIPO[s.type] ?? Radio
                  return (
                    <Chip
                      key={s.id}
                      ativo={sessaoFiltro === s.id}
                      onClick={() => setSessaoFiltro(s.id)}
                      rotulo={nomeDaTransmissao(s)}
                      n={porSessao.get(s.id) ?? 0}
                      Icone={Icone}
                    />
                  )
                })}
                {semSessao > 0 && (
                  <Chip
                    ativo={sessaoFiltro === "sem-sessao"}
                    onClick={() => setSessaoFiltro("sem-sessao")}
                    rotulo="Sem transmissão"
                    n={semSessao}
                  />
                )}
              </Eixo>
            )}

            {/* ── DESFECHO ────────────────────────────────────────────────
                Segundo eixo. Contado dentro da transmissão escolhida. */}
            <Eixo rotulo="Desfecho">
              <Chip
                ativo={tomFiltro === "todos"}
                onClick={() => setTomFiltro("todos")}
                rotulo="Tudo"
                n={daSessao.length}
              />
              {(
                [
                  ["ok", "Viraram item"],
                  ["espera", "Na fila"],
                  ["perdida", "Sem atender"],
                  ["neutro", "Sem intenção"],
                ] as const
              ).map(([tom, rotulo]) =>
                porTom[tom] > 0 ? (
                  <Chip
                    key={tom}
                    ativo={tomFiltro === tom}
                    onClick={() => setTomFiltro(tom)}
                    rotulo={rotulo}
                    n={porTom[tom]}
                    tom={tom}
                  />
                ) : null,
              )}
            </Eixo>

            {visiveis.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-muted-foreground">Nenhuma fala com esse desfecho.</p>
                <Button variant="ghost" size="sm" onClick={() => setTomFiltro("todos")}>
                  Ver todas
                </Button>
              </div>
            ) : (
              <ol className="flex flex-col gap-1.5">
                {visiveis.map((c, i) => (
                  <Fala
                    key={c.id}
                    comment={c}
                    // A data só aparece na virada do dia. Repetir "03/09" em
                    // cem linhas seguidas é ruído; mostrá-la quando muda é a
                    // única forma de saber que a lista atravessou a meia-noite.
                    mostrarDia={i === 0 || dia(c.createdAt) !== dia(visiveis[i - 1].createdAt)}
                  />
                ))}
              </ol>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/** Um eixo de filtro: rótulo à esquerda, chips à direita. */
function Eixo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{rotulo}</span>
      {children}
    </div>
  )
}

function Chip({
  ativo,
  onClick,
  rotulo,
  n,
  tom,
  Icone,
}: {
  ativo: boolean
  onClick: () => void
  rotulo: string
  n: number
  tom?: TomDoDesfecho
  Icone?: React.ComponentType<{ className?: string }>
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        ativo
          ? "border-foreground/25 bg-muted font-medium text-foreground"
          : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground",
      )}
    >
      {/* O ponto de cor é REFORÇO do rótulo, nunca o único sinal. */}
      {tom && <span className={cn("h-1.5 w-1.5 rounded-full", TOM_CLASSE[tom])} aria-hidden />}
      {Icone && <Icone className="h-3 w-3" aria-hidden />}
      {rotulo}
      <span className="tabular-nums opacity-70">{n}</span>
    </button>
  )
}

function Fala({ comment, mostrarDia }: { comment: EventComment; mostrarDia: boolean }) {
  const d = lerDesfecho(comment.result)
  const frase = fraseDoDesfecho(comment.handle, comment)

  return (
    <li>
      {mostrarDia && (
        <p className="px-1 pb-1 pt-2 text-xs font-medium text-muted-foreground">
          {dia(comment.createdAt)}
        </p>
      )}
      <div className="flex items-start gap-3 rounded-md border p-3">
        {/* O horário à esquerda, em tabular: é o que faz disto uma linha do
            tempo, e alinhado ele deixa a rajada visível — dez falas no mesmo
            minuto é o pico da transmissão. */}
        <span className="w-10 shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground">
          {horario(comment.createdAt)}
        </span>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {comment.handle.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">@{comment.handle}</span>
            {d ? (
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[11px] font-medium",
                  TOM_CLASSE[d.tom],
                )}
              >
                {d.rotulo}
              </span>
            ) : comment.hasPurchaseIntent ? (
              <Badge variant="secondary" className="text-xs">
                intenção de compra
              </Badge>
            ) : null}
            {comment.hidden && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                oculto no Instagram
              </Badge>
            )}
          </div>
          <p
            className={cn(
              "text-sm leading-relaxed",
              comment.hidden
                ? "text-muted-foreground/60 line-through"
                : "text-muted-foreground",
            )}
          >
            {comment.text}
          </p>
          {frase.tom !== "neutro" && (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground/80">
              {frase.titulo.replace(`@${comment.handle} `, "")}
              {frase.nota ? ` · ${frase.nota}` : ""}
            </p>
          )}
        </div>
      </div>
    </li>
  )
}
