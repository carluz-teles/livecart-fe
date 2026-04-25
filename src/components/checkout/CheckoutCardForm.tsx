"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2, CreditCard, AlertCircle } from "lucide-react"
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { checkoutService } from "@/services/api"
import { getCheckoutErrorMessage } from "@/lib/checkout-errors"
import type {
  PaymentProvider,
  ProcessCardPaymentResponse,
  CheckoutCustomerInfo,
} from "@/types"

// Mercado Pago SDK form data type
interface MercadoPagoFormData {
  token: string
  installments?: number
  payment_method_id?: string
  issuer_id?: string
}

interface CheckoutCardFormProps {
  token: string
  provider: PaymentProvider
  publicKey: string
  amount: number
  customer: CheckoutCustomerInfo
  onSuccess: (result: ProcessCardPaymentResponse) => void
  onError: (error: string) => void
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
}

export function CheckoutCardForm({
  token,
  provider,
  publicKey,
  amount,
  customer,
  onSuccess,
  onError,
}: CheckoutCardFormProps) {
  const [loading, setLoading] = useState(false)
  const [mpInitialized, setMpInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // The Mercado Pago Brick re-initializes the iframe every time `initialization`
  // or `customization` get a new reference, so memoize them. Without this,
  // every parent re-render (e.g. after the cart refetches on shipping change)
  // remounts the brick and the card form flickers in and out.
  const mpInitialization = useMemo(
    () => ({ amount: amount / 100, payer: { email: customer.email } }),
    [amount, customer.email]
  )
  const mpCustomization = useMemo(
    () => ({
      paymentMethods: { maxInstallments: 12 },
      visual: { style: { theme: "default" as const } },
    }),
    []
  )

  // Pagar.me form state (card data only — customer info comes from props)
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [installments, setInstallments] = useState("1")

  useEffect(() => {
    if (provider === "mercado_pago" && publicKey) {
      try {
        initMercadoPago(publicKey, { locale: "pt-BR" })
        setMpInitialized(true)
      } catch (err) {
        console.error("Failed to initialize Mercado Pago:", err)
        setError("Erro ao inicializar o pagamento. Tente novamente.")
      }
    }
  }, [provider, publicKey])

  const handleMercadoPagoSubmit = async (formData: MercadoPagoFormData) => {
    setLoading(true)
    setError(null)

    try {
      const result = await checkoutService.processCardPayment(token, {
        ...customer,
        token: formData.token,
        installments: formData.installments || 1,
        paymentMethodId: formData.payment_method_id,
        issuerId: formData.issuer_id,
      })

      if (result.status === "approved") {
        onSuccess(result)
      } else if (result.status === "rejected") {
        setError(result.message || "Pagamento recusado. Verifique os dados do cartão.")
      } else {
        onSuccess(result)
      }
    } catch (err: unknown) {
      const message = getCheckoutErrorMessage(err)
      setError(message)
      onError(message)
    } finally {
      setLoading(false)
    }
  }

  const handlePagarmeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const [expMonth, expYear] = cardExpiry.split("/")

      const tokenResponse = await fetch("https://api.pagar.me/core/v5/tokens?appId=" + publicKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "card",
          card: {
            number: cardNumber.replace(/\s/g, ""),
            holder_name: cardName || customer.customerName,
            exp_month: parseInt(expMonth),
            exp_year: parseInt(expYear.length === 2 ? "20" + expYear : expYear),
            cvv: cardCvv,
          },
        }),
      })

      if (!tokenResponse.ok) {
        throw new Error("Erro ao validar dados do cartão")
      }

      const tokenData = await tokenResponse.json()

      const result = await checkoutService.processCardPayment(token, {
        ...customer,
        token: tokenData.id,
        installments: parseInt(installments),
      })

      if (result.status === "approved") {
        onSuccess(result)
      } else if (result.status === "rejected") {
        setError(result.message || "Pagamento recusado. Verifique os dados do cartão.")
      } else {
        onSuccess(result)
      }
    } catch (err: unknown) {
      const message = getCheckoutErrorMessage(err)
      setError(message)
      onError(message)
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(" ") : value
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  if (provider === "mercado_pago") {
    if (!mpInitialized) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <CardPayment
          initialization={mpInitialization}
          onSubmit={handleMercadoPagoSubmit}
          onError={(err) => {
            console.error("MP Card Error:", err)
            setError("Erro ao processar cartão. Verifique os dados.")
          }}
          customization={mpCustomization}
        />
      </div>
    )
  }

  return (
    <form onSubmit={handlePagarmeSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="cardNumber">Número do Cartão</Label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="cardNumber"
            type="text"
            placeholder="0000 0000 0000 0000"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            className="pl-10"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardName">Nome no Cartão</Label>
        <Input
          id="cardName"
          type="text"
          placeholder="Como está no cartão"
          value={cardName}
          onChange={(e) => setCardName(e.target.value.toUpperCase())}
          required
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cardExpiry">Validade</Label>
          <Input
            id="cardExpiry"
            type="text"
            placeholder="MM/AA"
            value={cardExpiry}
            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
            maxLength={5}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cardCvv">CVV</Label>
          <Input
            id="cardCvv"
            type="text"
            placeholder="123"
            value={cardCvv}
            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
            maxLength={4}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="installments">Parcelas</Label>
        <Select value={installments} onValueChange={setInstallments} disabled={loading}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
              <SelectItem key={n} value={n.toString()}>
                {n}x de {formatCurrency(Math.ceil(amount / n))} {n === 1 ? "à vista" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          <>Pagar {formatCurrency(amount)}</>
        )}
      </Button>
    </form>
  )
}
