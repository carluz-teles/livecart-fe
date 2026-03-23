"use client"

import { Search, MoreHorizontal, Radio, Calendar, ShoppingCart, Play, Eye, Clock } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LiveForm } from "@/components/live/LiveForm"
import { LiveFilters } from "@/components/shared/Filters"
import { useListParams } from "@/hooks/shared/useListParams"
import { useLives, useLiveStats } from "@/hooks/live"
import type { LiveFilters as LiveFiltersType, LiveStatus } from "@/types/live.types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const statusConfig: Record<LiveStatus | string, { label: string; variant: "outline" | "destructive" | "secondary" | "default"; icon: typeof Calendar }> = {
  scheduled: { label: "Agendada", variant: "outline", icon: Calendar },
  live: { label: "Ao Vivo", variant: "destructive", icon: Play },
  ended: { label: "Finalizada", variant: "secondary", icon: Eye },
  cancelled: { label: "Cancelada", variant: "outline", icon: Clock },
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "-"
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR")
}

function formatTime(dateString: string | null): string {
  if (!dateString) return "-"
  const date = new Date(dateString)
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

export default function LivesPage() {
  const {
    search,
    setSearch,
    filters,
    setFilters,
    params,
  } = useListParams<LiveFiltersType>()

  // Fetch lives from API
  const { data, isLoading, error } = useLives(params)
  // Fetch stats from API
  const { data: stats, isLoading: statsLoading } = useLiveStats()

  const lives = data?.data ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lives</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas lives e acompanhe as vendas em tempo real
          </p>
        </div>
        <LiveForm />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Lives</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.total_lives ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Lives realizadas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lives Ativas</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.active_lives ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Acontecendo agora
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos em Lives</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.total_orders ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de pedidos detectados
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Lives</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as suas lives.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <LiveFilters filters={filters} onChange={setFilters} />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Live</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead className="text-center">Comentários</TableHead>
                  <TableHead className="text-center">Pedidos</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-destructive">
                      Erro ao carregar lives. Tente novamente.
                    </TableCell>
                  </TableRow>
                ) : lives.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Nenhuma live encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  lives.map((live) => {
                    const config = statusConfig[live.status] || statusConfig.scheduled
                    const StatusIcon = config.icon
                    return (
                      <TableRow key={live.id}>
                        <TableCell className="font-medium">{live.title || "Sem título"}</TableCell>
                        <TableCell className="capitalize">{live.platform}</TableCell>
                        <TableCell>
                          <Badge variant={config.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{formatDate(live.started_at)}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(live.started_at)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{live.total_comments}</TableCell>
                        <TableCell className="text-center">{live.total_orders}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {live.status === "scheduled" && (
                                <DropdownMenuItem>Iniciar live</DropdownMenuItem>
                              )}
                              {live.status === "live" && (
                                <DropdownMenuItem>Encerrar live</DropdownMenuItem>
                              )}
                              <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                              {live.status === "ended" && (
                                <DropdownMenuItem>Ver relatório</DropdownMenuItem>
                              )}
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
