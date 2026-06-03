"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  MoreHorizontal,
  Radio,
  Calendar,
  ShoppingCart,
  Trash2,
  Square,
  Plus,
  RefreshCw,
  CheckCircle,
  DollarSign,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"

import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/format"
import { EVENT_STATUS_CONFIG, getStatusConfig, type EventStatusConfig } from "@/lib/constants"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EventFilters, EventForm, PostEventForm, SessionForm, ReconnectForm } from "@/components/event"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatsCard } from "@/components/shared/StatsCard"
import { useListParams } from "@/hooks/shared/useListParams"
import { useEvents, useEventStats, useEndEvent, useDeleteEvent } from "@/hooks/event"
import type { Event, EventFilters as EventFiltersType } from "@/types/event.types"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// Icon mapping for event statuses
const EVENT_STATUS_ICONS = {
  "calendar": Calendar,
  "radio": Radio,
  "check-circle": CheckCircle,
} as const

export default function EventsPage() {
  const router = useRouter()
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null)
  const [endingEvent, setEndingEvent] = useState<Event | null>(null)
  const [sessionEvent, setSessionEvent] = useState<Event | null>(null)
  const [reconnectEvent, setReconnectEvent] = useState<Event | null>(null)

  const {
    search,
    setSearch,
    filters,
    setFilters,
    params,
  } = useListParams<EventFiltersType>()

  const { data, isLoading, error } = useEvents(params)
  const { data: stats, isLoading: statsLoading } = useEventStats()
  const endEvent = useEndEvent()
  const deleteEvent = useDeleteEvent()

  const events = data?.data ?? []

  function handleEndEvent(event: Event) {
    setEndingEvent(event)
  }

  function confirmEndEvent() {
    if (!endingEvent) return

    endEvent.mutate(
      { id: endingEvent.id },
      {
        onSuccess: (response) => {
          toast.success("Evento finalizado com sucesso!", {
            description: `${response.cartsFinalized} carrinho(s) finalizado(s).`,
          })
          setEndingEvent(null)
        },
        onError: (error) => {
          toast.error("Erro ao finalizar evento", {
            description: error.message || "Tente novamente mais tarde.",
          })
        },
      }
    )
  }

  function handleDelete(event: Event) {
    setDeletingEvent(event)
  }

  function confirmDelete() {
    if (!deletingEvent) return

    deleteEvent.mutate(deletingEvent.id, {
      onSuccess: () => {
        toast.success("Evento excluido com sucesso!")
        setDeletingEvent(null)
      },
      onError: (error) => {
        toast.error("Erro ao excluir evento", {
          description: error.message || "Tente novamente mais tarde.",
        })
      },
    })
  }

  function handleViewDetails(event: Event) {
    router.push(`/events/${event.id}`)
  }

  function handleNewSession(event: Event) {
    setSessionEvent(event)
  }

  function handleReconnect(event: Event) {
    // Check if there's an active session to reconnect to
    const activeSession = event.sessions?.find(s => s.status === "active" || s.status === "live")
    if (activeSession) {
      setReconnectEvent(event)
    } else {
      toast.error("Nenhuma sessao ativa encontrada")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Eventos"
        description="Gerencie seus eventos e acompanhe as vendas em tempo real"
      >
        <div className="flex items-center gap-2">
          <PostEventForm />
          <EventForm />
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total de Eventos"
          value={stats?.totalLives ?? 0}
          description="eventos criados"
          icon={Calendar}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Ativos Agora"
          value={stats?.activeLives ?? 0}
          description="ao vivo agora"
          icon={Radio}
          isLoading={statsLoading}
          variant="success"
        />
        <StatsCard
          title="Total de Pedidos"
          value={stats?.totalOrders ?? 0}
          description="carrinhos criados"
          icon={ShoppingCart}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Receita Total"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          description="em vendas"
          icon={DollarSign}
          isLoading={statsLoading}
          variant="success"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Eventos</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os seus eventos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por titulo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <EventFilters filters={filters} onChange={setFilters} />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titulo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Pedidos</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-[80px] text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-destructive">
                      Erro ao carregar eventos. Tente novamente.
                    </TableCell>
                  </TableRow>
                ) : events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum evento encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => {
                    const config = getStatusConfig(EVENT_STATUS_CONFIG, event.status, "ended") as EventStatusConfig
                    const StatusIcon = EVENT_STATUS_ICONS[config.icon]
                    return (
                      <TableRow
                        key={event.id}
                        onClick={() => handleViewDetails(event)}
                        className="group cursor-pointer transition-colors hover:bg-muted/60"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="transition-colors group-hover:text-primary">
                              {event.title || "Sem titulo"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{event.totalOrders}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{formatRelativeDate(event.createdAt)}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(event.createdAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-60 transition-opacity group-hover:opacity-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Abrir menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acoes</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {event.status === "active" && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleNewSession(event)}>
                                      <Plus className="mr-2 h-4 w-4" />
                                      Nova Sessao
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleReconnect(event)}>
                                      <RefreshCw className="mr-2 h-4 w-4" />
                                      Reconectar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleEndEvent(event)}>
                                      <Square className="mr-2 h-4 w-4" />
                                      Finalizar evento
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {event.status === "ended" && (
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => handleDelete(event)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <ChevronRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Clique em uma linha para ver os detalhes do evento
          </p>
        </CardContent>
      </Card>

      {/* New Session Dialog */}
      {sessionEvent && (
        <SessionForm
          eventId={sessionEvent.id}
          open={!!sessionEvent}
          onOpenChange={(open) => !open && setSessionEvent(null)}
        />
      )}

      {/* Reconnect Dialog */}
      {reconnectEvent && (
        <ReconnectForm
          eventId={reconnectEvent.id}
          open={!!reconnectEvent}
          onOpenChange={(open) => !open && setReconnectEvent(null)}
        />
      )}

      {/* End Event Confirmation Dialog */}
      <AlertDialog open={!!endingEvent} onOpenChange={(open) => !open && setEndingEvent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar evento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja finalizar o evento &quot;{endingEvent?.title}&quot;?
              Esta acao ira encerrar todas as sessoes ativas e finalizar os carrinhos pendentes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEndEvent}>
              {endEvent.isPending ? "Finalizando..." : "Finalizar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingEvent} onOpenChange={(open) => !open && setDeletingEvent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o evento &quot;{deletingEvent?.title}&quot;?
              Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEvent.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
