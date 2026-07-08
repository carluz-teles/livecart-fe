"use client"

import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, Loader2, Search, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
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
    defaultValues: { storeName: "", cnpj: "", ...defaultValues },
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

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("cnpj", formatCNPJ(e.target.value))
    cnpjLookup.reset()
  }

  const runLookup = () => cnpjLookup.run(getValues("cnpj") ?? "")

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5" noValidate>
      {/* CNPJ primeiro: é ele que preenche o resto */}
      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ (opcional)</Label>
        <div className="flex gap-2">
          <Input
            id="cnpj"
            autoFocus
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
