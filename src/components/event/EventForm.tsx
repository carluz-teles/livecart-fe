"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Loader2, Radio, Instagram, CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import { useInstagramLives } from "@/hooks/integration"
import type { Event, CreateEventPayload } from "@/types/event.types"

interface EventFormProps {
  event?: Event
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
  trigger?: React.ReactNode
}

// Cart expiration options
const expirationOptions = [
  { value: "inherit", label: "Usar padrao da loja" },
  { value: "15", label: "15 minutos" },
  { value: "30", label: "30 minutos" },
  { value: "60", label: "1 hora" },
  { value: "120", label: "2 horas" },
  { value: "1440", label: "24 horas" },
]

// Max quantity per item options
const maxQuantityOptions = [
  { value: "inherit", label: "Usar padrao da loja" },
  { value: "1", label: "1 unidade" },
  { value: "3", label: "3 unidades" },
  { value: "5", label: "5 unidades" },
  { value: "10", label: "10 unidades" },
]

export function EventForm({ event, open, onOpenChange, onSuccess, trigger }: EventFormProps) {
  const isEditing = !!event
  const createEvent = useCreateEvent()
  const { data: livesData, isLoading: livesLoading } = useInstagramLives()
  const lives = livesData?.data ?? []

  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const sheetOpen = isControlled ? open : internalOpen
  const handleOpenChange = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      type: "single",
      platform: undefined,
      platformLiveId: "",
      scheduledAt: null,
      description: null,
      closeCartOnEventEnd: true,
      cartExpirationMinutes: null,
      cartMaxQuantityPerItem: null,
      sendOnLiveEnd: null,
    },
  })

  // Reset form when event changes (for edit mode)
  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title || "",
        type: event.type || "single",
        platform: undefined,
        platformLiveId: "",
        scheduledAt: event.scheduledAt,
        description: event.description,
        closeCartOnEventEnd: event.closeCartOnEventEnd ?? true,
        cartExpirationMinutes: event.cartExpirationMinutes,
        cartMaxQuantityPerItem: event.cartMaxQuantityPerItem,
        sendOnLiveEnd: event.sendOnLiveEnd,
      })
    } else {
      form.reset({
        title: "",
        type: "single",
        platform: undefined,
        platformLiveId: "",
        scheduledAt: null,
        description: null,
        closeCartOnEventEnd: true,
        cartExpirationMinutes: null,
        cartMaxQuantityPerItem: null,
        sendOnLiveEnd: null,
      })
    }
  }, [event, form])

  const platformLiveId = form.watch("platformLiveId")
  const isPending = createEvent.isPending

  async function onSubmit(data: CreateEventFormData) {
    const payload: CreateEventPayload = {
      title: data.title,
      type: data.type,
      // Only include platform if platformLiveId is provided
      platform: data.platformLiveId ? "instagram" : undefined,
      platformLiveId: data.platformLiveId || undefined,
      // Scheduling
      scheduledAt: data.scheduledAt || undefined,
      description: data.description || undefined,
      // Cart settings
      closeCartOnEventEnd: data.closeCartOnEventEnd,
      cartExpirationMinutes: data.cartExpirationMinutes,
      cartMaxQuantityPerItem: data.cartMaxQuantityPerItem,
      sendOnLiveEnd: data.sendOnLiveEnd,
    }

    createEvent.mutate(payload, {
      onSuccess: () => {
        toast.success("Evento criado com sucesso!")
        form.reset()
        handleOpenChange(false)
        onSuccess?.()
      },
      onError: (error) => {
        toast.error("Erro ao criar evento", {
          description: error.message || "Tente novamente mais tarde.",
        })
      },
    })
  }

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Novo Evento
    </Button>
  )

  return (
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      {trigger !== null && (
        <SheetTrigger asChild>
          {trigger || defaultTrigger}
        </SheetTrigger>
      )}
      <SheetContent className="w-[400px] sm:w-[480px] overflow-y-auto">
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single" id="type-single" />
                        <Label htmlFor="type-single" className="font-normal cursor-pointer">
                          Live Unica
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="multi" id="type-multi" />
                        <Label htmlFor="type-multi" className="font-normal cursor-pointer">
                          Multi-sessao
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="relative py-2">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                Conectar a uma live (opcional)
              </span>
            </div>

            <div className="space-y-2">
              <Label>Plataforma</Label>
              <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
                <Instagram className="h-5 w-5 text-pink-500" />
                <span className="text-sm font-medium">Instagram</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Apenas Instagram e suportado no momento
              </p>
            </div>

            <FormField
              control={form.control}
              name="platformLiveId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Live Ativa</FormLabel>
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
                        lives.map((live) => (
                          <SelectItem key={live.id} value={live.id}>
                            Live #{live.id.slice(-6)} (@{live.username})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecione a live ativa do Instagram para conectar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && platformLiveId && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Importante:</strong> Certifique-se de que a live esta ativa
                  antes de conectar. O sistema comecara a monitorar os comentarios
                  imediatamente apos a conexao.
                </p>
              </div>
            )}

            <div className="relative py-2">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                Configuracoes do carrinho
              </span>
            </div>

            <FormField
              control={form.control}
              name="closeCartOnEventEnd"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">
                      Fechar carrinho ao finalizar
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Carrinho para de aceitar itens quando o evento termina
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cartExpirationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiracao do carrinho</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value === "inherit" ? null : parseInt(value, 10))
                    }}
                    value={field.value === null ? "inherit" : field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a expiracao" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expirationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Tempo ate o carrinho expirar apos inatividade
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cartMaxQuantityPerItem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade maxima por item</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value === "inherit" ? null : parseInt(value, 10))
                    }}
                    value={field.value === null ? "inherit" : field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a quantidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {maxQuantityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Limite maximo de unidades por produto no carrinho
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sendOnLiveEnd"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">
                      Enviar links automaticamente
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Enviar links de checkout via DM quando o evento terminar
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="relative py-2">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                Agendamento (opcional)
              </span>
            </div>

            <FormField
              control={form.control}
              name="scheduledAt"
              render={({ field }) => {
                const selectedDate = field.value ? new Date(field.value) : undefined
                const timeValue = selectedDate
                  ? format(selectedDate, "HH:mm")
                  : ""

                const handleDateSelect = (date: Date | undefined) => {
                  if (!date) {
                    field.onChange(null)
                    return
                  }
                  // Preserve time if already set
                  if (selectedDate) {
                    date.setHours(selectedDate.getHours(), selectedDate.getMinutes())
                  } else {
                    // Default to 10:00
                    date.setHours(10, 0)
                  }
                  field.onChange(date.toISOString())
                }

                const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                  const [hours, minutes] = e.target.value.split(":").map(Number)
                  const date = selectedDate ? new Date(selectedDate) : new Date()
                  date.setHours(hours, minutes, 0, 0)
                  field.onChange(date.toISOString())
                }

                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data e hora do evento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(new Date(field.value), "PPP 'às' HH:mm", { locale: ptBR })
                              : "Selecione data e hora"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          disabled={(date) => date < new Date()}
                          locale={ptBR}
                        />
                        <div className="border-t p-3">
                          <Label className="text-sm">Horário</Label>
                          <Input
                            type="time"
                            value={timeValue}
                            onChange={handleTimeChange}
                            className="mt-1"
                          />
                        </div>
                        {field.value && (
                          <div className="border-t p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full"
                              onClick={() => field.onChange(null)}
                            >
                              Limpar data
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Agende para iniciar o evento automaticamente nesta data
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas internas sobre o evento, produtos destaque, etc..."
                      className="resize-none min-h-[80px]"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Descrição interna para identificação (não visível aos clientes)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
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
