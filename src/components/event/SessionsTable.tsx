"use client"

import { Radio, Instagram, Youtube, Aperture, Film, Layers, Link2, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PLATFORM_LABELS, SESSION_STATUS_CONFIG } from "@/lib/constants"
import { SESSION_COPY } from "@/lib/event-copy"
import { formatCurrency } from "@/lib/format"
import type { EventSession, Platform, SessionMetrics } from "@/types/event.types"

interface SessionsTableProps {
  sessions: EventSession[]
  isLoading?: boolean
  /** Receita que não pôde ser creditada a nenhuma transmissão — item posto pelo
   *  painel, ou carrinho anterior ao log de adições. Vem separada porque não é
   *  uma sessão; e aparece porque sem ela a soma da coluna não fecha com o
   *  faturamento do evento. */
  unattributed?: SessionMetrics | null
  /** Quando presente, mostra o botão de adicionar transmissão. Ausente = a
   *  campanha não aceita sessão nova (encerrada). */
  onAddSession?: () => void
  /** Quando presente, a sessão sem mídia ganha o botão "Vincular".
   *
   *  Sem isto o badge "Sem publicação vinculada" era um beco: ele avisava que a
   *  transmissão não captura nada e não havia onde clicar para resolver — o
   *  único vínculo posterior era o "Crash recovery", que só lista lives e nem
   *  aparece em campanha sem live. */
  onLinkMedia?: (session: EventSession) => void
}

/** Tooltip da coluna de receita — copy deck §5.3. */
const REVENUE_HINT =
  "Receita atribuída a esta sessão: cada item conta para a sessão em que foi adicionado, mesmo que o pagamento tenha acontecido dias depois."

const UNATTRIBUTED_HINT =
  "Itens que não puderam ser creditados a nenhuma transmissão — postos pelo painel, ou de carrinhos anteriores ao registro por sessão. Aparecem aqui porque sem eles a soma das sessões não fecha com o total do evento."

const SESSION_TYPE_META: Record<string, { label: string; Icon: typeof Radio }> = {
  live: { label: "Live", Icon: Radio },
  post: { label: "Post", Icon: Instagram },
  reel: { label: "Reel", Icon: Film },
  story: { label: "Story", Icon: Aperture },
}

function formatDuration(startedAt: string | null, endedAt: string | null): string {
  if (!startedAt) return "-"

  const start = new Date(startedAt).getTime()
  const end = endedAt ? new Date(endedAt).getTime() : Date.now()
  const diffMs = end - start

  const mins = Math.floor(diffMs / 60000)
  const hours = Math.floor(mins / 60)

  if (hours > 0) {
    return `${hours}h ${mins % 60}min`
  }
  return `${mins}min`
}

function getStatusBadge(status: string) {
  const cfg = SESSION_STATUS_CONFIG[status]
  if (!cfg) return <Badge variant="outline">{status}</Badge>
  if (status === "live") {
    return (
      <Badge variant="default" className="gap-1 bg-green-600" title={cfg.hint}>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
        </span>
        {cfg.label}
      </Badge>
    )
  }
  return (
    <Badge variant={cfg.variant} title={cfg.hint}>
      {cfg.label}
    </Badge>
  )
}

function getPlatformIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case "instagram":
      return <Instagram className="h-4 w-4 text-pink-500" />
    case "youtube":
      return <Youtube className="h-4 w-4 text-red-500" />
    default:
      return <Radio className="h-4 w-4 text-muted-foreground" />
  }
}

export function SessionsTable({
  sessions,
  isLoading,
  unattributed,
  onAddSession,
  onLinkMedia,
}: SessionsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            {/* Layers, não Radio: este card lista post, reel e story também —
                o ícone de live rotulava a campanha inteira como transmissão ao
                vivo. */}
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Layers className="h-4 w-4 text-muted-foreground" />
              Sessões do evento
            </CardTitle>
            <CardDescription className="mt-1">
              Cada linha é uma transmissão desta campanha. Você pode adicionar sessões
              enquanto o evento estiver aberto, de tipos diferentes. A campanha só fecha na
              data de fim ou quando você clicar em &quot;Finalizar evento&quot; — nenhuma
              sessão sozinha fecha carrinho.
            </CardDescription>
          </div>
          {onAddSession && (
            <Button variant="outline" size="sm" className="shrink-0" onClick={onAddSession}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar sessão
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Sessão</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead className="text-right" title={REVENUE_HINT}>
                  Vendido
                </TableHead>
                <TableHead className="text-right" title={REVENUE_HINT}>
                  Em carrinho
                </TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <p className="font-medium">Nenhuma sessão ainda</p>
                    <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                      Adicione a primeira transmissão desta campanha. Pode ser uma live que
                      você vai conectar na hora, um post que já existe no seu perfil, ou uma
                      publicação que o LiveCart cria para você.
                    </p>
                    {onAddSession && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={onAddSession}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar sessão
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => {
                  const platform = session.platforms?.[0]
                  const platformName = platform
                    ? PLATFORM_LABELS[platform.platform as Platform] || platform.platform
                    : "-"
                  const typeMeta = SESSION_TYPE_META[session.type] ?? {
                    label: session.type || "—",
                    Icon: Radio,
                  }
                  const TypeIcon = typeMeta.Icon

                  return (
                    <TableRow key={session.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          S{session.sequenceOrder}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          <TypeIcon className="h-3 w-3" />
                          {typeMeta.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {/* Sessão sem mídia é caminho suportado — e antes ela
                            aparecia como um "-" mudo, indistinguível de dado
                            faltando. O badge diz o que está acontecendo:
                            existe, mas não captura nada ainda. */}
                        {platform ? (
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(platform.platform)}
                            <span>{platformName}</span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-muted-foreground"
                              title={SESSION_COPY.noMedia.hint}
                            >
                              {SESSION_COPY.noMedia.badge}
                            </Badge>
                            {onLinkMedia && session.type !== "story" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => onLinkMedia(session)}
                              >
                                <Link2 className="mr-1.5 h-3.5 w-3.5" />
                                Vincular
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatDuration(session.startedAt, session.endedAt)}
                      </TableCell>
                      <TableCell
                        className="text-right font-medium tabular-nums"
                        title={REVENUE_HINT}
                      >
                        {formatCurrency(session.confirmedRevenue)}
                      </TableCell>
                      <TableCell
                        className="text-right tabular-nums text-muted-foreground"
                        title={REVENUE_HINT}
                      >
                        {formatCurrency(session.projectedRevenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(session.status)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
              {!isLoading && unattributed && (
                <TableRow className="bg-muted/30">
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      —
                    </Badge>
                  </TableCell>
                  <TableCell colSpan={3} className="text-muted-foreground" title={UNATTRIBUTED_HINT}>
                    Sem transmissão
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(unattributed.confirmedRevenue)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatCurrency(unattributed.projectedRevenue)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
