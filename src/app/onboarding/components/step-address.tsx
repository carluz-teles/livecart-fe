"use client"

import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCepLookup } from "@/hooks/onboarding"
import { formatCEP, UFS } from "@/lib/br-format"
import { wizardAddressSchema, type WizardAddressData } from "@/schemas/onboarding.schema"

interface StepAddressProps {
  defaultValues?: Partial<WizardAddressData>
  onNext: (data: WizardAddressData) => void
  onBack: () => void
}

// Passo 3 — Endereço. Renderização pura: o lookup de CEP (ViaCEP) vive no
// useCepLookup; aqui só máscara, formulário e estados visuais.
export function StepAddress({ defaultValues, onNext, onBack }: StepAddressProps) {
  const numberRef = useRef<HTMLInputElement | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<WizardAddressData>({
    resolver: zodResolver(wizardAddressSchema),
    defaultValues: {
      zip: "",
      street: "",
      number: "",
      complement: "",
      district: "",
      city: "",
      state: "",
      ...defaultValues,
    },
  })

  const cepLookup = useCepLookup((result) => {
    if (result.street) setValue("street", result.street)
    if (result.district) setValue("district", result.district)
    if (result.city) setValue("city", result.city, { shouldValidate: true })
    if (result.state) setValue("state", result.state, { shouldValidate: true })
    numberRef.current?.focus()
  })

  // Endereço vindo do CNPJ (passo anterior): sincroniza sem apagar o que o
  // usuário já digitou.
  useEffect(() => {
    if (!defaultValues) return
    for (const [key, value] of Object.entries(defaultValues)) {
      if (value && !getValues(key as keyof WizardAddressData)) {
        setValue(key as keyof WizardAddressData, value, { shouldValidate: false })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues])

  const uf = watch("state")

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value)
    setValue("zip", formatted)
    cepLookup.run(formatted)
  }

  const numberField = register("number")

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <div className="space-y-2">
          <Label htmlFor="zip">CEP</Label>
          <div className="relative">
            <Input
              id="zip"
              autoFocus
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="00000-000"
              aria-describedby="zip-status"
              {...register("zip")}
              onChange={handleCepChange}
            />
            {cepLookup.status === "loading" && (
              <Loader2
                className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                aria-hidden="true"
              />
            )}
          </div>
          <p id="zip-status" role="status" className="min-h-4 text-xs">
            {cepLookup.status === "hit" && (
              <span className="flex items-center gap-1 text-emerald-600">
                <Sparkles className="size-3" aria-hidden="true" /> Endereço encontrado!
              </span>
            )}
            {cepLookup.status === "miss" && (
              <span className="text-muted-foreground">CEP não encontrado — preencha abaixo.</span>
            )}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="street">Rua / Avenida</Label>
          <Input
            id="street"
            autoComplete="address-line1"
            placeholder="Av. Paulista"
            {...register("street")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[120px_1fr_1fr]">
        <div className="space-y-2">
          <Label htmlFor="number">Número</Label>
          <Input
            id="number"
            inputMode="numeric"
            placeholder="123"
            {...numberField}
            ref={(el) => {
              numberField.ref(el)
              numberRef.current = el
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="complement">Complemento</Label>
          <Input id="complement" placeholder="Sala 4, fundos…" {...register("complement")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="district">Bairro</Label>
          <Input id="district" placeholder="Centro" {...register("district")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <div className="space-y-2">
          <Label htmlFor="city">
            Cidade <span aria-hidden="true" className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            autoComplete="address-level2"
            placeholder="São Paulo"
            aria-required="true"
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? "city-error" : undefined}
            {...register("city")}
          />
          {errors.city && (
            <p id="city-error" role="alert" className="text-sm text-destructive">
              {errors.city.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">
            UF <span aria-hidden="true" className="text-destructive">*</span>
          </Label>
          <Select
            value={uf || undefined}
            onValueChange={(v) => setValue("state", v, { shouldValidate: true })}
          >
            <SelectTrigger
              id="state"
              aria-required="true"
              aria-invalid={!!errors.state}
              aria-describedby={errors.state ? "state-error" : undefined}
            >
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              {UFS.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && (
            <p id="state-error" role="alert" className="text-sm text-destructive">
              {errors.state.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar
        </Button>
        <Button type="submit" className="flex-1">
          Avançar
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </form>
  )
}
