"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Copy, Check, Clock, QrCode, AlertCircle } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { checkoutService } from "@/services/api"
import type { GeneratePixResponse } from "@/types"

interface CheckoutPixDisplayProps {
  token: string
  email: string
  customerName?: string
  onSuccess: () => void
  onError: (error: string) => void
}

// Format currency in BRL
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
}

// Format time remaining
function formatTimeRemaining(expiresAt: Date): string {
  const now = new Date()
  const diff = expiresAt.getTime() - now.getTime()

  if (diff <= 0) return "Expirado"

  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

export function CheckoutPixDisplay({
  token,
  email,
  customerName,
  onSuccess,
  onError,
}: CheckoutPixDisplayProps) {
  const [loading, setLoading] = useState(true)
  const [pixData, setPixData] = useState<GeneratePixResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState("")
  const [expired, setExpired] = useState(false)

  // Generate PIX
  const generatePix = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await checkoutService.generatePix(token, {
        email,
        customerName,
      })
      setPixData(result)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao gerar PIX"
      setError(message)
      onError(message)
    } finally {
      setLoading(false)
    }
  }, [token, email, customerName, onError])

  // Generate PIX on mount
  useEffect(() => {
    generatePix()
  }, [generatePix])

  // Update countdown timer
  useEffect(() => {
    if (!pixData?.expiresAt) return

    const expiresAt = new Date(pixData.expiresAt)

    const updateTimer = () => {
      const now = new Date()
      if (now >= expiresAt) {
        setExpired(true)
        setTimeRemaining("Expirado")
        return
      }
      setTimeRemaining(formatTimeRemaining(expiresAt))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [pixData?.expiresAt])

  // Poll for payment status
  useEffect(() => {
    if (!pixData || expired) return

    const pollStatus = async () => {
      try {
        const status = await checkoutService.getPaymentStatus(token)
        if (status.paymentStatus === "paid") {
          onSuccess()
        }
      } catch (err) {
        console.error("Error polling status:", err)
      }
    }

    // Poll every 5 seconds
    const interval = setInterval(pollStatus, 5000)

    return () => clearInterval(interval)
  }, [pixData, token, expired, onSuccess])

  // Copy PIX code to clipboard
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

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Gerando código PIX...</p>
      </div>
    )
  }

  // Error state
  if (error || !pixData) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="mt-4 text-sm text-destructive">{error || "Erro ao gerar PIX"}</p>
        <Button variant="outline" className="mt-4" onClick={generatePix}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  // Expired state
  if (expired) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Clock className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">PIX Expirado</h3>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          O código PIX expirou. Clique abaixo para gerar um novo.
        </p>
        <Button className="mt-4" onClick={generatePix}>
          Gerar novo PIX
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Timer */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Expira em</span>
        <span className="font-mono font-medium">{timeRemaining}</span>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center">
        <div className="rounded-lg border-2 border-primary/20 bg-white p-4">
          {pixData.qrCode ? (
            pixData.qrCode.startsWith("data:") ? (
              // Base64 image
              <img
                src={pixData.qrCode}
                alt="QR Code PIX"
                className="h-48 w-48"
              />
            ) : (
              // URL image
              <Image
                src={pixData.qrCode}
                alt="QR Code PIX"
                width={192}
                height={192}
                className="h-48 w-48"
              />
            )
          ) : (
            <div className="flex h-48 w-48 items-center justify-center bg-muted">
              <QrCode className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>
        <p className="mt-2 text-sm font-medium">{formatCurrency(pixData.amount)}</p>
      </div>

      {/* Copy & Paste Code */}
      <div className="space-y-2">
        <Label>Código PIX (copia e cola)</Label>
        <div className="flex gap-2">
          <Input
            value={pixData.qrCodeText}
            readOnly
            className="font-mono text-xs"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="flex-shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-lg bg-muted/50 p-4">
        <h4 className="text-sm font-medium">Como pagar com PIX:</h4>
        <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>1. Abra o app do seu banco</li>
          <li>2. Escolha pagar com PIX</li>
          <li>3. Escaneie o QR Code ou cole o código</li>
          <li>4. Confirme o pagamento</li>
        </ol>
      </div>

      {/* Waiting indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Aguardando confirmação do pagamento...
      </div>
    </div>
  )
}
