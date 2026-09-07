"use client"

import { Fragment, useDeferredValue, useId, useMemo, useState } from "react"
import {
  ArrowDown,
  ArrowDownWideNarrow,
  CircleHelp,
  Clock3,
  Instagram,
  Layers,
  MessageCircle,
  Radio,
  RefreshCw,
  Search,
  ShoppingBag,
  TriangleAlert,
  Video,
  X,
} from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Event, EventComment } from "@/types/event.types"
import { EventCommentRow } from "./EventCommentRow"
import {
  commentOutcome,
  formatCommentDate,
  formatCommentTime,
  matchesCommentSearch,
  OUTCOME_LABELS,
  sessionName,
  uniqueComments,
  type CommentOutcome,
  type OutcomeFilter,
} from "./comments-model"

interface EventCommentsProps {
  event: Pick<Event, "sessions" | "status">
  sessionId?: string
  onSessionChange: (id?: string) => void
  pages?: EventComment[][]
  loading: boolean
  error: boolean
  refreshing: boolean
  updatedAt: number
  hasMore: boolean
  loadingMore: boolean
  loadMoreError: boolean
  onLoadMore: () => void
  onRefresh: () => void
}

const SESSION_ICONS: Record<string, typeof Radio> = {
  live: Radio,
  post: Instagram,
  reel: Video,
  story: Instagram,
}
const number = (n: number) => n.toLocaleString("pt-BR")
const EMPTY_SESSIONS: NonNullable<Event["sessions"]> = []

