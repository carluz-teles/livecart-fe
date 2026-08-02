"use client"

import { use, useState } from "react"
import { AlertTriangle, Copy, MessageSquareOff } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/format"
import { useUndelivered } from "@/hooks/communications"
import { EventDetailContext } from "./EventDetailContext"

/**
 * Painel "compradores não avisados" (RN-38).
 *
 * O Instagram só permite responder um comprador por 7 dias depois do
 * comentário dele, e uma única vez por comentário. Numa campanha longa, quem
 * comentou no primeiro dia pode estar fora desse prazo quando a campanha
 * encerrar. O LiveCart **não envia** nesses casos — registra a mensagem como
 * não entregue, com o motivo.
 *
 * Sem esta tela esse registro não existe para ninguém: o backend grava a linha
 * e a venda se perde em silêncio, que é exatamente o comportamento que a
 * RN-38 veio desfazer.
 */
export function EventDetailUndelivered() {
  const ctx = use(EventDetailContext)
  const [expanded, setExpanded] = useState(false)
  const { data, isLoading } = useUndelivered(ctx?.state.event.id ?? "")
  if (!ctx) return null

  // Nada a mostrar é o caso normal — o card não deve ocupar espaço nem sugerir
  // que houve problema quando todo mundo foi avisado.
  if (isLoading) return <Skeleton className="h-24 w-full" />
  if (!data || data.total === 0) return null

  const copyCartLink = async (token: string) => {
    const url = `${window.location.origin}/cart/${token}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link do carrinho copiado")
    } catch {
      toast.error("Não foi possível copiar o link")
    }
  }

  return (
    <Card className="border-amber-300 dark:border-amber-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              {data.total === 1
                ? "1 comprador não pôde ser avisado"
                : `${data.total} compradores não puderam ser avisados`}
            </CardTitle>
            <CardDescription className="mt-1">
              O Instagram não permite mais responder essas pessoas por aqui. Elas continuam
              com o carrinho e com o link — só não foram avisadas automaticamente. Chame no
              direct ou por outro canal se quiser recuperar a venda.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Ocultar lista" : "Ver lista"}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Comprador</TableHead>
                  <TableHead>Carrinho</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="w-[140px] text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.entries.map((entry) => (
                  <TableRow key={`${entry.platformUserId}-${entry.notificationType}`}>
                    <TableCell className="font-medium">
                      @{entry.platformHandle || entry.platformUserId}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {entry.cartTotalItems} {entry.cartTotalItems === 1 ? "item" : "itens"} ·{" "}
                      {formatCurrency(entry.cartTotalCents)}
                    </TableCell>
                    <TableCell className="max-w-md text-sm text-muted-foreground">
                      <span className="flex items-start gap-2">
                        <MessageSquareOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {entry.reasonText}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.cartToken ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCartLink(entry.cartToken!)}
                        >
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Copiar link
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">sem carrinho</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
