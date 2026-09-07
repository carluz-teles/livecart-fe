"use client"

import { useState } from "react"
import {
  ArrowUpRight,
  Check,
  CircleHelp,
  Clock3,
  Copy,
  EyeOff,
  MessageCircle,
  Package,
  ShoppingBag,
  TriangleAlert,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { TOM_CLASSE } from "@/lib/desfecho-do-comentario"
import { cn } from "@/lib/utils"
import type { EventComment, EventSession } from "@/types/event.types"
import {
  commentOutcome,
  formatCommentDate,
  formatCommentTime,
  sessionName,
  type CommentOutcome,
} from "./comments-model"

export const OUTCOME_ICONS = {
  ok: ShoppingBag,
  espera: Clock3,
  perdida: TriangleAlert,
  neutro: MessageCircle,
  desconhecido: CircleHelp,
} as const

export function OutcomeBadge({
  group,
  label,
}: {
  group: CommentOutcome
  label: string
}) {
  const Icon = OUTCOME_ICONS[group]
  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1.5",
        group === "perdida"
          ? "bg-destructive/15 text-foreground"
          : group !== "desconhecido" && TOM_CLASSE[group],
      )}
    >
      <Icon
        className={cn("size-3", group === "perdida" && "text-destructive")}
        aria-hidden
      />
      <span className="first-letter:uppercase">{label}</span>
    </Badge>
  )
}

export function EventCommentRow({
  comment,
  session,
}: {
  comment: EventComment
  session?: EventSession
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const outcome = commentOutcome(comment)
  const handle = comment.handle.replace(/^@/, "") || "Perfil não identificado"
  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(comment.id)
      setCopied(true)
    } catch {
      toast.error(
        "Não foi possível copiar a referência. Selecione o texto para copiar.",
      )
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        setCopied(false)
      }}
    >
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={`Ver comentário de @${handle}, ${formatCommentTime(comment.createdAt)}, ${outcome.label}`}
          className="group flex w-full min-w-0 items-start gap-3 px-4 py-5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:gap-4 sm:px-5"
        >
          <Avatar className="mt-0.5 size-9 shrink-0 border">
            <AvatarFallback>{handle.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="break-all text-sm font-semibold">@{handle}</span>
              <span className="text-xs text-muted-foreground">
                · {sessionName(session)}
              </span>
              <time
                dateTime={comment.createdAt}
                title={formatCommentDate(comment.createdAt, true)}
                className="ml-auto text-xs tabular-nums text-muted-foreground"
              >
                {formatCommentTime(comment.createdAt)}
              </time>
            </span>
            <span
              className={cn(
                "whitespace-pre-wrap break-words text-sm leading-relaxed [overflow-wrap:anywhere]",
                comment.hidden && "text-muted-foreground",
              )}
            >
              {comment.text || "Comentário sem texto"}
            </span>
            <span className="flex flex-wrap items-center gap-2">
              <OutcomeBadge group={outcome.group} label={outcome.label} />
              {comment.hidden && (
                <Badge variant="outline" className="gap-1">
                  <EyeOff className="size-3" aria-hidden />
                  Oculto no Instagram
                </Badge>
              )}
            </span>
            {(comment.productName || comment.productKeyword) && (
              <span className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Package className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                  {comment.productName || "Produto identificado"}
                  {comment.productKeyword && (
                    <span className="ml-1.5 font-mono">
                      #{comment.productKeyword}
                    </span>
                  )}
                  {!!comment.quantity && comment.quantity > 0 && (
                    <span> · Pedido: {comment.quantity} un.</span>
                  )}
                </span>
              </span>
            )}
            {(outcome.group === "perdida" ||
              outcome.group === "espera" ||
              outcome.group === "desconhecido") && (
              <span className="text-xs leading-relaxed text-muted-foreground">
                {outcome.description}
              </span>
            )}
          </span>
          <ArrowUpRight
            className="mt-0.5 hidden size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none sm:block"
            aria-hidden
          />
        </button>
      </SheetTrigger>
      {open && (
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="pr-6">
            <SheetTitle>Detalhes do comentário</SheetTitle>
            <SheetDescription>
              {sessionName(session)} ·{" "}
              {formatCommentDate(comment.createdAt, true)}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-7 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Avatar className="size-11 border">
                <AvatarFallback>
                  {handle.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="break-all font-semibold">@{handle}</p>
                <p className="text-xs text-muted-foreground">
                  Comentário recebido pelo Instagram
                </p>
              </div>
            </div>
            <blockquote className="whitespace-pre-wrap break-words border-l-2 border-primary bg-muted/60 py-4 pl-4 pr-3 text-base leading-relaxed [overflow-wrap:anywhere]">
              {comment.text || "Comentário sem texto"}
            </blockquote>
            <section
              aria-label="Resultado do comentário"
              className="flex flex-col gap-3"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                O que aconteceu
              </h3>
              <div>
                <OutcomeBadge group={outcome.group} label={outcome.label} />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {outcome.description}
              </p>
              {comment.hidden && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <EyeOff className="size-4" aria-hidden />
                  Este comentário está oculto no Instagram.
                </p>
              )}
            </section>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Produto identificado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comment.productName || comment.productKeyword ? (
                  <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm">
                    <dt className="text-muted-foreground">Produto</dt>
                    <dd className="break-words">
                      {comment.productName || "Nome indisponível"}
                    </dd>
                    <dt className="text-muted-foreground">Código</dt>
                    <dd className="break-all font-mono">
                      {comment.productKeyword || "Não informado"}
                    </dd>
                    <dt className="text-muted-foreground">Quantidade pedida</dt>
                    <dd>
                      {comment.quantity && comment.quantity > 0
                        ? `${comment.quantity} un.`
                        : "Não informada"}
                    </dd>
                  </dl>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum produto associado a este registro.
                  </p>
                )}
              </CardContent>
            </Card>
            <Separator />
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Referência para suporte</h3>
              <p className="break-all font-mono text-xs text-muted-foreground">
                {comment.id}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="self-start"
                onClick={copyReference}
              >
                {copied ? (
                  <Check data-icon="inline-start" />
                ) : (
                  <Copy data-icon="inline-start" />
                )}
                {copied ? "Referência copiada" : "Copiar referência"}
              </Button>
            </div>
          </div>
        </SheetContent>
      )}
    </Sheet>
  )
}
