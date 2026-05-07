"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Loader2,
  AlertCircle,
  Lock,
  ShieldCheck,
  HelpCircle,
} from "lucide-react"
import {
  initMercadoPago,
  CardNumber,
  SecurityCode,
  ExpirationDate,
  createCardToken,
  getPaymentMethods,
  getIssuers,
  getInstallments,
} from "@mercadopago/sdk-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { checkoutService } from "@/services/api"
import { getCheckoutErrorMessage } from "@/lib/checkout-errors"
import {
  ACCEPTED_BRANDS,
  BRAND_ICON_MAP,
  GenericCardIcon,
} from "./CardBrandIcons"
import type {
  PaymentProvider,
  ProcessCardPaymentResponse,
  CheckoutCustomerInfo,
} from "@/types"

// ─────────────────────────────────────────────────────────────────────────────
// Public component
// ─────────────────────────────────────────────────────────────────────────────

interface CheckoutCardFormProps {
  token: string
  provider: PaymentProvider
  publicKey: string
  amount: number
  customer: CheckoutCustomerInfo
  onSuccess: (result: ProcessCardPaymentResponse) => void
  onError: (error: string) => void
}

export function CheckoutCardForm(props: CheckoutCardFormProps) {
  if (props.provider === "mercado_pago") {
    return <MercadoPagoCardForm {...props} />
  }
  return <PagarmeCardForm {...props} />
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared utilities & shells
// ─────────────────────────────────────────────────────────────────────────────

// readPagarmeTokenError extracts a friendly PT-BR message from a failed
// /v5/tokens response. Pagar.me v5 returns errors as
// `{ message, errors: { "card.number": ["..."], ... } }` — we surface the
// first field-level message when present, mapping the technical field key
// to a human label so the buyer sees "CVV inválido" not "card.cvv ...".
async function readPagarmeTokenError(response: Response): Promise<string> {
  const fieldLabels: Record<string, string> = {
    "card.number": "Número do cartão",
    "card.holder_name": "Nome no cartão",
    "card.holder_document": "CPF",
    "card.exp_month": "Validade",
    "card.exp_year": "Validade",
    "card.cvv": "CVV",
  }
  try {
    const data = (await response.json()) as {
      message?: string
      errors?: Record<string, string[]>
    }
    if (data.errors) {
      const [field, msgs] = Object.entries(data.errors)[0] ?? []
      if (field && msgs?.[0]) {
        return `${fieldLabels[field] ?? field}: ${msgs[0]}`
      }
    }
    if (data.message) return data.message
  } catch {
    /* fall through */
  }
  if (response.status === 422) return "Verifique os dados do cartão."
  return "Erro ao validar dados do cartão."
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
}

const SECURE_FIELD_STYLE = {
  fontSize: "15px",
  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  color: "#0f172a",
  placeholderColor: "#9ca3af",
}

interface SecureFieldShellProps {
  focused: boolean
  hasError?: boolean
  trailingIcon?: React.ReactNode
  children: React.ReactNode
}

// Visual chrome around an MP Secure Fields iframe — mirrors the shadcn
// `<Input>` look (h-11, rounded-xl, border-input, ring-ring on focus) so the
// Secure Field rows are visually indistinguishable from regular form inputs.
function SecureFieldShell({
  focused,
  hasError,
  trailingIcon,
  children,
}: SecureFieldShellProps) {
  return (
    <div
      className={cn(
        // Match the shadcn `<Input>` focus chrome 1:1 — `border-input` stays
        // put on focus, only the `ring-ring` appears with full opacity. That
        // is what produces the brand-yellow halo across the rest of the form.
        "relative flex h-11 w-full items-center rounded-xl border border-input bg-white px-3 ring-offset-background transition-all duration-150",
        hasError
          ? "border-destructive ring-2 ring-destructive ring-offset-2"
          : focused
            ? "ring-2 ring-ring ring-offset-2"
            : "hover:border-gray-300"
      )}
    >
      {/* `flex-1` makes the iframe wrapper take all remaining space; the
          `[&>div]…` selectors are scoped here (not on the shell) so they
          only stretch MP's `cardNumberSecureField_container` and its iframe,
          never the trailing-icon slot. */}
      <div className="min-w-0 flex-1 [&>div]:h-full [&>div]:w-full [&_iframe]:h-full [&_iframe]:w-full">
        {children}
      </div>
      {trailingIcon ? (
        <div className="ml-2 flex flex-shrink-0 items-center justify-center text-gray-400">
          {trailingIcon}
        </div>
      ) : null}
    </div>
  )
}

function CvvHelpTooltip() {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Onde encontro o CVV?"
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[180px] text-xs">
          3 dígitos no verso do cartão (4 na frente, no Amex).
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface PayButtonProps {
  amount: number
  loading: boolean
  disabled?: boolean
  onClick: () => void
}

// Brand-yellow CTA. `--primary` is the shop's accent (≈ #F5B82E) and
// `--primary-foreground` is the matching ink — using the tokens keeps the
// button consistent with the rest of the dashboard if the theme ever shifts.
function PayButton({ amount, loading, disabled, onClick }: PayButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "mt-2 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl text-[15px] font-semibold transition-all duration-150",
        "bg-primary text-primary-foreground shadow-sm shadow-primary/30",
        "hover:bg-primary/90 active:scale-[0.99]",
        "disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:active:scale-100"
      )}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processando…</span>
        </>
      ) : (
        <>
          <Lock className="h-4 w-4" />
          <span>
            Pagar{" "}
            <span className="tabular-nums">{formatCurrency(amount)}</span>
          </span>
        </>
      )}
    </button>
  )
}

