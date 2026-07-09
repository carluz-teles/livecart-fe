"use client"

import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, Building2, Loader2, Search, Sparkles, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCnpjLookup } from "@/hooks/onboarding"
import { formatCNPJ, generateSlug } from "@/lib/br-format"
import type { CnpjResult } from "@/services/external/br-lookup.service"
import { wizardStoreSchema, type WizardStoreData } from "@/schemas/onboarding.schema"

interface StepStoreProps {
  defaultValues?: Partial<WizardStoreData>
  onNext: (data: WizardStoreData) => void
  onBack: () => void
  onCnpjData: (data: CnpjResult) => void
}

// Passo 2 — Sua loja. Renderização pura: o lookup de CNPJ (BrasilAPI) vive
// no useCnpjLookup; o autofill em cascata é orquestrado pelo wizard.
export function StepStore({ defaultValues, onNext, onBack, onCnpjData }: StepStoreProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<WizardStoreData>({
    resolver: zodResolver(wizardStoreSchema),
    defaultValues: { sellerType: "individual", storeName: "", cnpj: "", ...defaultValues },
  })

  const cnpjLookup = useCnpjLookup((data) => {
    // nome fantasia > razão social; nunca sobrescreve o que já foi digitado
    const suggestedName = data.tradeName || data.legalName
    if (suggestedName && !getValues("storeName")) {
      setValue("storeName", suggestedName, { shouldValidate: true })
    }
    onCnpjData(data)
  })

  const storeName = watch("storeName")
  const storeSlug = useMemo(() => generateSlug(storeName || ""), [storeName])
  const sellerType = watch("sellerType")

  const pickSellerType = (type: "individual" | "company") => {
    setValue("sellerType", type, { shouldValidate: true })
    if (type === "individual") {
      setValue("cnpj", "")
      cnpjLookup.reset()
    }
  }

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("cnpj", formatCNPJ(e.target.value))
    cnpjLookup.reset()
  }

  const runLookup = () => cnpjLookup.run(getValues("cnpj") ?? "")

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5" noValidate>
      {/* Pessoa física × Empresa: quem vende informal não precisa de CNPJ */}
      <div className="space-y-2">
        <Label id="sellerType-label">Como você vende?</Label>
        <div
          role="radiogroup"
          aria-labelledby="sellerType-label"
          className="grid grid-cols-2 gap-3"
        >
          <button
            type="button"
            role="radio"
            aria-checked={sellerType === "individual"}
            onClick={() => pickSellerType("individual")}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              sellerType === "individual"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "hover:border-muted-foreground/40"
            )}
          >
            <User
              className={cn(
                "size-5 shrink-0",
                sellerType === "individual" ? "text-primary" : "text-muted-foreground"
              )}
              aria-hidden="true"
            />
            <span>
              <span className="block text-sm font-medium">Pessoa física</span>
              <span className="block text-xs text-muted-foreground">Sem CNPJ, sem burocracia</span>
            </span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={sellerType === "company"}
            onClick={() => pickSellerType("company")}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              sellerType === "company"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "hover:border-muted-foreground/40"
            )}
          >
            <Building2
              className={cn(
                "size-5 shrink-0",
                sellerType === "company" ? "text-primary" : "text-muted-foreground"
              )}
              aria-hidden="true"
            />
            <span>
              <span className="block text-sm font-medium">Empresa</span>
              <span className="block text-xs text-muted-foreground">CNPJ preenche tudo pra você</span>
            </span>
          </button>
        </div>
      </div>

      {sellerType === "company" && (
      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ (opcional)</Label>
        <div className="flex gap-2">
          <Input
            id="cnpj"
            inputMode="numeric"
            placeholder="00.000.000/0000-00"
            aria-invalid={!!errors.cnpj}
            aria-describedby={errors.cnpj ? "cnpj-error" : "cnpj-hint"}
            {...register("cnpj")}
            onChange={handleCNPJChange}
            onBlur={runLookup}
          />
          <Button
            type="button"
            variant="outline"
            onClick={runLookup}
            disabled={cnpjLookup.status === "loading"}
            aria-label="Buscar dados do CNPJ na Receita"
          >
            {cnpjLookup.status === "loading" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
        {errors.cnpj ? (
          <p id="cnpj-error" role="alert" className="text-sm text-destructive">
            {errors.cnpj.message}
          </p>
        ) : cnpjLookup.status === "hit" ? (
          <p className="flex items-center gap-1.5 text-xs text-emerald-600" role="status">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {cnpjLookup.companyName} — endereço e contato preenchidos automaticamente
          </p>
        ) : cnpjLookup.status === "miss" ? (
          <p className="text-xs text-muted-foreground" role="status">
            CNPJ não encontrado na Receita — preencha os dados manualmente.
          </p>
        ) : (
          <p id="cnpj-hint" className="text-xs text-muted-foreground">
            Com o CNPJ, preenchemos endereço e contato pra você. Sem CNPJ? Sem problema.
          </p>
        )}
      </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="storeName">
          Nome da loja <span aria-hidden="true" className="text-destructive">*</span>
        </Label>
        <Input
          id="storeName"
          placeholder="Minha Loja"
          autoComplete="organization"
          aria-required="true"
          aria-invalid={!!errors.storeName}
          aria-describedby={errors.storeName ? "storeName-error" : undefined}
          {...register("storeName")}
        />
        {errors.storeName && (
          <p id="storeName-error" role="alert" className="text-sm text-destructive">
            {errors.storeName.message}
          </p>
        )}
      </div>

      {storeSlug && (
        <div
          className="flex items-center gap-1 rounded-lg border bg-muted/40 px-3 py-2.5"
          aria-live="polite"
        >
          <span className="text-sm text-muted-foreground">livecart.com/</span>
          <span className="text-sm font-semibold text-foreground">{storeSlug}</span>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar
        </Button>
        <Button type="submit" className="flex-1" disabled={!storeSlug}>
          Avançar
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </form>
  )
}
