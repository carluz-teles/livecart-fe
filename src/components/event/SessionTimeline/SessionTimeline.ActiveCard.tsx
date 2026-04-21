"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  MessageCircle,
  ShoppingCart,
  RotateCcw,
  RefreshCw,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PLATFORM_LABELS } from "@/lib/constants"
import { useAddPlatform } from "@/hooks/event"
import { useInstagramLives } from "@/hooks/integration"
import type { EventSession, Platform } from "@/types/event.types"

interface ActiveSessionCardProps {
  session: EventSession
  eventId: string
  sessionNumber: number
  onShowComments?: () => void
}

export function ActiveSessionCard({
  session,
  eventId,
  sessionNumber,
  onShowComments,
}: ActiveSessionCardProps) {
  const [recoveryOpen, setRecoveryOpen] = useState(false)
  const [recoveryPlatform, setRecoveryPlatform] = useState<Platform>("instagram")
  const [recoveryLiveId, setRecoveryLiveId] = useState("")
  const [elapsed, setElapsed] = useState("")

  const addPlatformMutation = useAddPlatform()

  // Instagram lives dropdown
  const { data: livesData, isLoading: livesLoading } = useInstagramLives()
  const lives = livesData?.data ?? []

  // Calculate elapsed time since session started
  useEffect(() => {
    if (!session.startedAt) return

    const updateElapsed = () => {
      const start = new Date(session.startedAt!).getTime()
      const now = Date.now()
      const diff = now - start
      const mins = Math.floor(diff / 60000)
      const hours = Math.floor(mins / 60)

      if (hours > 0) {
        setElapsed(`${hours}h ${mins % 60}min`)
      } else {
        setElapsed(`${mins} min`)
      }
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [session.startedAt])

  const handleCrashRecovery = async () => {
    if (!recoveryLiveId.trim()) return

    try {
      await addPlatformMutation.mutateAsync({
        eventId,
        payload: {
          platform: recoveryPlatform,
          platformLiveId: recoveryLiveId,
        },
      })
      setRecoveryOpen(false)
      setRecoveryLiveId("")
    } catch (error) {
      console.error("Failed to recover session:", error)
    }
  }

  const platformBadge = session.platforms?.[0]

  return (
    <div className="rounded-lg border border-primary bg-primary/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Live indicator */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-white"></span>
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            {/* Title row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">Sessao {sessionNumber}</span>
              <Badge variant="default" className="gap-1 bg-primary">
                <Play className="h-3 w-3" />
                Ao Vivo
              </Badge>
              {elapsed && (
                <span className="text-sm text-muted-foreground">ha {elapsed}</span>
              )}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {platformBadge && (
                <Badge variant="outline" className="text-xs">
                  {PLATFORM_LABELS[platformBadge.platform as Platform] || platformBadge.platform}
                  <span className="ml-1 text-muted-foreground">
                    #{platformBadge.platformLiveId.slice(-4)}
                  </span>
                </Badge>
              )}
              <span className="flex items-center gap-1 text-muted-foreground">
                <MessageCircle className="h-3.5 w-3.5" />
                {session.totalComments}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <ShoppingCart className="h-3.5 w-3.5" />
                {session.totalCarts}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={onShowComments}>
            <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
            Ver
          </Button>
          <Dialog open={recoveryOpen} onOpenChange={setRecoveryOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Recovery
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crash Recovery</DialogTitle>
                <DialogDescription>
                  Se a live caiu, insira o novo ID da transmissao para reconectar.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="recovery-platform">Plataforma</Label>
                  <Select
                    value={recoveryPlatform}
                    onValueChange={(value) => setRecoveryPlatform(value as Platform)}
                  >
                    <SelectTrigger id="recovery-platform">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    Nova Live <span className="text-destructive">*</span>
                  </Label>
                  {recoveryPlatform === "instagram" ? (
                    <Select value={recoveryLiveId} onValueChange={setRecoveryLiveId}>
                      <SelectTrigger>
                        <SelectValue placeholder={livesLoading ? "Carregando..." : "Selecione uma live"} />
                      </SelectTrigger>
                      <SelectContent>
                        {lives.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Nenhuma live ativa no momento
                          </div>
                        ) : (
                          lives.map((live) => {
                            const startTime = live.timestamp
                              ? format(new Date(live.timestamp), "HH:mm", { locale: ptBR })
                              : null
                            return (
                              <SelectItem key={live.id} value={live.id}>
                                Live @{live.username}
                                {startTime && ` (iniciada às ${startTime})`}
                              </SelectItem>
                            )
                          })
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="Ex: 18043029837128493"
                      value={recoveryLiveId}
                      onChange={(e) => setRecoveryLiveId(e.target.value)}
                    />
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setRecoveryOpen(false)}
                  disabled={addPlatformMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCrashRecovery}
                  disabled={!recoveryLiveId.trim() || addPlatformMutation.isPending}
                >
                  {addPlatformMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Reconectando...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reconectar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
