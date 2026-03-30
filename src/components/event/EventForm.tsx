"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Loader2, Radio } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { createEventSchema, type CreateEventFormData } from "@/schemas/event.schema"
import { useCreateEvent } from "@/hooks/event"
import type { Event, CreateEventPayload } from "@/types/event.types"

interface EventFormProps {
  event?: Event
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

export function EventForm({ event, open, onOpenChange, onSuccess, trigger }: EventFormProps) {
  const isEditing = !!event
  const createEvent = useCreateEvent()

  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      platform: undefined,
      platformLiveId: "",
    },
  })

  // Reset form when event changes (for edit mode)
  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title || "",
        platform: undefined,
        platformLiveId: "",
      })
    } else {
      form.reset({
        title: "",
        platform: undefined,
        platformLiveId: "",
      })
    }
  }, [event, form])

  const selectedPlatform = form.watch("platform")
  const isPending = createEvent.isPending

  async function onSubmit(data: CreateEventFormData) {
    const payload: CreateEventPayload = {
      title: data.title,
      platform: data.platform,
      platformLiveId: data.platformLiveId,
    }

    createEvent.mutate(payload, {
      onSuccess: () => {
        toast.success("Evento criado com sucesso!")
        form.reset()
        onOpenChange?.(false)
        onSuccess?.()
      },
      onError: (error) => {
        toast.error("Erro ao criar evento", {
          description: error.message || "Tente novamente mais tarde.",
        })
      },
    })
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
        return "ID do video ao vivo do Facebook"
      case "youtube":
        return "ID do video do YouTube (parte final da URL)"
      case "tiktok":
        return "ID da live do TikTok"
      default:
        return "Identificador unico da transmissao ao vivo"
    }
  }

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Novo Evento
    </Button>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger !== null && (
        <SheetTrigger asChild>
          {trigger || defaultTrigger}
        </SheetTrigger>
      )}
      <SheetContent className="w-[400px] sm:w-[480px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-destructive" />
            {isEditing ? "Editar Evento" : "Novo Evento"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Atualize os dados do evento."
              : "Crie um novo evento e conecte-se a uma transmissao ao vivo para comecar a capturar pedidos."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Titulo <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Live de Sabado" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nome do evento para identificacao
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    Plataforma onde a live esta acontecendo
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
                    ID da Live <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={getPlaceholder()} {...field} />
                  </FormControl>
                  <FormDescription>{getDescription()}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Importante:</strong> Certifique-se de que a live esta ativa
                  antes de conectar. O sistema comecara a monitorar os comentarios
                  imediatamente apos a conexao.
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
                {isPending ? "Criando..." : "Criar Evento"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
