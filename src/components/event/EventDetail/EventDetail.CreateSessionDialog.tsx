"use client"

import { use, useState } from "react"
import { Plus } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useInstagramLives } from "@/hooks/integration"
import type { Platform } from "@/types/event.types"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailCreateSessionDialog() {
  const ctx = use(EventDetailContext)
  const [platform, setPlatform] = useState<Platform>("instagram")
  const [liveId, setLiveId] = useState("")

  const { data: livesData, isLoading: livesLoading } = useInstagramLives()
  const lives = livesData?.data ?? []

  if (!ctx) return null
  const { createSessionOpen } = ctx.state
  const { setCreateSessionOpen } = ctx.actions

  const handleSubmit = () => {
    // TODO: wire to createSession mutation when BE ships it.
    setCreateSessionOpen(false)
    setLiveId("")
  }

  return (
    <Dialog open={createSessionOpen} onOpenChange={setCreateSessionOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova sessão</DialogTitle>
          <DialogDescription>
            Crie uma nova sessão de transmissão para este evento. Os carrinhos
            existentes serão mantidos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-platform">Plataforma</Label>
            <Select
              value={platform}
              onValueChange={(value) => setPlatform(value as Platform)}
            >
              <SelectTrigger id="new-platform">
                <SelectValue placeholder="Selecione a plataforma" />
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
              Live ativa <span className="text-destructive">*</span>
            </Label>
            {platform === "instagram" ? (
              <Select value={liveId} onValueChange={setLiveId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      livesLoading ? "Carregando…" : "Selecione uma live"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {lives.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Nenhuma live ativa no momento
                    </div>
                  ) : (
                    lives.map((live) => {
                      const startTime = live.timestamp
                        ? format(new Date(live.timestamp), "HH:mm", {
                            locale: ptBR,
                          })
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
                value={liveId}
                onChange={(e) => setLiveId(e.target.value)}
              />
            )}
            <p className="text-xs text-muted-foreground">
              Selecione a live ativa da plataforma escolhida.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setCreateSessionOpen(false)}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!liveId.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            Criar sessão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
