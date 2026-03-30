"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface SessionFormProps {
  eventId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const platformOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
]

export function SessionForm({ eventId, open, onOpenChange, onSuccess }: SessionFormProps) {
  const createSession = useCreateSession()

  const form = useForm<CreateSessionFormData>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      platform: undefined,
      platformLiveId: "",
    },
  })

  const selectedPlatform = form.watch("platform")
  const isPending = createSession.isPending

  async function onSubmit(data: CreateSessionFormData) {
    createSession.mutate(
      {
        eventId,
        payload: {
          platform: data.platform,
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
                  <FormDescription>
                    ID da nova transmissao na plataforma
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
