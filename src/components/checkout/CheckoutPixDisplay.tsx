"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Loader2,
  Copy,
  Check,
  Clock,
  QrCode,
  AlertCircle,
  ShieldCheck,
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { checkoutService } from "@/services/api"
import { getCheckoutErrorMessage } from "@/lib/checkout-errors"
import type { GeneratePixResponse, CheckoutCustomerInfo } from "@/types"

interface CheckoutPixDisplayProps {
  token: string
  customer: CheckoutCustomerInfo
  /** O total ainda está se formando (item editado, frete recotando). Gerar o
   *  Pix agora congela um valor que já não é o do carrinho — e o Pix, uma vez
   *  gerado, é o que o comprador paga. */
  disabled?: boolean
  /** O total do carrinho AGORA, na conta do próprio checkout.
   *
   *  Guardamos este número no instante da geração e comparamos com o atual: se
   *  o carrinho mudou depois, o QR na tela cobra o valor antigo. A comparação é
   *  do nosso número com o nosso número — comparar com o `amount` que o backend
   *  devolveu arriscaria divergência de arredondamento e um ciclo de gerar
   *  cobrança atrás de cobrança. */
  expectedAmount: number
  onSuccess: () => void
  onError: (error: string) => void
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
}

function formatTimeRemaining(expiresAt: Date): string {
  const diff = expiresAt.getTime() - Date.now()
  if (diff <= 0) return "00:00"
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`
}

// Brand mark for the Pix logo. Inline SVG to avoid yet another image asset on
// the public checkout subdomain.
function PixLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M22.6 22.6a4.4 4.4 0 0 1-3.1-1.3l-4.2-4.2a.8.8 0 0 0-1.2 0l-4.2 4.2a4.4 4.4 0 0 1-3.1 1.3H6l5.3 5.3a4.4 4.4 0 0 0 6.2 0l5.3-5.3h-.2Z"
        fill="#32BCAD"
      />
      <path
        d="M9.4 9.4a4.4 4.4 0 0 1 3.1 1.3l4.2 4.2a.8.8 0 0 0 1.2 0l4.2-4.2a4.4 4.4 0 0 1 3.1-1.3H26L20.7 4.1a4.4 4.4 0 0 0-6.2 0L9.4 9.4h-.2.2Z"
        fill="#32BCAD"
      />
      <path
        d="m27.9 14.3-3.2-3.2h-.7a3 3 0 0 0-2.1.9l-4.2 4.2a2 2 0 0 1-2.8 0l-4.2-4.2a3 3 0 0 0-2.1-.9h-.7l-3.2 3.2a4.4 4.4 0 0 0 0 6.2l3.2 3.2h.7a3 3 0 0 0 2.1-.9l4.2-4.2a2 2 0 0 1 2.8 0l4.2 4.2a3 3 0 0 0 2.1.9h.7l3.2-3.2a4.4 4.4 0 0 0 0-6.2Z"
        fill="#32BCAD"
      />
    </svg>
  )
}

export function CheckoutPixDisplay({
  token,
  customer,
  disabled,
  expectedAmount,
  onSuccess,
  onError,
}: CheckoutPixDisplayProps) {
  const [loading, setLoading] = useState(true)
  const [pixData, setPixData] = useState<GeneratePixResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState("")
  const [expired, setExpired] = useState(false)
  const [urgent, setUrgent] = useState(false)

  // Snapshot customer/onError in a ref so we can re-generate with the latest
  // values without the effect re-firing on every parent render.
  const customerRef = useRef(customer)
  const onErrorRef = useRef(onError)
  useEffect(() => {
    customerRef.current = customer
    onErrorRef.current = onError
  })

  const disabledRef = useRef(disabled)
  disabledRef.current = disabled

  const expectedAmountRef = useRef(expectedAmount)
  expectedAmountRef.current = expectedAmount

  // Quanto valia o carrinho quando este código foi gerado.
  const [generatedForAmount, setGeneratedForAmount] = useState<number | null>(null)

  const generatePix = useCallback(async () => {
    // O Pix congela o valor no instante em que é gerado — é esse número que o
    // comprador paga no app do banco. Gerar enquanto o total ainda se forma
    // (item editado, frete recotando) grava a conta errada num QR code.
    if (disabledRef.current) return
    setLoading(true)
    setError(null)
    setExpired(false)

    try {
      const result = await checkoutService.generatePix(
        token,
        customerRef.current
      )
      setPixData(result)
      setGeneratedForAmount(expectedAmountRef.current)
    } catch (err: unknown) {
      const message = getCheckoutErrorMessage(err, "Erro ao gerar PIX")
      setError(message)
      onErrorRef.current(message)
    } finally {
      setLoading(false)
    }
  }, [token])

  // O Pix nasce sozinho ao montar, então esperar o carrinho assentar antes da
  // primeira geração faz parte do mesmo cuidado — não só os botões de refazer.
  useEffect(() => {
    if (disabled) return
    generatePix()
  }, [disabled, generatePix])

  // Countdown
  useEffect(() => {
    if (!pixData?.expiresAt) return
    const expiresAt = new Date(pixData.expiresAt)

    const tick = () => {
      const diff = expiresAt.getTime() - Date.now()
      if (diff <= 0) {
        setExpired(true)
        setTimeRemaining("00:00")
        return
      }
      // Always normalize back to "active" while the new PIX still has time.
      // Without this, the previous interval can fire one last setExpired(true)
      // between regenerate's setExpired(false) and the new pixData landing,
      // leaving the UI stuck on the expired card.
      setExpired(false)
      // Pulse the timer when under 60s remaining as a soft urgency cue.
      setUrgent(diff < 60_000)
      setTimeRemaining(formatTimeRemaining(expiresAt))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [pixData?.expiresAt])

  // Poll for paid status
  useEffect(() => {
    if (!pixData || expired) return

    const pollStatus = async () => {
      try {
        const status = await checkoutService.getPaymentStatus(token)
        if (status.paymentStatus === "paid") onSuccess()
      } catch (err) {
        console.error("Error polling status:", err)
      }
    }
    const interval = setInterval(pollStatus, 5000)
    return () => clearInterval(interval)
  }, [pixData, token, expired, onSuccess])

  const handleCopy = async () => {
    if (!pixData?.qrCodeText) return
    try {
      await navigator.clipboard.writeText(pixData.qrCodeText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-8">
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Gerando código PIX…</p>
        </div>
      </div>
    )
  }

  // Error
  if (error || !pixData) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200/70 bg-red-50 p-6 text-center">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <p className="text-sm text-red-700">
            {error || "Erro ao gerar o código PIX. Tente novamente."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={generatePix}
            disabled={disabled}
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  // Expired
  if (expired) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-amber-200/60 bg-amber-50/70 p-8 text-center">
          <Clock className="h-7 w-7 text-amber-600" />
          <h3 className="text-base font-semibold text-amber-900">
            PIX expirado
          </h3>
          <p className="max-w-sm text-sm text-amber-800/80">
            Por segurança, o código deixou de ser válido. Gere um novo para
            concluir o pagamento.
          </p>
          <Button onClick={generatePix} disabled={disabled} className="mt-1">
            Gerar novo PIX
          </Button>
        </div>
      </div>
    )
  }

  // Carrinho mudou depois da geração.
  //
  // O QR na tela cobra o valor de antes, e é ele que o app do banco vai pagar.
  // Não regeramos sozinhos de propósito: cada geração abre uma cobrança no
  // gateway, e um erro de comparação viraria uma fila delas. O comprador
  // confirma, e a conta volta a bater.
  if (generatedForAmount !== null && generatedForAmount !== expectedAmount) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-amber-200/60 bg-amber-50/70 p-8 text-center">
          <AlertCircle className="h-7 w-7 text-amber-600" />
          <h3 className="text-base font-semibold text-amber-900">
            Seu carrinho mudou
          </h3>
          <p className="max-w-sm text-sm text-amber-800/80">
            Este código foi gerado para {formatCurrency(generatedForAmount)} e
            seu pedido agora é {formatCurrency(expectedAmount)}. Gere um novo
            para pagar o valor certo.
          </p>
          <Button onClick={generatePix} disabled={disabled} className="mt-1">
            Gerar novo PIX
          </Button>
        </div>
      </div>
    )
  }

  // Active
  // MP returns the QR Code as raw base64 (no `data:` prefix). Normalize so
  // <img> can render it directly without falling into next/image, which
  // expects a URL.
  const rawQr = pixData.qrCode
  const qrSrc = rawQr
    ? rawQr.startsWith("data:") || rawQr.startsWith("http")
      ? rawQr
      : `data:image/png;base64,${rawQr}`
    : ""

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 sm:p-6">
      {/* Header strip */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <PixLogo className="h-5 w-auto" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
            Pagamento via Pix
          </span>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium tabular-nums transition-colors",
            urgent ? "bg-red-50 text-red-700" : "text-gray-600"
          )}
        >
          <Clock
            className={cn(
              "h-3.5 w-3.5",
              urgent ? "text-red-500" : "text-gray-500"
            )}
          />
          <span>{timeRemaining}</span>
        </div>
      </div>

      <div className="space-y-5 pt-5">
        {/* QR + amount block */}
        <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-100 bg-gradient-to-b from-white to-gray-50/60 p-5">
          <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
            {qrSrc ? (
              qrSrc.startsWith("data:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrSrc}
                  alt="QR Code Pix"
                  className="h-44 w-44"
                />
              ) : (
                <Image
                  src={qrSrc}
                  alt="QR Code Pix"
                  width={176}
                  height={176}
                  className="h-44 w-44"
                  unoptimized
                />
              )
            ) : (
              <div className="flex h-44 w-44 items-center justify-center bg-gray-50">
                <QrCode className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-gray-400">
              Valor a pagar
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
              {formatCurrency(pixData.amount)}
            </p>
          </div>
        </div>

        {/* Copy & paste */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Pix copia e cola
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-input bg-white p-1.5 transition-colors focus-within:border-ring/60 focus-within:ring-2 focus-within:ring-ring/30">
            <input
              readOnly
              value={pixData.qrCodeText}
              className="flex-1 truncate bg-transparent px-3 py-2 font-mono text-xs text-gray-700 outline-none"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "flex h-9 flex-shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all duration-150",
                copied
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copiar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Steps */}
        <ol className="space-y-2.5 rounded-xl bg-gray-50/70 p-4">
          {[
            "Abra o app do seu banco",
            "Acesse a área Pix e escolha pagar",
            "Escaneie o QR Code ou cole o código copia-e-cola",
            "Confirme — o pagamento é detectado em segundos",
          ].map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-gray-700"
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-semibold tabular-nums text-gray-700 shadow-sm ring-1 ring-gray-200">
                {i + 1}
              </span>
              <span className="leading-tight">{step}</span>
            </li>
          ))}
        </ol>

        {/* Waiting indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Aguardando confirmação do pagamento…</span>
        </div>

        {/* Trust line */}
        <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-gray-400">
          <ShieldCheck className="h-3 w-3" />
          <span>Pagamento processado pelo seu banco em ambiente seguro</span>
        </div>
      </div>
    </div>
  )
}
