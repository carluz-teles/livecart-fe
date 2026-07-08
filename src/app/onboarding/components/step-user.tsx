"use client"

import { useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Camera, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useProfileSetup } from "@/hooks/onboarding"
import { wizardUserSchema, type WizardUserData } from "@/schemas/onboarding.schema"

interface StepUserProps {
  onNext: (data: WizardUserData) => void
}

// Passo 1 — Sobre você. Renderização pura: toda a lógica de perfil (Clerk,
// upload, salvamento) vive no useProfileSetup.
export function StepUser({ onNext }: StepUserProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const { imageUrl, initials, defaults, saveName, uploadAvatar, isSavingName, isUploadingAvatar } =
    useProfileSetup()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WizardUserData>({
    resolver: zodResolver(wizardUserSchema),
    defaultValues: defaults,
  })

  const onSubmit = async (data: WizardUserData) => {
    if (await saveName(data)) onNext(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isUploadingAvatar}
          aria-label="Enviar foto de perfil (opcional)"
          className="group relative rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar className="size-20 border-2 border-border">
            <AvatarImage src={imageUrl} alt="" />
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 flex size-7 items-center justify-center rounded-full border bg-card shadow-sm transition-colors group-hover:bg-accent">
            {isUploadingAvatar ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Camera className="size-3.5" aria-hidden="true" />
            )}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadAvatar(file)
          }}
          tabIndex={-1}
        />
        <p className="text-xs text-muted-foreground">Foto opcional — clique pra enviar</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            Nome <span aria-hidden="true" className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            autoFocus
            autoComplete="given-name"
            placeholder="Maria"
            aria-required="true"
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
            {...register("firstName")}
          />
          {errors.firstName && (
            <p id="firstName-error" role="alert" className="text-sm text-destructive">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">
            Sobrenome <span aria-hidden="true" className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            autoComplete="family-name"
            placeholder="Silva"
            aria-required="true"
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
            {...register("lastName")}
          />
          {errors.lastName && (
            <p id="lastName-error" role="alert" className="text-sm text-destructive">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Seu nome aparece nos convites de equipe e no painel da loja.
      </p>

      <Button type="submit" className="w-full" disabled={isSavingName}>
        {isSavingName && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        Avançar
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </form>
  )
}
