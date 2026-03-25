"use client"

import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Store, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { storeStepSchema, type StoreStepData } from "@/schemas/onboarding.schema"

function generateSlug(name: string): string {
  if (!name.trim()) return ""
  // Backend expects alphanumeric only (no dashes or special chars)
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, "") // Keep only alphanumeric
    .substring(0, 50)
}

interface StepStoreProps {
  defaultValues?: Partial<StoreStepData>
  onNext: (data: StoreStepData & { storeSlug: string }) => void
  isSubmitting?: boolean
}

export function StepStore({ defaultValues, onNext, isSubmitting }: StepStoreProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StoreStepData>({
    resolver: zodResolver(storeStepSchema),
    defaultValues: {
      storeName: "",
      whatsappNumber: "",
      emailAddress: "",
      ...defaultValues,
    },
  })

  const storeName = watch("storeName")
  const storeSlug = useMemo(() => generateSlug(storeName || ""), [storeName])

  const onSubmit = (data: StoreStepData) => {
    onNext({ ...data, storeSlug })
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Store className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Informações da Loja</CardTitle>
        <CardDescription>
          Vamos começar com o básico. Como sua loja se chama?
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">
              Nome da Loja <span className="text-destructive">*</span>
            </Label>
            <Input
              id="storeName"
              placeholder="Minha Loja"
              {...register("storeName")}
              disabled={isSubmitting}
            />
            {errors.storeName && (
              <p className="text-sm text-destructive">{errors.storeName.message}</p>
            )}
          </div>

          {storeSlug && (
            <div className="space-y-2">
              <Label>URL da Loja</Label>
              <div className="flex items-center gap-1 rounded-md border bg-muted/50 px-3 py-2">
                <span className="text-sm text-muted-foreground">livecart.com/</span>
                <span className="text-sm font-medium">{storeSlug}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Gerada automaticamente a partir do nome
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">WhatsApp</Label>
            <Input
              id="whatsappNumber"
              placeholder="(11) 99999-9999"
              {...register("whatsappNumber")}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Usado para notificar clientes sobre pedidos
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailAddress">Email</Label>
            <Input
              id="emailAddress"
              type="email"
              placeholder="contato@minhaloja.com"
              {...register("emailAddress")}
              disabled={isSubmitting}
            />
            {errors.emailAddress && (
              <p className="text-sm text-destructive">{errors.emailAddress.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting || !storeSlug}>
            {isSubmitting ? "Criando..." : "Continuar"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
