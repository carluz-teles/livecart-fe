"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Loader2, Radio } from "lucide-react"

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
import { createLiveSchema, type CreateLiveFormData } from "@/schemas/live.schema"

interface LiveFormProps {
  onSuccess?: () => void
}

const platformOptions = [
  { value: "instagram", label: "Instagram", icon: "instagram" },
  { value: "facebook", label: "Facebook", icon: "facebook" },
  { value: "youtube", label: "YouTube", icon: "youtube" },
  { value: "tiktok", label: "TikTok", icon: "tiktok" },
]

export function LiveForm({ onSuccess }: LiveFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateLiveFormData>({
    resolver: zodResolver(createLiveSchema),
    defaultValues: {
      platform: undefined,
      platformLiveId: "",
    },
  })

  const selectedPlatform = form.watch("platform")

  async function onSubmit(data: CreateLiveFormData) {
    setIsSubmitting(true)
    try {
      // TODO: Call API to connect to live
      console.log("Connecting to live:", data)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      form.reset()
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error connecting to live:", error)
    } finally {
      setIsSubmitting(false)
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Live
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[480px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-destructive" />
            Conectar a uma Live
          </SheetTitle>
          <SheetDescription>
            Conecte-se a uma transmissão ao vivo existente para começar a capturar
            pedidos em tempo real.
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Importante:</strong> Certifique-se de que a live está ativa
                antes de conectar. O sistema começará a monitorar os comentários
                imediatamente após a conexão.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Conectando..." : "Conectar"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
