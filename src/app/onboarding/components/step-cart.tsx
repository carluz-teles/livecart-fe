"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ShoppingCart, ArrowRight, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cartStepSchema, type CartStepData } from "@/schemas/onboarding.schema"
import { DEFAULT_CART_SETTINGS } from "@/types/store.types"

interface StepCartProps {
  defaultValues?: Partial<CartStepData>
  onNext: (data: CartStepData) => void
  onBack: () => void
  onSkip: () => void
  isSubmitting?: boolean
}

const EXPIRATION_OPTIONS = [
  { value: "15", label: "15 minutos" },
  { value: "30", label: "30 minutos" },
  { value: "60", label: "1 hora" },
  { value: "120", label: "2 horas" },
  { value: "0", label: "Sem expiração" },
]

export function StepCart({ defaultValues, onNext, onBack, onSkip, isSubmitting }: StepCartProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CartStepData>({
    resolver: zodResolver(cartStepSchema),
    defaultValues: {
      ...DEFAULT_CART_SETTINGS,
      ...defaultValues,
    },
  })

  const enabled = watch("enabled")
  const expirationMinutes = watch("expirationMinutes")

  const onSubmit = (data: CartStepData) => {
    onNext(data)
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <ShoppingCart className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Configurações do Carrinho</CardTitle>
        <CardDescription>
          Defina como o carrinho de compras vai funcionar durante suas lives
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Enabled */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Carrinho Ativo</Label>
              <p className="text-xs text-muted-foreground">
                Permite clientes adicionarem itens durante a live
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={(checked) => setValue("enabled", checked)}
              disabled={isSubmitting}
            />
          </div>

          {/* Expiration */}
          <div className="space-y-2">
            <Label>Tempo de Expiração</Label>
            <Select
              value={String(expirationMinutes)}
              onValueChange={(value) => setValue("expirationMinutes", parseInt(value))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tempo" />
              </SelectTrigger>
              <SelectContent>
                {EXPIRATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Tempo que o cliente tem para finalizar a compra
            </p>
          </div>

          {/* Reserve Stock */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reservar Estoque</Label>
              <p className="text-xs text-muted-foreground">
                Reserva o produto quando adicionado ao carrinho
              </p>
            </div>
            <Switch
              checked={watch("reserveStock")}
              onCheckedChange={(checked) => setValue("reserveStock", checked)}
              disabled={isSubmitting}
            />
          </div>

          {/* Max Quantity Per Item */}
          <div className="space-y-2">
            <Label htmlFor="maxQuantityPerItem">Quantidade Máxima por Produto</Label>
            <Input
              id="maxQuantityPerItem"
              type="number"
              min={0}
              {...register("maxQuantityPerItem", { valueAsNumber: true })}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Limite de unidades do mesmo produto (0 = sem limite)
            </p>
            {errors.maxQuantityPerItem && (
              <p className="text-sm text-destructive">{errors.maxQuantityPerItem.message}</p>
            )}
          </div>

          {/* Notify Before Expiration */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificar Antes de Expirar</Label>
              <p className="text-xs text-muted-foreground">
                Avisa o cliente antes do carrinho expirar
              </p>
            </div>
            <Switch
              checked={watch("notifyBeforeExpiration")}
              onCheckedChange={(checked) => setValue("notifyBeforeExpiration", checked)}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button type="button" variant="ghost" onClick={onSkip} disabled={isSubmitting}>
            Pular
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Continuar"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