export function EventComments({
  event,
  sessionId,
  onSessionChange,
  pages,
  loading,
  error,
  refreshing,
  updatedAt,
  hasMore,
  loadingMore,
  loadMoreError,
  onLoadMore,
  onRefresh,
}: EventCommentsProps) {
  const id = useId()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<OutcomeFilter>("todos")
  const deferredSearch = useDeferredValue(search)
  const sessions = event.sessions ?? EMPTY_SESSIONS
  const sessionMap = useMemo(
    () => new Map(sessions.map((session) => [session.id, session])),
    [sessions],
  )
  const comments = useMemo(() => uniqueComments(pages), [pages])
  const counts = useMemo(() => {
    const result: Record<CommentOutcome, number> = {
      ok: 0,
      espera: 0,
      perdida: 0,
      neutro: 0,
      desconhecido: 0,
    }
    for (const comment of comments) result[commentOutcome(comment).group]++
    return result
  }, [comments])
  const visible = useMemo(
    () =>
      comments.filter(
        (comment) =>
          (filter === "todos" || commentOutcome(comment).group === filter) &&
          matchesCommentSearch(comment, deferredSearch),
      ),
    [comments, filter, deferredSearch],
  )
  const participants = useMemo(
    () =>
      new Set(
        comments.map((comment) => comment.handle.toLowerCase()).filter(Boolean),
      ).size,
    [comments],
  )
  const selectedSession = sessionId ? sessionMap.get(sessionId) : undefined
  const filtersActive = search.trim() !== "" || filter !== "todos"
  const initialError = error && comments.length === 0 && !loadMoreError
  const countsUnavailable = loading || initialError

  const clearFilters = () => {
    setSearch("")
    setFilter("todos")
  }
  const changeSession = (value: string) => {
    onSessionChange(value === "all" ? undefined : value)
    clearFilters()
  }

  const summary = [
    {
      label: "Comentários",
      count: comments.length,
      icon: MessageCircle,
      note: `${number(participants)} perfis neste grupo`,
    },
    {
      label: "No carrinho",
      count: counts.ok,
      icon: ShoppingBag,
      note: "Com adição de produto",
    },
    {
      label: "Na fila / parciais",
      count: counts.espera,
      icon: Clock3,
      note: "Espera total ou parcial",
    },
    {
      label: "Não atendidos",
      count: counts.perdida,
      icon: TriangleAlert,
      note: "Consulte o motivo na lista",
    },
  ]

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex min-w-0 flex-col gap-5"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Instagram className="size-3.5" aria-hidden />
            Instagram <span aria-hidden>·</span>{" "}
            {event.status === "active" ? "Evento ativo" : "Histórico do evento"}
          </div>
          <h2
            id={`${id}-title`}
            className="text-2xl font-semibold tracking-tight"
          >
            Central de comentários
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Veja quem pediu, o que entrou no carrinho e o que ficou pelo
            caminho.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading || refreshing || loadingMore}
          >
            <RefreshCw
              data-icon="inline-start"
              className={cn(
                refreshing && "animate-spin motion-reduce:animate-none",
              )}
            />
            {refreshing ? "Atualizando…" : "Atualizar comentários"}
          </Button>
          {updatedAt > 0 && (
            <p className="text-xs text-muted-foreground">
              Atualizado às{" "}
              {formatCommentTime(new Date(updatedAt).toISOString())}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {summary.map(({ label, count, icon: Icon, note }) => (
            <Card key={label} className="shadow-none">
              <CardHeader className="flex-row items-center justify-between gap-2 p-4 pb-2">
                <CardDescription>{label}</CardDescription>
                <Icon
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {countsUnavailable ? (
                  <Skeleton className="my-1 h-8 w-16" />
                ) : (
                  <p className="text-3xl font-semibold tracking-tight tabular-nums">
                    {number(count)}
                  </p>
                )}
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {countsUnavailable ? "Aguardando comentários" : note}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p
          id={`${id}-scope`}
          className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground"
        >
          <CircleHelp className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Resumo e filtros consideram os comentários carregados
          {selectedSession
            ? ` de ${sessionName(selectedSession)}`
            : " de todas as transmissões"}
          .{hasMore ? " Carregue mais para ampliar a análise." : ""}
        </p>
      </div>

      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)]">
        <Card className="hidden min-w-0 shadow-none lg:block">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-base">Transmissões</CardTitle>
            <CardDescription>Escolha o que acompanhar.</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <RadioGroup
              aria-label="Filtrar por transmissão"
              value={sessionId ?? "all"}
              onValueChange={changeSession}
              className="max-h-64 gap-1 overflow-y-auto lg:max-h-[480px]"
            >
              {[
                {
                  value: "all",
                  title: "Todas as transmissões",
                  count: undefined,
                  icon: Layers,
                  date: `${sessions.length} ${sessions.length === 1 ? "transmissão" : "transmissões"} no evento`,
                },
                ...sessions.map((session) => ({
                  value: session.id,
                  title: sessionName(session),
                  count: session.totalComments,
                  icon: SESSION_ICONS[session.type] ?? Radio,
                  date: formatCommentDate(
                    session.startedAt ?? session.createdAt,
                  ),
                })),
              ].map(({ value, title, count, icon: Icon, date }) => (
                <div key={value} className="relative">
                  <RadioGroupItem
                    value={value}
                    id={`${id}-session-${value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`${id}-session-${value}`}
                    className="flex cursor-pointer items-start gap-2.5 rounded-md border border-transparent p-3 transition-colors hover:bg-muted peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-data-[state=checked]:border-primary/30 peer-data-[state=checked]:bg-accent peer-data-[state=checked]:text-accent-foreground"
                  >
                    <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="text-sm leading-tight">{title}</span>
                      <span
                        className={cn(
                          "text-xs font-normal",
                          (sessionId ?? "all") === value
                            ? "text-accent-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {date}
                      </span>
                    </span>
                    {count !== undefined && (
                      <span className="text-xs tabular-nums">
                        {number(count)}
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <Separator />
          <CardFooter className="p-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Os totais ao lado de cada transmissão são do evento. O resumo
              acima mostra o histórico já carregado.
            </p>
          </CardFooter>
        </Card>

        <Card className="min-w-0 overflow-hidden shadow-none">
          <CardHeader className="gap-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">
                  {selectedSession
                    ? sessionName(selectedSession)
                    : "Todos os comentários"}
                </CardTitle>
                {!countsUnavailable && (
                  <Badge variant="secondary">{number(comments.length)}</Badge>
                )}
              </div>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ArrowDownWideNarrow className="size-3.5" aria-hidden />
                Ordem de chegada
              </span>
            </div>
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_240px]">
              <div className="flex min-w-0 flex-col gap-1.5 lg:hidden xl:col-span-2">
                <Label htmlFor={`${id}-mobile-session`}>Transmissão</Label>
                <Select
                  value={sessionId ?? "all"}
                  onValueChange={changeSession}
                >
                  <SelectTrigger id={`${id}-mobile-session`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">Todas as transmissões</SelectItem>
                      {sessions.map((session) => (
                        <SelectItem key={session.id} value={session.id}>
                          {sessionName(session)} ·{" "}
                          {number(session.totalComments)} comentários
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor={`${id}-search`}>Buscar comentário</Label>
                <Input
                  id={`${id}-search`}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="@cliente, comentário, produto ou código"
                  aria-describedby={`${id}-scope`}
                />
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor={`${id}-outcome`}>Resultado</Label>
                <Select
                  value={filter}
                  onValueChange={(value) => setFilter(value as OutcomeFilter)}
                >
                  <SelectTrigger id={`${id}-outcome`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(
                        Object.entries(OUTCOME_LABELS) as [
                          OutcomeFilter,
                          string,
                        ][]
                      ).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label} (
                          {number(
                            value === "todos" ? comments.length : counts[value],
                          )}
                          )
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <p role="status" aria-live="polite">
                {loading
                  ? "Carregando comentários…"
                  : initialError
                    ? "Comentários indisponíveis"
                    : `${number(visible.length)} de ${number(comments.length)} comentários carregados`}
              </p>
              {filtersActive ? (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X data-icon="inline-start" />
                  Limpar filtros
                </Button>
              ) : (
                <span>Selecione um comentário para ver detalhes</span>
              )}
            </div>
          </CardHeader>
          <Separator />

          {error && !loadMoreError && (
            <div className="p-4">
              <Alert>
                <TriangleAlert aria-hidden />
                <AlertTitle>
                  {initialError
                    ? "Não foi possível carregar os comentários"
                    : "Não foi possível atualizar o histórico"}
                </AlertTitle>
                <AlertDescription>
                  {initialError
                    ? "Tente novamente para consultar os comentários desta transmissão."
                    : "Os comentários anteriores continuam na tela. Tente atualizar novamente."}
                </AlertDescription>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={onRefresh}
                  disabled={refreshing}
                >
                  Tentar novamente
                </Button>
              </Alert>
            </div>
          )}

          <CardContent className="p-0" aria-busy={loading}>
            {loading ? (
              <div
                className="flex flex-col gap-6 p-5"
                aria-label="Carregando histórico"
              >
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="flex gap-3">
                    <Skeleton className="size-9 shrink-0 rounded-full" />
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visible.length > 0 ? (
              <ol aria-label="Comentários recebidos" className="divide-y">
                {visible.map((comment, index) => {
                  const date = formatCommentDate(comment.createdAt)
                  const showDate =
                    index === 0 ||
                    date !== formatCommentDate(visible[index - 1].createdAt)
                  return (
                    <li key={comment.id}>
                      {showDate && (
                        <div className="flex items-center gap-3 bg-muted/60 px-4 py-2.5 sm:px-5">
                          <span className="text-xs font-medium text-muted-foreground">
                            {date}
                          </span>
                        </div>
                      )}
                      <EventCommentRow
                        comment={comment}
                        session={
                          comment.sessionId
                            ? sessionMap.get(comment.sessionId)
                            : undefined
                        }
                      />
                    </li>
                  )
                })}
              </ol>
            ) : !initialError ? (
              <EmptyState
                icon={filtersActive ? Search : MessageCircle}
                title={
                  filtersActive
                    ? "Nenhum comentário com esses filtros"
                    : "Nenhum comentário por aqui"
                }
                description={
                  filtersActive
                    ? hasMore
                      ? "A busca considera o histórico carregado. Carregue mais comentários ou ajuste os filtros."
                      : "Tente outro cliente, produto ou resultado."
                    : "Os comentários recebidos nesta transmissão aparecerão aqui com o resultado de cada pedido."
                }
                action={
                  filtersActive
                    ? { label: "Limpar filtros", onClick: clearFilters }
                    : undefined
                }
                className="px-5"
              />
            ) : null}
          </CardContent>

          {(hasMore || comments.length > 0 || loadMoreError) && (
            <Fragment>
              <Separator />
              <CardFooter className="flex flex-col gap-3 p-4 sm:p-5">
                {loadMoreError && (
                  <p role="alert" className="text-center text-sm">
                    Não foi possível carregar a próxima página. Os comentários
                    anteriores foram mantidos.
                  </p>
                )}
                {hasMore || loadMoreError ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={onLoadMore}
                      disabled={loadingMore || refreshing}
                    >
                      {loadingMore ? (
                        <RefreshCw
                          data-icon="inline-start"
                          className="animate-spin motion-reduce:animate-none"
                        />
                      ) : (
                        <ArrowDown data-icon="inline-start" />
                      )}
                      {loadingMore
                        ? "Carregando…"
                        : loadMoreError
                          ? "Tentar carregar mais"
                          : "Carregar mais comentários"}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Há mais histórico para consultar. A busca e o resumo são
                      ampliados a cada página.
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Você chegou ao fim do histórico disponível desta seleção.
                  </p>
                )}
              </CardFooter>
            </Fragment>
          )}
        </Card>
      </div>
    </section>
  )
}
