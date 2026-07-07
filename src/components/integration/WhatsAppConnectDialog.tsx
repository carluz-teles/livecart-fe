"use client"

import { useMemo, useState } from "react"
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  Smartphone,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  useConnectWhatsApp,
  useSendWhatsAppTest,
  useUpdateWhatsAppRecoverySettings,
  useVerifyWhatsApp,
  useWhatsAppRecoverySettings,
  useWhatsAppRecoveryStats,
  useWhatsAppStatus,
} from "@/hooks/integration"
import { formatCurrency } from "@/lib/format"
import type { ApiError, WhatsAppStatus } from "@/types"

interface WhatsAppConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "phone" | "otp" | "done"

function stepFromStatus(status: WhatsAppStatus | null | undefined): Step {
  if (!status) return "phone"
  switch (status.senderStatus) {
    case "ONLINE":
      return "done"
    case "PENDING_VERIFICATION":
    case "VERIFYING":
      return "otp"
    default:
      // NOT_REGISTERED / CREATING / erro de registro — volta pro passo 1,
      // que também funciona como "tentar novamente" (connect é resumível).
      return "phone"
  }
}

// Normaliza "11 99999-9999" → "+5511999999999" (assume BR quando sem DDI).
function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (raw.trim().startsWith("+")) return "+" + digits
  if (digits.length === 10 || digits.length === 11) return "+55" + digits
  return "+" + digits
}

const templateBadge: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  approved: { label: "Template aprovado", variant: "default" },
  pending: { label: "Template em análise", variant: "secondary" },
  received: { label: "Template em análise", variant: "secondary" },
  rejected: { label: "Template rejeitado", variant: "destructive" },
  missing: { label: "Template pendente", variant: "outline" },
}

