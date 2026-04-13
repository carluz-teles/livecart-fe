"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, RefreshCw, Instagram } from "lucide-react"
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
import { addPlatformSchema, type AddPlatformFormData } from "@/schemas/event.schema"
import { useAddPlatform } from "@/hooks/event"

interface ReconnectFormProps {
  eventId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ReconnectForm({ eventId, open, onOpenChange, onSuccess }: ReconnectFormProps) {
  const addPlatform = useAddPlatform()

  const form = useForm<AddPlatformFormData>({
    resolver: zodResolver(addPlatformSchema),
    defaultValues: {
      platform: "instagram",
      platformLiveId: "",
    },
  })

  const isPending = addPlatform.isPending

  async function onSubmit(data: AddPlatformFormData) {
    addPlatform.mutate(
      {
        eventId,
        payload: {
          platform: "instagram", // Only Instagram supported
          platformLiveId: data.platformLiveId,
        },
      },
      {
        onSuccess: () => {
          toast.success("Reconectado com sucesso!")
          form.reset()
          onOpenChange(false)
          onSuccess?.()
        },
        onError: (error) => {
          toast.error("Erro ao reconectar", {
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
            <RefreshCw className="h-5 w-5" />
            Reconectar
          </DialogTitle>
          <DialogDescription>
            Reconecte-se a uma transmissao que caiu. Isso adiciona um novo ID de plataforma
            a sessao existente, mantendo todos os pedidos ja capturados.
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
                    Novo ID da Live <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 17841400000000000" {...field} />
                  </FormControl>
                  <FormDescription>
                    ID da nova transmissao do Instagram
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Dica:</strong> Use esta opcao quando a live caiu e voce precisa
                reconectar sem perder os pedidos ja capturados.
              </p>
            </div>

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
                {isPending ? "Reconectando..." : "Reconectar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
