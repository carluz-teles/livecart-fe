"use client"

import { Activity, Radio } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { useEventActiveCheckouts } from "@/hooks/event"
import { cn } from "@/lib/utils"

interface EventActiveCheckoutsProps {
  eventId: string
  /** When false the polling pauses (use to suspend behind hidden tabs). */
  enabled?: boolean
}

export function EventActiveCheckouts({
  eventId,
  enabled = true,
}: EventActiveCheckoutsProps) {
  const { data, isLoading, isFetching } = useEventActiveCheckouts(
    eventId,
    enabled
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Radio
                className={cn(
                  "h-4 w-4",
                  isFetching ? "text-emerald-600 animate-pulse" : "text-muted-foreground"
                )}
              />
              Carrinhos no checkout agora
            </CardTitle>
            <CardDescription>
              Atualizado a cada 5s enquanto a aba estiver aberta.
            </CardDescription>
          </div>
          <Badge variant="outline">
            {data?.length ?? 0} {data?.length === 1 ? "carrinho" : "carrinhos"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !data || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Activity className="h-8 w-8 opacity-40" />
            <p>Nenhum carrinho aberto no checkout no momento.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Comprador</TableHead>
                  <TableHead className="text-right">Inicial</TableHead>
                  <TableHead className="text-right">Atual</TableHead>
                  <TableHead className="text-right">Δ</TableHead>
                  <TableHead className="text-center">Edições</TableHead>
                  <TableHead>Última edição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((c) => {
                  const tone =
                    c.deltaCents > 0
                      ? "text-emerald-700"
                      : c.deltaCents < 0
                      ? "text-rose-700"
                      : "text-muted-foreground"
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <p className="font-medium">@{c.platformHandle}</p>
                        <p className="text-xs text-muted-foreground">
                          aberto {formatDateTime(c.createdAt)}
                        </p>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {formatCurrency(c.initialSubtotalCents)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatCurrency(c.currentSubtotalCents)}
                      </TableCell>
                      <TableCell className={cn("text-right tabular-nums font-semibold", tone)}>
                        {c.deltaCents > 0 ? "+" : ""}
                        {formatCurrency(c.deltaCents)}
                      </TableCell>
                      <TableCell className="text-center tabular-nums">
                        {c.mutationCount}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {c.lastMutationAt ? formatDateTime(c.lastMutationAt) : "—"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