export function WhatsAppConnectDialog({ open, onOpenChange }: WhatsAppConnectDialogProps) {
  const [phone, setPhone] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [code, setCode] = useState("")
  const [testPhone, setTestPhone] = useState("")
  const [error, setError] = useState<string | null>(null)

  const { data: status, isLoading } = useWhatsAppStatus({
    enabled: open,
    // Enquanto o número não está ONLINE o estado muda do lado da Twilio/Meta;
    // poll leve para o wizard avançar sozinho.
    refetchInterval: open ? 8000 : undefined,
  })

  const connect = useConnectWhatsApp()
  const verify = useVerifyWhatsApp()
  const test = useSendWhatsAppTest()

  const isOnline = status?.senderStatus === "ONLINE"
  const { data: recovery } = useWhatsAppRecoverySettings({ enabled: open && isOnline })
  const { data: stats } = useWhatsAppRecoveryStats({ enabled: open && isOnline })
  const updateRecovery = useUpdateWhatsAppRecoverySettings()

  const handleToggleRecovery = (enabled: boolean) => {
    updateRecovery.mutate(
      {
        enabled,
        delay_minutes: recovery?.delay_minutes ?? 30,
        max_attempts: recovery?.max_attempts ?? 1,
        quiet_hours_start: recovery?.quiet_hours_start ?? 21,
        quiet_hours_end: recovery?.quiet_hours_end ?? 8,
        recover_ended_events: recovery?.recover_ended_events ?? true,
        template: recovery?.template ?? "",
      },
      {
        onSuccess: () =>
          toast.success(enabled ? "Recuperação automática ativada!" : "Recuperação automática desativada."),
        onError: () => toast.error("Falha ao salvar. Tente novamente."),
      }
    )
  }

  const step = useMemo(() => stepFromStatus(status), [status])

  const handleConnect = () => {
    setError(null)
    connect.mutate(
      { phoneNumber: toE164(phone), displayName: displayName.trim() || undefined },
      {
        onSuccess: (s) => {
          if (s.senderStatus === "PENDING_VERIFICATION" || s.senderStatus === "VERIFYING") {
            toast.success("Código enviado! Confira o SMS no número informado.")
          } else if (s.senderStatus === "NOT_REGISTERED") {
            setError(
              "Número salvo, mas o registro na Meta ainda não pôde ser iniciado. Tente novamente em instantes."
            )
          }
        },
        onError: (err) =>
          setError((err as unknown as ApiError)?.message || "Falha ao conectar. Tente novamente."),
      }
    )
  }

  const handleVerify = () => {
    setError(null)
    verify.mutate(code.trim(), {
      onSuccess: (s) => {
        if (s.senderStatus === "ONLINE") {
          toast.success("WhatsApp conectado! Seu número está pronto pra enviar.")
        }
      },
      onError: (err) =>
        setError((err as unknown as ApiError)?.message || "Código inválido. Confira e tente de novo."),
    })
  }

  const handleTest = () => {
    setError(null)
    test.mutate(toE164(testPhone), {
      onSuccess: () => toast.success("Mensagem de teste enviada! Confira o WhatsApp."),
      onError: (err) =>
        setError(
          (err as unknown as ApiError)?.message ||
            "Falha ao enviar teste. O template precisa estar aprovado."
        ),
    })
  }

  const tpl = templateBadge[status?.templateStatus ?? "missing"] ?? templateBadge.missing

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Conectar WhatsApp
          </DialogTitle>
          <DialogDescription>
            Use o seu próprio número pra recuperar carrinhos e enviar lembretes.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : step === "phone" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wa-phone">Número do WhatsApp da loja</Label>
              <Input
                id="wa-phone"
                placeholder="+55 11 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Você recebe um código por SMS nesse número pra confirmar a posse.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wa-name">Nome da loja (perfil do WhatsApp)</Label>
              <Input
                id="wa-name"
                placeholder="Minha Loja"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              className="w-full"
              onClick={handleConnect}
              disabled={connect.isPending || phone.replace(/\D/g, "").length < 10}
            >
              {connect.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Smartphone className="h-4 w-4" />
              )}
              {status ? "Tentar novamente" : "Conectar número"}
            </Button>
          </div>
        ) : step === "otp" ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              Enviamos um código por SMS para{" "}
              <span className="font-medium">{status?.phoneNumber}</span>. Digite abaixo pra
              ativar o número.
            </div>
            <div className="space-y-2">
              <Label htmlFor="wa-code">Código de verificação</Label>
              <Input
                id="wa-code"
                placeholder="123456"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              className="w-full"
              onClick={handleVerify}
              disabled={verify.isPending || code.trim().length < 4}
            >
              {verify.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              Confirmar código
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleConnect}
              disabled={connect.isPending}
            >
              <RefreshCw className="h-4 w-4" />
              Reenviar código
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                <span className="font-semibold">{status?.phoneNumber}</span> conectado e
                pronto pra enviar.
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={tpl.variant}>{tpl.label}</Badge>
              {status?.qualityRating && status.qualityRating !== "UNKNOWN" && (
                <Badge variant="outline">Qualidade: {status.qualityRating}</Badge>
              )}
            </div>
            {status?.templateStatus === "rejected" && status.templateReason && (
              <p className="text-xs text-destructive">Motivo: {status.templateReason}</p>
            )}

            <div className="space-y-2">
              <Label htmlFor="wa-test">Enviar mensagem de teste para</Label>
              <div className="flex gap-2">
                <Input
                  id="wa-test"
                  placeholder="+55 11 99999-9999"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
                <Button
                  onClick={handleTest}
                  disabled={test.isPending || testPhone.replace(/\D/g, "").length < 10}
                >
                  {test.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Envia o template de recuperação com dados de exemplo (precisa estar
                aprovado pela Meta).
              </p>
            </div>

            {/* Recuperação automática (PRD 006 sprint 4) */}
            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Recuperação automática de carrinho</p>
                  <p className="text-xs text-muted-foreground">
                    Envia o link {recovery?.delay_minutes ?? 30} min após o carrinho expirar sem pagamento
                  </p>
                </div>
                <Switch
                  checked={recovery?.enabled ?? false}
                  onCheckedChange={handleToggleRecovery}
                  disabled={updateRecovery.isPending}
                />
              </div>

              {stats && (
                <div className="grid grid-cols-3 gap-2 border-t pt-3 text-center">
                  <div>
                    <p className="text-lg font-bold">{stats.messagesSent}</p>
                    <p className="text-[11px] text-muted-foreground">Mensagens (30d)</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{stats.cartsRecovered}</p>
                    <p className="text-[11px] text-muted-foreground">Recuperados</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-600">
                      {formatCurrency(stats.revenueRecoveredCents)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Receita</p>
                  </div>
                </div>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
