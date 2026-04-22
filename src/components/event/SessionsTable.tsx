"use client"

import { Radio, Instagram, Youtube } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PLATFORM_LABELS } from "@/lib/constants"
import type { EventSession, Platform } from "@/types/event.types"

interface SessionsTableProps {
  sessions: EventSession[]
  isLoading?: boolean
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
  switch (status) {
    case "active":
    case "live":
      return (
        <Badge variant="default" className="gap-1 bg-green-600">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
          </span>
          Ativa
        </Badge>
      )
    case "ended":
      return <Badge variant="secondary">Encerrada</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
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

export function SessionsTable({ sessions, isLoading }: SessionsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Radio className="h-4 w-4 text-muted-foreground" />
          Sessoes
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Sessao</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Duracao</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                    Nenhuma sessao
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session, index) => {
                  const platform = session.platforms?.[0]
                  const platformName = platform
                    ? PLATFORM_LABELS[platform.platform as Platform] || platform.platform
                    : "-"

                  return (
                    <TableRow key={session.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          S{index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {platform && getPlatformIcon(platform.platform)}
                          <span>{platformName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatDuration(session.startedAt, session.endedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(session.status)}
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
  )
}
