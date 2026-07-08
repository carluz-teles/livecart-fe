"use client"

import { useUser } from "@clerk/nextjs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatPhoneBR } from "@/lib/br-format"
import { wizardContactSchema, type WizardContactData } from "@/schemas/onboarding.schema"

interface StepContactProps {
  defaultValues?: Partial<WizardContactData>
  onSubmit: (data: WizardContactData) => void
  onBack: () => void
  isSubmitting?: boolean
}

// Passo 4 — Contato da loja. Opcional de verdade: dá pra pular. E-mail vem
// pré-preenchido do Clerk; WhatsApp/telefone pode ter vindo do CNPJ.
export function StepContact({ defaultValues, onSubmit, onBack, isSubmitting }: StepContactProps) {
  const { user } = useUser()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<WizardContactData>({
    resolver: zodResolver(wizardContactSchema),
    defaultValues: {
      whatsappNumber: "",
      emailAddress: user?.primaryEmailAddress?.emailAddress ?? "",
      ...defaultValues,
    },
  })

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("whatsappNumber", formatPhoneBR(e.target.value))
  }

  const submitEmpty = () => onSubmit({ whatsappNumber: "", emailAddress: "" })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="whatsappNumber">WhatsApp da loja</Label>
        <Input
          id="whatsappNumber"
          autoFocus
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="(11) 99999-9999"
          aria-describedby="whatsapp-hint"
          {...register("whatsappNumber")}
          onChange={handlePhoneChange}
        />
        <p id="whatsapp-hint" className="text-xs text-muted-foreground">
          Usado nas mensagens e na recuperação de carrinho — dá pra configurar depois.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="emailAddress">E-mail da loja</Label>
        <Input
          id="emailAddress"
          type="email"
          autoComplete="email"
          placeholder="contato@minhaloja.com"
          aria-invalid={!!errors.emailAddress}
          aria-describedby={errors.emailAddress ? "email-error" : undefined}
          {...register("emailAddress")}
        />
        {errors.emailAddress && (
          <p id="email-error" role="alert" className="text-sm text-destructive">
            {errors.emailAddress.message}
          </p>
        )}
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <p className="flex items-center gap-2 text-sm text-foreground">
          <Sparkles className="size-4 shrink-0 text-primary" aria-hidden="true" />
          Ao criar a loja, seus <strong>7 dias grátis</strong> começam — todos os recursos, sem cartão.
        </p>
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1" disabled={isSubmitting}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Criando loja…
            </>
          ) : (
            "Criar loja e começar ✨"
          )}
        </Button>
      </div>

      <button
        type="button"
        onClick={submitEmpty}
        disabled={isSubmitting}
        className="mx-auto block text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Pular contato e criar a loja
      </button>
    </form>
  )
}
