"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Plus, Loader2, Radio } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useInstagramLives } from "@/hooks/integration"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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
import { createLiveSchema, type CreateLiveFormData } from "@/schemas/live.schema"
import { useCreateLive } from "@/hooks/live/useCreateLive"
import { useUpdateLive } from "@/hooks/live/useUpdateLive"
import type { LiveSession, CreateLiveSessionPayload, UpdateLiveSessionPayload } from "@/types/live.types"

interface LiveFormProps {
  live?: LiveSession
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
  trigger?: React.ReactNode
}

const platformOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
]

export function LiveForm({ live, open, onOpenChange, onSuccess, trigger }: LiveFormProps) {
  const isEditing = !!live
  const createLive = useCreateLive()
  const updateLive = useUpdateLive()

  const form = useForm<CreateLiveFormData>({
    resolver: zodResolver(createLiveSchema),
    defaultValues: {
      platform: undefined,
      platformLiveId: "",
    },
  })

  // Reset form when live changes (for edit mode)
  useEffect(() => {
    if (live) {
      form.reset({
        platform: live.platform,
        platformLiveId: live.platformLiveId,
      })
    } else {
      form.reset({
        platform: undefined,
        platformLiveId: "",
      })
    }
  }, [live, form])

  const selectedPlatform = form.watch("platform")
  const isPending = createLive.isPending || updateLive.isPending

  // Instagram lives dropdown
  const { data: livesData, isLoading: livesLoading } = useInstagramLives()
  const lives = livesData?.data ?? []

  async function onSubmit(data: CreateLiveFormData) {
    if (isEditing) {
      const payload: UpdateLiveSessionPayload = {
        title: `Live ${data.platform}`,
        platform: data.platform,
        platformLiveId: data.platformLiveId,
      }

      updateLive.mutate(
        { id: live.id, payload },
        {
          onSuccess: () => {
            toast.success("Live atualizada com sucesso!")
            onOpenChange?.(false)
            onSuccess?.()
          },
          onError: (error) => {
            toast.error("Erro ao atualizar live", {
              description: error.message || "Tente novamente mais tarde.",
            })
          },
        }
      )
    } else {
      const payload: CreateLiveSessionPayload = {
        title: `Live ${data.platform}`,
        platform: data.platform,
        platformLiveId: data.platformLiveId,
      }

      createLive.mutate(payload, {
        onSuccess: () => {
          toast.success("Live conectada com sucesso!")
          form.reset()
          onOpenChange?.(false)
          onSuccess?.()
        },
        onError: (error) => {
          toast.error("Erro ao conectar live", {
            description: error.message || "Tente novamente mais tarde.",
          })
        },
      })
    }
  }

  function getPlaceholder() {
    switch (selectedPlatform) {
      case "instagram":
        return "Ex: 17841400000000000"
      case "facebook":
        return "Ex: 1234567890"
      case "youtube":
        return "Ex: dQw4w9WgXcQ"
      case "tiktok":
        return "Ex: 7000000000000000000"
      default:
        return "ID da live na plataforma"
    }
  }

  function getDescription() {
    switch (selectedPlatform) {
      case "instagram":
        return "ID da live do Instagram (encontrado na URL ou API)"
      case "facebook":
        return "ID do vídeo ao vivo do Facebook"
      case "youtube":
        return "ID do vídeo do YouTube (parte final da URL)"
      case "tiktok":
        return "ID da live do TikTok"
      default:
        return "Identificador único da transmissão ao vivo"
    }
  }

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Nova Live
    </Button>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger !== null && (
        <SheetTrigger asChild>
          {trigger || defaultTrigger}
        </SheetTrigger>
      )}
      <SheetContent className="w-[400px] sm:w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-destructive" />
            {isEditing ? "Editar Live" : "Conectar a uma Live"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Atualize os dados da live."
              : "Conecte-se a uma transmissão ao vivo existente para começar a capturar pedidos em tempo real."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Plataforma <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a plataforma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {platformOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Plataforma onde a live está acontecendo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platformLiveId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {selectedPlatform === "instagram" ? "Live Ativa" : "ID da Live"}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  {selectedPlatform === "instagram" ? (
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
                  ) : (
                    <FormControl>
                      <Input placeholder={getPlaceholder()} {...field} />
                    </FormControl>
                  )}
                  <FormDescription>
                    {selectedPlatform === "instagram"
                      ? "Selecione a live ativa do Instagram para conectar"
                      : getDescription()}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Importante:</strong> Certifique-se de que a live está ativa
                  antes de conectar. O sistema começará a monitorar os comentários
                  imediatamente após a conexão.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange?.(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending
                  ? isEditing
                    ? "Salvando..."
                    : "Conectando..."
                  : isEditing
                    ? "Salvar"
                    : "Conectar"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