function TrustLine() {
  return (
    <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-gray-400">
      <ShieldCheck className="h-3 w-3" />
      <span>Pagamento criptografado ponta-a-ponta</span>
    </div>
  )
}

interface FormShellProps {
  error: string | null
  children: React.ReactNode
}

// Outer container — matches CheckoutSection chrome (white card with thin
// gray-100 border, no extra shadow because the parent section already has
// `shadow-md shadow-gray-100/80`).
function FormShell({ error, children }: FormShellProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 sm:p-6">
      {error ? (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200/70 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      ) : null}
      {children}
    </div>
  )
}

interface AcceptedBrandsHeaderProps {
  paymentMethodId: string
}

function AcceptedBrandsHeader({ paymentMethodId }: AcceptedBrandsHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
        Cartão de crédito
      </span>
      <div className="flex items-center gap-1.5">
        {ACCEPTED_BRANDS.map(({ id, Icon }) => {
          const isDormant = paymentMethodId === ""
          const isActive = paymentMethodId === id
          return (
            <Icon
              key={id}
              className={cn(
                "h-5 w-auto transition-all duration-300",
                isDormant && "opacity-30 grayscale",
                !isDormant && !isActive && "opacity-15 grayscale",
                isActive && "scale-105 opacity-100"
              )}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Mercado Pago — Checkout Transparente via Secure Fields
// ─────────────────────────────────────────────────────────────────────────────

interface MpIssuerOption {
  id: string
  name: string
}

interface MpInstallmentOption {
  installments: number
  installment_amount: number
  total_amount: number
  recommended_message: string
}

function MercadoPagoCardForm({
  token,
  publicKey,
  amount,
  customer,
  onSuccess,
  onError,
}: CheckoutCardFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mpReady, setMpReady] = useState(false)

  const [bin, setBin] = useState("")
  const [paymentMethodId, setPaymentMethodId] = useState("")
  const [issuers, setIssuers] = useState<MpIssuerOption[]>([])
  const [issuerId, setIssuerId] = useState("")
  const [needsIssuer, setNeedsIssuer] = useState(false)
  const [installmentOptions, setInstallmentOptions] = useState<
    MpInstallmentOption[]
  >([])
  const [selectedInstallments, setSelectedInstallments] = useState(1)
  const [cardholderName, setCardholderName] = useState("")

  const [validity, setValidity] = useState({
    cardNumber: false,
    expirationDate: false,
    securityCode: false,
  })
  const [focused, setFocused] = useState({
    cardNumber: false,
    expirationDate: false,
    securityCode: false,
  })

  // The MP Secure Fields SDK rebuilds its iframe whenever ANY prop reference
  // changes (except `placeholder`/`length`). Inline arrow callbacks would
  // create new references on every parent render and remount the iframes —
  // wiping anything the shopper has typed. Stable refs via useCallback keep
  // the iframes alive across re-renders.
  const handleCardNumberValidity = useCallback(
    (arg: { errorMessages: unknown[] }) =>
      setValidity((v) => ({ ...v, cardNumber: arg.errorMessages.length === 0 })),
    []
  )
  const handleBinChange = useCallback(
    (arg: { bin?: string }) => setBin(arg.bin ?? ""),
    []
  )
  const handleExpValidity = useCallback(
    (arg: { errorMessages: unknown[] }) =>
      setValidity((v) => ({
        ...v,
        expirationDate: arg.errorMessages.length === 0,
      })),
    []
  )
  const handleCvvValidity = useCallback(
    (arg: { errorMessages: unknown[] }) =>
      setValidity((v) => ({
        ...v,
        securityCode: arg.errorMessages.length === 0,
      })),
    []
  )
  const handleCardNumberFocus = useCallback(
    () => setFocused((f) => ({ ...f, cardNumber: true })),
    []
  )
  const handleCardNumberBlur = useCallback(
    () => setFocused((f) => ({ ...f, cardNumber: false })),
    []
  )
  const handleExpFocus = useCallback(
    () => setFocused((f) => ({ ...f, expirationDate: true })),
    []
  )
  const handleExpBlur = useCallback(
    () => setFocused((f) => ({ ...f, expirationDate: false })),
    []
  )
  const handleCvvFocus = useCallback(
    () => setFocused((f) => ({ ...f, securityCode: true })),
    []
  )
  const handleCvvBlur = useCallback(
    () => setFocused((f) => ({ ...f, securityCode: false })),
    []
  )

  useEffect(() => {
    if (!publicKey) return
    try {
      initMercadoPago(publicKey, { locale: "pt-BR" })
      setMpReady(true)
    } catch (err) {
      console.error("Failed to initialize Mercado Pago:", err)
      setError("Erro ao inicializar o pagamento. Tente novamente.")
    }
  }, [publicKey])

  // Resolve brand + (optionally) issuer once we have a valid BIN.
  useEffect(() => {
    if (!bin || bin.length < 6) {
      setPaymentMethodId("")
      setIssuers([])
      setIssuerId("")
      setNeedsIssuer(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const result = await getPaymentMethods({ bin })
        if (cancelled || !result?.results?.length) return
        const method = result.results[0]
        setPaymentMethodId(method.id)
        const requiresIssuer =
          method.additional_info_needed?.includes("issuer_id") ?? false
        setNeedsIssuer(requiresIssuer)
        if (requiresIssuer) {
          const issuersResp = await getIssuers({
            paymentMethodId: method.id,
            bin,
          })
          if (cancelled) return
          const list = (issuersResp ?? []).map((i) => ({
            id: String(i.id),
            name: i.name,
          }))
          setIssuers(list)
          setIssuerId(list[0]?.id ?? "")
        } else {
          setIssuers([])
          setIssuerId("")
        }
      } catch (err) {
        console.error("Failed to fetch payment methods:", err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [bin])

  // Refresh installments whenever brand/amount changes.
  useEffect(() => {
    if (!bin || bin.length < 6 || !paymentMethodId) {
      setInstallmentOptions([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const result = await getInstallments({
          amount: (amount / 100).toFixed(2),
          bin,
          paymentMethodId,
          processingMode: "aggregator",
        })
        if (cancelled || !result?.length) return
        const costs = (result[0].payer_costs ?? []).map((c) => ({
          installments: c.installments,
          installment_amount: c.installment_amount,
          total_amount: c.total_amount,
          recommended_message: c.recommended_message,
        }))
        setInstallmentOptions(costs)
        setSelectedInstallments((prev) =>
          costs.some((c) => c.installments === prev) ? prev : 1
        )
      } catch (err) {
        console.error("Failed to fetch installments:", err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [bin, paymentMethodId, amount])

  const allFieldsValid =
    validity.cardNumber && validity.expirationDate && validity.securityCode
  const canSubmit =
    mpReady &&
    allFieldsValid &&
    cardholderName.trim().length > 0 &&
    Boolean(paymentMethodId) &&
    (!needsIssuer || Boolean(issuerId))

  const handleSubmit = async () => {
    if (!canSubmit || loading) return

    setLoading(true)
    setError(null)

    try {
      const docDigits = customer.customerDocument.replace(/\D/g, "")
      const identificationType = docDigits.length === 14 ? "CNPJ" : "CPF"

      const tokenResp = await createCardToken({
        cardholderName: cardholderName.trim(),
        identificationType,
        identificationNumber: docDigits,
      })

      if (!tokenResp?.id) {
        throw new Error(
          "Não foi possível validar o cartão. Confira os dados e tente novamente."
        )
      }

      const deviceId =
        typeof window !== "undefined"
          ? (window as Window & { MP_DEVICE_SESSION_ID?: string })
              .MP_DEVICE_SESSION_ID
          : undefined

      const result = await checkoutService.processCardPayment(token, {
        ...customer,
        token: tokenResp.id,
        installments: selectedInstallments,
        paymentMethodId,
        issuerId: issuerId || undefined,
        deviceId,
      })

      if (result.status === "rejected") {
        setError(
          result.message ||
            "Pagamento recusado. Verifique os dados do cartão."
        )
        return
      }
      onSuccess(result)
    } catch (err: unknown) {
      const message = getCheckoutErrorMessage(err)
      setError(message)
      onError(message)
    } finally {
      setLoading(false)
    }
  }

  if (!mpReady) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  const ActiveBrandIcon = paymentMethodId
    ? BRAND_ICON_MAP[paymentMethodId] ?? GenericCardIcon
    : GenericCardIcon

  return (
    <FormShell error={error}>
      <AcceptedBrandsHeader paymentMethodId={paymentMethodId} />

      <div className="space-y-4 pt-4">
        {/* Card number */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Número do Cartão
          </Label>
          <SecureFieldShell
            focused={focused.cardNumber}
            trailingIcon={
              <ActiveBrandIcon
                className={cn(
                  "h-5 w-auto transition-opacity duration-300",
                  paymentMethodId ? "opacity-100" : "opacity-50"
                )}
              />
            }
          >
            <CardNumber
              placeholder="0000 0000 0000 0000"
              style={SECURE_FIELD_STYLE}
              onValidityChange={handleCardNumberValidity}
              onBinChange={handleBinChange}
              onFocus={handleCardNumberFocus}
              onBlur={handleCardNumberBlur}
            />
          </SecureFieldShell>
        </div>

        {/* Expiry + CVV */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Validade
            </Label>
            <SecureFieldShell focused={focused.expirationDate}>
              <ExpirationDate
                placeholder="MM/AA"
                mode="short"
                style={SECURE_FIELD_STYLE}
                onValidityChange={handleExpValidity}
                onFocus={handleExpFocus}
                onBlur={handleExpBlur}
              />
            </SecureFieldShell>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              CVV
            </Label>
            <SecureFieldShell
              focused={focused.securityCode}
              trailingIcon={<CvvHelpTooltip />}
            >
              <SecurityCode
                placeholder="123"
                style={SECURE_FIELD_STYLE}
                onValidityChange={handleCvvValidity}
                onFocus={handleCvvFocus}
                onBlur={handleCvvBlur}
              />
            </SecureFieldShell>
          </div>
        </div>

        {/* Cardholder name */}
        <div className="space-y-1.5">
          <Label
            htmlFor="mp-cardholder-name"
            className="text-sm font-medium text-gray-700"
          >
            Nome no Cartão
          </Label>
          <Input
            id="mp-cardholder-name"
            type="text"
            placeholder="Como está no cartão"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
            disabled={loading}
            className="h-11 rounded-xl tracking-wide"
          />
        </div>

        {/* Issuer (only when MP signals additional_info_needed) */}
        {needsIssuer && issuers.length > 0 ? (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Banco emissor
            </Label>
            <Select
              value={issuerId}
              onValueChange={setIssuerId}
              disabled={loading}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Selecione o banco" />
              </SelectTrigger>
              <SelectContent>
                {issuers.map((iss) => (
                  <SelectItem key={iss.id} value={iss.id}>
                    {iss.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {/* Installments */}
        {installmentOptions.length > 0 ? (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Parcelamento
            </Label>
            <Select
              value={String(selectedInstallments)}
              onValueChange={(v) => setSelectedInstallments(Number(v))}
              disabled={loading}
            >
              <SelectTrigger className="h-11 rounded-xl bg-gray-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {installmentOptions.map((opt) => (
                  <SelectItem
                    key={opt.installments}
                    value={String(opt.installments)}
                  >
                    <span className="font-semibold tabular-nums">
                      {opt.installments}×
                    </span>{" "}
                    <span className="tabular-nums">
                      {formatCurrency(
                        Math.round(opt.installment_amount * 100)
                      )}
                    </span>
                    {opt.installments === 1 ? (
                      <span className="text-gray-400"> à vista</span>
                    ) : null}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <PayButton
          amount={amount}
          loading={loading}
          disabled={!canSubmit}
          onClick={handleSubmit}
        />
        <TrustLine />
      </div>
    </FormShell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagar.me — direct tokenization API. Native HTML inputs are required because
// Pagar.me doesn't expose iframe-based fields; PCI scope here is SAQ A-EP and
// is the merchant's responsibility. Same visual chrome as the MP variant so
// the two providers feel like one product.
// ─────────────────────────────────────────────────────────────────────────────

function PagarmeCardForm({
  token,
  publicKey,
  amount,
  customer,
  onSuccess,
  onError,
}: CheckoutCardFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [installments, setInstallments] = useState("1")

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const match = v.match(/\d{4,16}/g)?.[0] ?? ""
    const parts: string[] = []
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(" ") : value
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, "")
    if (v.length >= 2) return v.substring(0, 2) + "/" + v.substring(2, 4)
    return v
  }

  const handleSubmit = async () => {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      const [expMonth, expYear] = cardExpiry.split("/")
      const holderDocument = customer.customerDocument?.replace(/\D/g, "") ?? ""

      const tokenResponse = await fetch(
        "https://api.pagar.me/core/v5/tokens?appId=" + publicKey,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "card",
            card: {
              number: cardNumber.replace(/\s/g, ""),
              holder_name: cardName || customer.customerName,
              holder_document: holderDocument,
              exp_month: parseInt(expMonth ?? "0"),
              exp_year: parseInt(
                (expYear?.length ?? 0) === 2 ? "20" + expYear : expYear ?? "0"
              ),
              cvv: cardCvv,
            },
          }),
        }
      )

      if (!tokenResponse.ok) {
        throw new Error(await readPagarmeTokenError(tokenResponse))
      }

      const tokenData = await tokenResponse.json()

      const result = await checkoutService.processCardPayment(token, {
        ...customer,
        token: tokenData.id,
        installments: parseInt(installments),
      })

      if (result.status === "rejected") {
        setError(
          result.message ||
            "Pagamento recusado. Verifique os dados do cartão."
        )
        return
      }
      onSuccess(result)
    } catch (err: unknown) {
      const message = getCheckoutErrorMessage(err)
      setError(message)
      onError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormShell error={error}>
      <AcceptedBrandsHeader paymentMethodId="" />

      <div className="space-y-4 pt-4">
        <div className="space-y-1.5">
          <Label htmlFor="pm-card-number" className="text-sm font-medium text-gray-700">
            Número do Cartão
          </Label>
          <Input
            id="pm-card-number"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            disabled={loading}
            className="h-11 rounded-xl tabular-nums tracking-wide"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="pm-expiry" className="text-sm font-medium text-gray-700">
              Validade
            </Label>
            <Input
              id="pm-expiry"
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/AA"
              value={cardExpiry}
              onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
              maxLength={5}
              disabled={loading}
              className="h-11 rounded-xl tabular-nums"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pm-cvv" className="text-sm font-medium text-gray-700">
              CVV
            </Label>
            <Input
              id="pm-cvv"
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              value={cardCvv}
              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
              maxLength={4}
              disabled={loading}
              className="h-11 rounded-xl tabular-nums"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pm-name" className="text-sm font-medium text-gray-700">
            Nome no Cartão
          </Label>
          <Input
            id="pm-name"
            type="text"
            autoComplete="cc-name"
            placeholder="Como está no cartão"
            value={cardName}
            onChange={(e) => setCardName(e.target.value.toUpperCase())}
            disabled={loading}
            className="h-11 rounded-xl tracking-wide"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Parcelamento
          </Label>
          <Select
            value={installments}
            onValueChange={setInstallments}
            disabled={loading}
          >
            <SelectTrigger className="h-11 rounded-xl bg-gray-50">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                <SelectItem key={n} value={n.toString()}>
                  <span className="font-semibold tabular-nums">{n}×</span>{" "}
                  <span className="tabular-nums">
                    {formatCurrency(Math.ceil(amount / n))}
                  </span>
                  {n === 1 ? (
                    <span className="text-gray-400"> à vista</span>
                  ) : null}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <PayButton amount={amount} loading={loading} onClick={handleSubmit} />
        <TrustLine />
      </div>
    </FormShell>
  )
}
