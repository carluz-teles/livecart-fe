"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2, Plus, Instagram } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createSessionSchema, type CreateSessionFormData } from "@/schemas/event.schema"
import { useCreateSession } from "@/hooks/event"
import { useInstagramLives } from "@/hooks/integration"

interface SessionFormProps {
  eventId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function SessionForm({ eventId, open, onOpenChange, onSuccess }: SessionFormProps) {
  const createSession = useCreateSession()

  const form = useForm<CreateSessionFormData>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      platform: "instagram",
      platformLiveId: "",
    },
  })

  const isPending = createSession.isPending

  // Instagram lives dropdown
  const { data: livesData, isLoading: livesLoading } = useInstagramLives()
  const lives = livesData?.data ?? []

  async function onSubmit(data: CreateSessionFormData) {
    createSession.mutate(
      {
        eventId,
        payload: {
          platform: "instagram", // Only Instagram supported
          platformLiveId: data.platformLiveId,
        },
      },
      {
        onSuccess: () => {
          toast.success("Sessao criada com sucesso!")
          form.reset()
          onOpenChange(false)
          onSuccess?.()
        },
        onError: (error) => {
          toast.error("Erro ao criar sessao", {
            description: error.message || "Tente novamente mais tarde.",
          })
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nova Sessao
          </DialogTitle>
          <DialogDescription>
            Adicione uma nova sessao de transmissao ao evento. Isso permite continuar
            capturando pedidos em uma nova live.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormItem>
              <FormLabel>Plataforma</FormLabel>
              <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
                <Instagram className="h-5 w-5 text-pink-500" />
                <span className="text-sm font-medium">Instagram</span>
              </div>
              <FormDescription>
                Apenas Instagram e suportado no momento
              </FormDescription>
            </FormItem>

            <FormField
              control={form.control}
              name="platformLiveId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Live Ativa <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={livesLoading ? "Carregando..." : "Selecione uma live"} />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormDescription>
                    Selecione a live ativa do Instagram
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Criando..." : "Criar Sessao"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
