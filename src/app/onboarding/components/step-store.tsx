"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Store, ArrowRight, MapPin } from "lucide-react"

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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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

function formatCNPJ(value: string): string {
  // Remove non-digits
  const digits = value.replace(/\D/g, "").substring(0, 14)

  // Format as XX.XXX.XXX/XXXX-XX
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

interface StepStoreProps {
  defaultValues?: Partial<StoreStepData>
  onNext: (data: StoreStepData & { storeSlug: string }) => void
  isSubmitting?: boolean
}

export function StepStore({ defaultValues, onNext, isSubmitting }: StepStoreProps) {
  const [showOptionalFields, setShowOptionalFields] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StoreStepData>({
    resolver: zodResolver(storeStepSchema),
    defaultValues: {
      storeName: "",
      cnpj: "",
      whatsappNumber: "",
      emailAddress: "",
      address: {
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "Brasil",
      },
      ...defaultValues,
    },
  })

  const storeName = watch("storeName")
  const storeSlug = useMemo(() => generateSlug(storeName || ""), [storeName])

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value)
    setValue("cnpj", formatted)
  }

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
          Configure sua loja para começar a vender nas lives
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Store Name */}
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

          {/* Store URL Preview */}
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

          {/* CNPJ */}
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              placeholder="XX.XXX.XXX/XXXX-XX"
              {...register("cnpj")}
              onChange={handleCNPJChange}
              disabled={isSubmitting}
            />
            {errors.cnpj && (
              <p className="text-sm text-destructive">{errors.cnpj.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Usado para emissão de notas fiscais
            </p>
          </div>

          {/* Address Section - City and State required */}
          <div className="space-y-4 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Endereço
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">
                  Cidade <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder="São Paulo"
                  {...register("address.city")}
                  disabled={isSubmitting}
                />
                {errors.address?.city && (
                  <p className="text-sm text-destructive">{errors.address.city.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">
                  Estado <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="state"
                  placeholder="SP"
                  {...register("address.state")}
                  disabled={isSubmitting}
                />
                {errors.address?.state && (
                  <p className="text-sm text-destructive">{errors.address.state.message}</p>
                )}
              </div>
            </div>

            {/* Optional address fields */}
            <Collapsible open={showOptionalFields} onOpenChange={setShowOptionalFields}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 px-0 text-muted-foreground hover:text-foreground"
                >
                  {showOptionalFields ? "Ocultar campos adicionais" : "Adicionar endereço completo (opcional)"}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    placeholder="Rua das Flores, 123"
                    {...register("address.street")}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="zip">CEP</Label>
                    <Input
                      id="zip"
                      placeholder="01234-567"
                      {...register("address.zip")}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">País</Label>
                    <Input
                      id="country"
                      placeholder="Brasil"
                      {...register("address.country")}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Contact Section - Optional */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 px-0 text-muted-foreground hover:text-foreground"
              >
                Adicionar contato (opcional)
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-2">
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
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting || !storeSlug}>
            {isSubmitting ? "Criando loja..." : "Criar Loja e Começar"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
