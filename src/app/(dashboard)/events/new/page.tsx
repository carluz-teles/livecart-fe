"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, Loader2, Radio, Layers, Zap, Clock } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useCreateEvent } from "@/hooks/event"
import type { EventType, Platform, CreateEventPayload } from "@/types/event.types"

// =============================================================================
// TYPES
// =============================================================================

interface FormData {
  type: EventType | null
  title: string
  connectNow: boolean | null
  platform: Platform | null
  platformLiveId: string
}

const initialFormData: FormData = {
  type: null,
  title: "",
  connectNow: null,
  platform: null,
  platformLiveId: "",
}

// =============================================================================
// STEP COMPONENTS
// =============================================================================

// Step 1: Event Type Selection
function StepEventType({
  value,
  onChange,
}: {
  value: EventType | null
  onChange: (type: EventType) => void
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Escolha o tipo de evento</h1>
        <p className="mt-2 text-muted-foreground">
          Selecione como deseja gerenciar suas transmissoes
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Single Event */}
        <button
          type="button"
          onClick={() => onChange("single")}
          className={cn(
            "group relative flex flex-col rounded-xl border-2 p-6 text-left transition-all hover:border-primary/50 hover:bg-accent/50",
            value === "single"
              ? "border-primary bg-primary/5"
              : "border-border"
          )}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Radio className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Live Unica</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Ideal para transmissoes simples. O evento encerra automaticamente quando a live termina.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Configuracao rapida
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Carrinhos finalizados automaticamente
            </li>
          </ul>
          {value === "single" && (
            <div className="absolute right-4 top-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          )}
        </button>

        {/* Multi Event */}
        <button
          type="button"
          onClick={() => onChange("multi")}
          className={cn(
            "group relative flex flex-col rounded-xl border-2 p-6 text-left transition-all hover:border-primary/50 hover:bg-accent/50",
            value === "multi"
              ? "border-primary bg-primary/5"
              : "border-border"
          )}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Layers className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Evento Multi-sessao</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Para eventos com multiplas lives ou quando voce precisa reconectar apos uma queda.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Suporte a reconexao (crash recovery)
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Multiplas sessoes no mesmo evento
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Carrinhos acumulados entre sessoes
            </li>
          </ul>
          {value === "multi" && (
            <div className="absolute right-4 top-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

// Step 2: Event Details
function StepEventDetails({
  value,
  onChange,
}: {
  value: string
  onChange: (title: string) => void
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Detalhes do evento</h1>
        <p className="mt-2 text-muted-foreground">
          De um nome para identificar seu evento
        </p>
      </div>

      <div className="mx-auto max-w-md space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titulo do evento</Label>
          <Input
            id="title"
            placeholder="Ex: Live de Sabado, Promocao Black Friday..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-lg"
            autoFocus
          />
          <p className="text-sm text-muted-foreground">
            Este nome ajuda a identificar o evento na lista e nos relatorios.
          </p>
        </div>
      </div>
    </div>
  )
}

// Step 3: Connect Now Choice
function StepConnectChoice({
  value,
  onChange,
}: {
  value: boolean | null
  onChange: (connectNow: boolean) => void
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Conectar agora?</h1>
        <p className="mt-2 text-muted-foreground">
          Voce pode conectar a uma live agora ou fazer isso depois
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Connect Now */}
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "group relative flex flex-col rounded-xl border-2 p-6 text-left transition-all hover:border-primary/50 hover:bg-accent/50",
            value === true
              ? "border-primary bg-primary/5"
              : "border-border"
          )}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Conectar agora</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Minha live ja esta rolando ou vai comecar em instantes. Quero conectar ja!
          </p>
          {value === true && (
            <div className="absolute right-4 top-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          )}
        </button>

        {/* Connect Later */}
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "group relative flex flex-col rounded-xl border-2 p-6 text-left transition-all hover:border-primary/50 hover:bg-accent/50",
            value === false
              ? "border-primary bg-primary/5"
              : "border-border"
          )}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Conectar depois</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Quero criar o evento agora mas vou fazer a live em outro momento.
          </p>
          {value === false && (
            <div className="absolute right-4 top-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

// Step 4: Platform Connection (only if connectNow === true)
function StepPlatformConnection({
  platform,
  platformLiveId,
  onPlatformChange,
  onPlatformLiveIdChange,
}: {
  platform: Platform | null
  platformLiveId: string
  onPlatformChange: (platform: Platform) => void
  onPlatformLiveIdChange: (id: string) => void
}) {
  const platforms: { value: Platform; label: string; placeholder: string; description: string }[] = [
    {
      value: "instagram",
      label: "Instagram",
      placeholder: "Ex: 17841400000000000",
      description: "ID da live do Instagram",
    },
    {
      value: "facebook",
      label: "Facebook",
      placeholder: "Ex: 1234567890",
      description: "ID do video ao vivo do Facebook",
    },
    {
      value: "youtube",
      label: "YouTube",
      placeholder: "Ex: dQw4w9WgXcQ",
      description: "ID do video do YouTube",
    },
    {
      value: "tiktok",
      label: "TikTok",
      placeholder: "Ex: 7000000000000000000",
      description: "ID da live do TikTok",
    },
  ]

  const selectedPlatform = platforms.find((p) => p.value === platform)

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Conectar a plataforma</h1>
        <p className="mt-2 text-muted-foreground">
          Selecione a plataforma e insira o ID da live
        </p>
      </div>

      <div className="mx-auto max-w-md space-y-6">
        <div className="space-y-2">
          <Label>Plataforma</Label>
          <div className="grid grid-cols-2 gap-2">
            {platforms.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => onPlatformChange(p.value)}
                className={cn(
                  "rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all hover:border-primary/50",
                  platform === p.value
                    ? "border-primary bg-primary/5"
                    : "border-border"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {platform && (
          <div className="space-y-2">
            <Label htmlFor="platformLiveId">ID da Live</Label>
            <Input
              id="platformLiveId"
              placeholder={selectedPlatform?.placeholder}
              value={platformLiveId}
              onChange={(e) => onPlatformLiveIdChange(e.target.value)}
              className="text-lg"
              autoFocus
            />
            <p className="text-sm text-muted-foreground">
              {selectedPlatform?.description}
            </p>
          </div>
        )}

        {platform && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Importante:</strong> Certifique-se de que a live esta ativa
              antes de conectar. O sistema comecara a monitorar os comentarios
              imediatamente apos a conexao.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function NewEventPage() {
  const router = useRouter()
  const createEvent = useCreateEvent()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)

  // Calculate total steps based on connect choice
  const totalSteps = formData.connectNow === true ? 4 : 3

  // Check if current step is valid
  function isStepValid(): boolean {
    switch (step) {
      case 1:
        return formData.type !== null
      case 2:
        return formData.title.trim().length > 0
      case 3:
        return formData.connectNow !== null
      case 4:
        return formData.platform !== null && formData.platformLiveId.trim().length > 0
      default:
        return false
    }
  }

  // Check if we're at the final step
  function isFinalStep(): boolean {
    if (formData.connectNow === false && step === 3) return true
    if (formData.connectNow === true && step === 4) return true
    return false
  }

  // Go to next step or submit
  function handleNext() {
    if (isFinalStep()) {
      handleSubmit()
    } else {
      setStep((s) => s + 1)
    }
  }

  // Go to previous step
  function handleBack() {
    if (step === 1) {
      router.push("/events")
    } else {
      setStep((s) => s - 1)
    }
  }

  // Submit the form
  function handleSubmit() {
    const payload: CreateEventPayload = {
      title: formData.title,
      type: formData.type || undefined,
    }

    // Only include platform info if connecting now
    if (formData.connectNow && formData.platform && formData.platformLiveId) {
      payload.platform = formData.platform
      payload.platformLiveId = formData.platformLiveId
    }

    createEvent.mutate(payload, {
      onSuccess: () => {
        toast.success("Evento criado com sucesso!", {
          description: formData.connectNow
            ? "Seu evento esta conectado e pronto para capturar pedidos."
            : "Voce pode conectar a uma live a qualquer momento.",
        })
        router.push("/events")
      },
      onError: (error) => {
        toast.error("Erro ao criar evento", {
          description: error.message || "Tente novamente mais tarde.",
        })
      },
    })
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Progress indicator */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 w-8 rounded-full transition-colors",
                  i + 1 <= step ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>

          <div className="w-20 text-right text-sm text-muted-foreground">
            {step} de {totalSteps}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {step === 1 && (
            <StepEventType
              value={formData.type}
              onChange={(type) => setFormData((f) => ({ ...f, type }))}
            />
          )}

          {step === 2 && (
            <StepEventDetails
              value={formData.title}
              onChange={(title) => setFormData((f) => ({ ...f, title }))}
            />
          )}

          {step === 3 && (
            <StepConnectChoice
              value={formData.connectNow}
              onChange={(connectNow) => setFormData((f) => ({ ...f, connectNow }))}
            />
          )}

          {step === 4 && (
            <StepPlatformConnection
              platform={formData.platform}
              platformLiveId={formData.platformLiveId}
              onPlatformChange={(platform) => setFormData((f) => ({ ...f, platform }))}
              onPlatformLiveIdChange={(platformLiveId) =>
                setFormData((f) => ({ ...f, platformLiveId }))
              }
            />
          )}
        </div>
      </div>

      {/* Footer with actions */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-end gap-4">
          <Button
            size="lg"
            disabled={!isStepValid() || createEvent.isPending}
            onClick={handleNext}
          >
            {createEvent.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : isFinalStep() ? (
              <>
                Criar Evento
                <Check className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
