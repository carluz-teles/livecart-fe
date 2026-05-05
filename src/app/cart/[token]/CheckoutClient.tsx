"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Loader2,
  AlertCircle,
  XCircle,
  User,
  MapPin,
  CreditCard,
  Sparkles,
  ArrowRight,
  Truck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  CheckoutHeader,
  CheckoutSection,
  CheckoutExpressPayment,
  CheckoutOrderSummary,
  CheckoutShippingOptions,
} from "@/components/checkout"

// Heavy payment widgets only render after the shopper completes the
// customer/address forms and picks a method. Lazy-loading keeps the
// Mercado Pago SDK (~bundle-heavy) and the PIX widget out of the initial
// /cart payload — both are pulled on demand.
function PaymentWidgetFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  )
}

const CheckoutCardForm = dynamic(
  () =>
    import("@/components/checkout/CheckoutCardForm").then((m) => m.CheckoutCardForm),
  { loading: () => <PaymentWidgetFallback />, ssr: false }
)

const CheckoutPixDisplay = dynamic(
  () =>
    import("@/components/checkout/CheckoutPixDisplay").then((m) => m.CheckoutPixDisplay),
  { loading: () => <PaymentWidgetFallback />, ssr: false }
)
import { CheckoutPaidScreen } from "@/components/checkout/CheckoutPaidScreen"
import { CheckoutExpiredScreen } from "@/components/checkout/CheckoutExpiredScreen"
import { CheckoutErrorScreen } from "@/components/checkout/CheckoutErrorScreen"
import { checkoutService } from "@/services/api/checkout.service"
import {
  useCheckoutCart,
  useCheckoutConfig,
  useCepLookup,
  useShippingQuote,
  useSelectShippingMethod,
  usePaymentStatus,
  useUpdateCartItemQuantity,
  useRemoveCartItem,
} from "@/hooks/checkout"
import {
  checkoutFormSchema,
  type CheckoutFormData,
  isCustomerInfoComplete,
  isShippingAddressComplete,
} from "@/schemas/checkout.schema"
import { cn } from "@/lib/utils"
import type {
  PublicCheckoutCart,
  PaymentMethod,
  ProcessCardPaymentResponse,
  CheckoutCustomerInfo,
  ShippingOption,
  PublicCheckoutSummary,
} from "@/types"
import type { ApiError } from "@/types/api.types"

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
}

function FailedScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-red-50/30 to-white">
      <div className="mx-auto max-w-6xl p-4 py-8">
        <Card className="mx-auto max-w-md border-red-100 shadow-xl shadow-red-100/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/30">
              <XCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="mt-8 text-2xl font-bold text-gray-900">Pagamento Falhou</h2>
            <p className="mt-2 text-center text-gray-500 max-w-xs">
              Houve um problema com o pagamento. Você pode tentar novamente.
            </p>
            <Button className="mt-8 gap-2" onClick={onRetry}>
              Tentar novamente
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

interface CheckoutContentProps {
  token: string
  initialCart: PublicCheckoutCart
}

function CheckoutContent({ token, initialCart }: CheckoutContentProps) {
  const {
    data: cart,
    error: cartError,
    refetch: refetchCart,
  } = useCheckoutCart(token, initialCart)

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: "",
      customerName: "",
      customerDocument: "",
      customerPhone: "",
      shippingAddress: {
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
    },
    mode: "onChange",
  })

  const cepLookup = useCepLookup()

  const updateItemQuantity = useUpdateCartItemQuantity()
  const removeItem = useRemoveCartItem()

  const handleUpdateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity < 1) return
      updateItemQuantity.mutate({ token, itemId, quantity })
    },
    [updateItemQuantity, token]
  )

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      removeItem.mutate({ token, itemId })
    },
    [removeItem, token]
  )

  const shippingQuote = useShippingQuote()
  const selectShippingMethod = useSelectShippingMethod()
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [shippingFreeByEvent, setShippingFreeByEvent] = useState(false)
  const [shippingQuoteError, setShippingQuoteError] = useState<string | null>(null)
  const [shippingReselectNotice, setShippingReselectNotice] = useState<string | null>(null)
  const [quotedZip, setQuotedZip] = useState<string | null>(null)
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null)
  const [shippingSummary, setShippingSummary] = useState<PublicCheckoutSummary | null>(null)
  // Locked while ViaCEP (or returning-buyer prefill) holds a known city/state
  // for this CEP. Street and neighborhood stay editable so single-CEP cities
  // (where ViaCEP returns empty logradouro/bairro) still work.
  const [isAddressLockedByCep, setIsAddressLockedByCep] = useState(false)
  const shippingSectionRef = useRef<HTMLDivElement>(null)
  const quoteDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prefilledRef = useRef(false)

  const email = form.watch("email")
  const customerName = form.watch("customerName")
  const customerDocument = form.watch("customerDocument")
  const customerPhone = form.watch("customerPhone")
  const shippingAddress = form.watch("shippingAddress")

  const customerInfoComplete = isCustomerInfoComplete({
    email,
    customerName,
    customerDocument,
    customerPhone,
  })
  const addressComplete = isShippingAddressComplete(shippingAddress)
  const shippingComplete = selectedShippingId !== null
  const canProceedToPayment = customerInfoComplete && addressComplete && shippingComplete

  const customerPayload = useMemo<CheckoutCustomerInfo | null>(() => {
    if (!canProceedToPayment) return null
    const phoneDigits = (customerPhone ?? "").replace(/\D/g, "")
    const documentDigits = customerDocument.replace(/\D/g, "")
    const zipDigits = shippingAddress.zipCode.replace(/\D/g, "")
    return {
      email,
      customerName: customerName.trim(),
      customerDocument: documentDigits,
      customerPhone: phoneDigits || undefined,
      shippingAddress: {
        zipCode: zipDigits,
        street: shippingAddress.street.trim(),
        number: shippingAddress.number.trim(),
        complement: shippingAddress.complement?.trim() || undefined,
        neighborhood: shippingAddress.neighborhood.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.toUpperCase(),
      },
    }
  }, [
    canProceedToPayment,
    email,
    customerName,
    customerDocument,
    customerPhone,
    shippingAddress.zipCode,
    shippingAddress.street,
    shippingAddress.number,
    shippingAddress.complement,
    shippingAddress.neighborhood,
    shippingAddress.city,
    shippingAddress.state,
  ])

  const {
    data: checkoutConfig,
    isLoading: configLoading,
    error: configError,
    refetch: refetchConfig,
  } = useCheckoutConfig(token, canProceedToPayment)

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("pix")
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentFailed, setPaymentFailed] = useState(false)

  const { data: paymentStatusData } = usePaymentStatus(token, {
    enabled: isProcessing,
    refetchInterval: isProcessing ? 5000 : false,
  })

  useEffect(() => {
    if (!paymentStatusData || !isProcessing) return

    if (paymentStatusData.paymentStatus === "paid") {
      setIsProcessing(false)
      setPaymentSuccess(true)
      refetchCart()
    } else if (paymentStatusData.paymentStatus === "failed") {
      setIsProcessing(false)
      setPaymentFailed(true)
    }
  }, [paymentStatusData, isProcessing, refetchCart])

  const availableMethods = useMemo<PaymentMethod[]>(() => {
    const list = checkoutConfig?.availableMethods ?? []
    return list.length > 0 ? list : ["card"]
  }, [checkoutConfig?.availableMethods])
  const methodsCount = availableMethods.length

  useEffect(() => {
    if (!availableMethods.includes(selectedMethod)) {
      setSelectedMethod(
        availableMethods.includes("pix") ? "pix" : availableMethods[0]
      )
    }
  }, [availableMethods, selectedMethod])

  const runShippingQuote = useCallback(
    async (cleaned: string) => {
      if (cleaned.length !== 8) return
      try {
        const quote = await shippingQuote.mutateAsync({ token, zipCode: cleaned })
        setShippingOptions(quote.options)
        setShippingFreeByEvent(quote.freeShipping)
        setQuotedZip(cleaned)
        setShippingQuoteError(null)
        setShippingReselectNotice(null)
      } catch (err) {
        const apiErr = err as ApiError
        const message =
          apiErr?.error === "quantity_above_quote_limit"
            ? "Um dos produtos no seu carrinho tem mais de 100 unidades, o que não é suportado pela transportadora. Entre em contato com a loja."
            : apiErr?.message ||
              "Não foi possível cotar o frete. Tente novamente."
        setShippingOptions([])
        setShippingFreeByEvent(false)
        setQuotedZip(cleaned)
        setShippingQuoteError(message)
      }
    },
    [shippingQuote, token]
  )

  const scheduleShippingQuote = useCallback(
    (cleaned: string) => {
      if (quoteDebounceRef.current) {
        clearTimeout(quoteDebounceRef.current)
      }
      quoteDebounceRef.current = setTimeout(() => {
        runShippingQuote(cleaned)
      }, 400)
    },
    [runShippingQuote]
  )

  useEffect(() => {
    return () => {
      if (quoteDebounceRef.current) {
        clearTimeout(quoteDebounceRef.current)
      }
    }
  }, [])

  const handleCepChange = async (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    const formatted = cleaned.length > 5
      ? `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`
      : cleaned

    form.setValue("shippingAddress.zipCode", formatted, { shouldValidate: true })

    // Any keystroke on CEP unlocks city/state until the next successful
    // lookup confirms a new pair.
    setIsAddressLockedByCep(false)

    if (quotedZip && cleaned !== quotedZip) {
      setSelectedShippingId(null)
      setShippingSummary(null)
      setShippingReselectNotice(null)
    }

    if (cleaned.length === 8) {
      try {
        const addressData = await cepLookup.mutateAsync(cleaned)
        form.setValue("shippingAddress.street", addressData.street, { shouldValidate: true })
        form.setValue("shippingAddress.neighborhood", addressData.neighborhood, { shouldValidate: true })
        form.setValue("shippingAddress.city", addressData.city, { shouldValidate: true })
        form.setValue("shippingAddress.state", addressData.state, { shouldValidate: true })
        // Lock city/state — these are authoritative for a CEP. Street and
        // neighborhood stay editable so single-CEP cities (where ViaCEP
        // returns empty logradouro/bairro) still work.
        setIsAddressLockedByCep(true)
      } catch {
        // Error handled by mutation state
      }
      scheduleShippingQuote(cleaned)
    }
  }

  const handleSelectShipping = useCallback(
    async (optionId: string) => {
      const option = shippingOptions.find((o) => o.id === optionId)
      if (!option || !option.available) return
      const zipForSelect =
        quotedZip ??
        (form.getValues("shippingAddress.zipCode") || "").replace(/\D/g, "")
      if (!zipForSelect || zipForSelect.length !== 8) {
        setShippingReselectNotice(
          "Informe o CEP para confirmar o frete."
        )
        return
      }
      try {
        const result = await selectShippingMethod.mutateAsync({
          token,
          serviceId: option.id,
          zipCode: zipForSelect,
          provider: option.provider,
        })
        setSelectedShippingId(option.id)
        setShippingSummary(result.summary)
        setShippingReselectNotice(null)
      } catch (err) {
        const apiErr = err as ApiError
        if (apiErr?.status === 422) {
          setSelectedShippingId(null)
          setShippingSummary(null)
          setShippingReselectNotice(
            "Essa opção não está mais disponível. Cotando novamente..."
          )
          runShippingQuote(zipForSelect)
          return
        }
        console.error(
          "Failed to select shipping method:",
          apiErr?.message || apiErr
        )
      }
    },
    [form, quotedZip, runShippingQuote, selectShippingMethod, shippingOptions, token]
  )

  const handleRetryQuote = useCallback(() => {
    const zip = (form.getValues("shippingAddress.zipCode") || "").replace(/\D/g, "")
    if (zip.length === 8) runShippingQuote(zip)
  }, [form, runShippingQuote])

  const formatCPF = (value: string): string => {
    const v = value.replace(/\D/g, "").slice(0, 11)
    if (v.length <= 3) return v
    if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`
    if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`
    return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`
  }

  const formatPhone = (value: string): string => {
    const v = value.replace(/\D/g, "").slice(0, 11)
    if (v.length === 0) return ""
    if (v.length <= 2) return `(${v}`
    if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`
    if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`
    return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
  }

  // One-shot prefill from the cart payload. Seeds email (legacy field) and the
  // returning-buyer block (customer + shippingAddress) when present, but never
  // clobbers what the user is already typing. We bypass handleCepChange on
  // purpose so we don't trigger a redundant ViaCEP fetch — the address is
  // already authoritative from the prior paid order. We do trigger a single
  // shipping quote so options appear without the buyer having to retouch the
  // CEP field.
  useEffect(() => {
    if (prefilledRef.current || !cart) return

    if (cart.customerEmail && !form.getValues("email")) {
      form.setValue("email", cart.customerEmail)
    }

    if (cart.customer && !form.getValues("customerName")) {
      form.setValue("customerName", cart.customer.name, { shouldValidate: true })
      if (cart.customer.document) {
        form.setValue("customerDocument", formatCPF(cart.customer.document), { shouldValidate: true })
      }
      if (cart.customer.phone) {
        form.setValue("customerPhone", formatPhone(cart.customer.phone), { shouldValidate: true })
      }
      if (cart.customer.email && !form.getValues("email")) {
        form.setValue("email", cart.customer.email)
      }
    }

    if (cart.shippingAddress && !form.getValues("shippingAddress.zipCode")) {
      const addr = cart.shippingAddress
      const cleanedZip = addr.zipCode.replace(/\D/g, "")
      const formattedZip = cleanedZip.length > 5
        ? `${cleanedZip.slice(0, 5)}-${cleanedZip.slice(5, 8)}`
        : cleanedZip
      form.setValue("shippingAddress", {
        zipCode: formattedZip,
        street: addr.street,
        number: addr.number,
        complement: addr.complement ?? "",
        neighborhood: addr.neighborhood,
        city: addr.city,
        state: addr.state,
      }, { shouldValidate: true })

      if (cleanedZip.length === 8) {
        setIsAddressLockedByCep(true)
        runShippingQuote(cleanedZip)
      }
    }

    // Restore a previously selected shipping method straight from the cart.
    // The buyer reloaded mid-checkout, so we shouldn't force them to re-pick.
    if (cart.shipping && !selectedShippingId) {
      setSelectedShippingId(cart.shipping.serviceId)
      setShippingSummary({
        subtotal: cart.summary.subtotal,
        shippingCost: cart.shipping.costCents,
        couponDiscount: cart.summary.couponDiscount ?? 0,
        total: cart.summary.subtotal + cart.shipping.costCents,
        totalItems: cart.summary.totalItems,
        hasShippingQuote: true,
      })
    }

    prefilledRef.current = true
  }, [cart, form, runShippingQuote, selectedShippingId])

  const handleCardSuccess = (result: ProcessCardPaymentResponse) => {
    if (result.status === "approved") {
      setPaymentSuccess(true)
      refetchCart()
    } else if (result.status === "pending" || result.status === "in_process") {
      setIsProcessing(true)
    }
  }

  const handlePixSuccess = () => {
    setPaymentSuccess(true)
    refetchCart()
  }

  const handlePaymentError = useCallback((error: string) => {
    console.error("Payment error:", error)
    if (/shipping_quote_expired/i.test(error)) {
      setSelectedShippingId(null)
      setShippingSummary(null)
      const zip = (form.getValues("shippingAddress.zipCode") || "").replace(/\D/g, "")
      if (zip.length === 8) runShippingQuote(zip)
      shippingSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [form, runShippingQuote])

  const handleApplyCoupon = useCallback(
    async (code: string) => {
      // Service throws on 4xx with the BE message — let it bubble so
      // CheckoutCouponField can surface the inline error. On success we
      // refetch so the cart's appliedCoupon + summary.couponDiscount line
      // up with the new totals.
      const result = await checkoutService.applyCoupon(token, code)
      await refetchCart()
      return {
        code: result.code,
        type: result.type,
        discountCents: result.appliedValueCents,
        maxDiscountCents: result.maxDiscountCents ?? 0,
      }
    },
    [token, refetchCart],
  )

  const handleRemoveCoupon = useCallback(async () => {
    try {
      await checkoutService.removeCoupon(token)
    } catch (err) {
      // Refetch first so the UI reflects whatever the server actually has,
      // then re-throw so CheckoutCouponField can render the inline error
      // (cart paid / network failure / 5xx). The BE remove path is
      // idempotent, so a fresh GET is the safe source of truth either way.
      await refetchCart()
      throw err
    }
    await refetchCart()
  }, [token, refetchCart])

  if (cartError || !cart) {
    return (
      <CheckoutErrorScreen
        message={(cartError as Error)?.message || "Carrinho não encontrado"}
        retryHref={`/cart/${token}`}
      />
    )
  }

  if (cart.paymentStatus === "paid" || paymentSuccess) {
    return <CheckoutPaidScreen cart={cart} />
  }

  if (paymentFailed) {
    return (
      <FailedScreen
        onRetry={() => {
          setPaymentFailed(false)
          setIsProcessing(false)
        }}
      />
    )
  }

  if (cart.status === "expired") {
    return <CheckoutExpiredScreen cart={cart} />
  }

  if (cart.status !== "checkout" && cart.status !== "active") {
    return <CheckoutErrorScreen message="Este carrinho não está disponível para pagamento." />
  }

  const isLiveActive = cart.status === "active"

  const availableItems = cart.items.filter((item) => {
    const availableQty = item.quantity - item.waitlistedQuantity
    return availableQty > 0
  })

  if (availableItems.length === 0) {
    return <CheckoutErrorScreen message="Nenhum item disponível para pagamento." />
  }

  const orderItems = availableItems.map((item) => {
    const availableQty = item.quantity - item.waitlistedQuantity
    return {
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      quantity: availableQty,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * availableQty,
      availableStock: item.availableStock,
    }
  })

  const isAddressAutoFilled = cepLookup.isSuccess
  const isFreeShipping =
    shippingFreeByEvent ||
    cart.event?.freeShipping ||
    false

  const shippingCostCents = shippingSummary?.shippingCost ?? null
  const selectedOption = shippingOptions.find((o) => o.id === selectedShippingId)
  const shippingRealCostCents = selectedOption?.realPriceCents ?? null
  // Always derive the total from the live cart subtotal so quantity edits and
  // item removals reflect immediately. shippingSummary caches the chosen
  // carrier's cost; weight-tier re-quoting happens via the existing cart
  // mutation flow.
  const couponDiscount = cart.summary.couponDiscount ?? 0
  const effectiveTotal = Math.max(
    0,
    cart.summary.subtotal + (shippingCostCents ?? 0) - couponDiscount,
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <CheckoutHeader
        storeName={cart.store.name}
        logoUrl={cart.store.logoUrl}
        isLiveActive={isLiveActive}
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 lg:hidden">
          <CheckoutOrderSummary
            items={orderItems}
            subtotal={cart.summary.subtotal}
            totalItems={cart.summary.totalItems}
            shippingCostCents={shippingCostCents}
            shippingRealCostCents={shippingRealCostCents}
            isFreeShipping={isFreeShipping}
            discount={couponDiscount}
            appliedCoupon={cart.appliedCoupon}
            total={effectiveTotal}
            platformHandle={cart.platformHandle}
            isLiveActive={isLiveActive}
            allowEdit={cart.allowEdit}
            maxQuantityPerItem={cart.maxQuantityPerItem}
            expiresAt={cart.expiresAt}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onExpired={() => refetchCart()}
            formatCurrency={formatCurrency}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          <Form {...form}>
            <form className="space-y-6">
              {cart.isReturningCustomer && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-medium">Olá de novo, @{cart.platformHandle} 👋</p>
                    <p className="mt-0.5 text-emerald-800/90">
                      Preenchemos seus dados do último pedido. Confira, escolha o frete e pague.
                    </p>
                  </div>
                </div>
              )}

              <CheckoutSection
                number={1}
                title="Dados do Comprador"
                icon={User}
                isComplete={customerInfoComplete}
                delay={0}
              >
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nome completo <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            autoComplete="name"
                            placeholder="Como está no documento"
                            className="h-11 rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="customerDocument"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            CPF <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              inputMode="numeric"
                              autoComplete="off"
                              placeholder="000.000.000-00"
                              maxLength={14}
                              onChange={(e) => field.onChange(formatCPF(e.target.value))}
                              className="h-11 rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Celular <span className="text-xs font-normal text-gray-500">(opcional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              placeholder="(11) 99999-9999"
                              maxLength={15}
                              onChange={(e) => field.onChange(formatPhone(e.target.value))}
                              className="h-11 rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            autoComplete="email"
                            placeholder="seu@email.com"
                            className="h-11 rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CheckoutSection>

              <CheckoutSection
                number={2}
                title="Endereço de Entrega"
                icon={MapPin}
                isComplete={addressComplete}
                delay={100}
              >
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="shippingAddress.zipCode"
                    render={({ field }) => (
                      <FormItem className="w-full sm:max-w-[200px]">
                        <FormLabel>
                          CEP <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="00000-000"
                              maxLength={9}
                              onChange={(e) => handleCepChange(e.target.value)}
                              className={cn(
                                "h-11 rounded-xl",
                                cepLookup.error && "border-red-300"
                              )}
                            />
                            {cepLookup.isPending && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        {cepLookup.error && (
                          <p className="text-xs text-red-500">{cepLookup.error.message}</p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shippingAddress.street"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>
                            Rua <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={
                                isAddressAutoFilled
                                  ? "Informe a rua"
                                  : "Preencha o CEP"
                              }
                              className={cn(
                                "h-11 rounded-xl",
                                isAddressAutoFilled && "bg-gray-50"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="shippingAddress.number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Número <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="123"
                              className="h-11 rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shippingAddress.complement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Apto, bloco, etc."
                              className="h-11 rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="shippingAddress.neighborhood"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel>
                              Bairro <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={
                                  isAddressAutoFilled
                                    ? "Informe o bairro"
                                    : "Preencha o CEP"
                                }
                                  className={cn(
                                  "h-11 rounded-xl",
                                  isAddressAutoFilled && "bg-gray-50"
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="shippingAddress.city"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel>
                              Cidade <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={
                                  isAddressAutoFilled
                                    ? "Informe a cidade"
                                    : "Preencha o CEP"
                                }
                                disabled={isAddressLockedByCep}
                                aria-readonly={isAddressLockedByCep}
                                className={cn(
                                  "h-11 rounded-xl",
                                  isAddressLockedByCep && "bg-gray-50 cursor-not-allowed"
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="shippingAddress.state"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel>
                              Estado <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="UF"
                                maxLength={2}
                                onChange={(e) => {
                                  field.onChange(e.target.value.toUpperCase())
                                }}
                                disabled={isAddressLockedByCep}
                                aria-readonly={isAddressLockedByCep}
                                className={cn(
                                  "h-11 rounded-xl",
                                  isAddressLockedByCep && "bg-gray-50 cursor-not-allowed"
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />
                  </div>
                </div>
              </CheckoutSection>

              <div ref={shippingSectionRef}>
                <CheckoutSection
                  number={3}
                  title="Frete"
                  icon={Truck}
                  isComplete={shippingComplete}
                  isActive={addressComplete}
                  delay={150}
                >
                  {!addressComplete ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                          <Truck className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">
                          Preencha o endereço acima para calcularmos o frete.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {isFreeShipping && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-800">
                          <Sparkles className="h-4 w-4 text-emerald-600" />
                          <span>
                            <strong>Frete grátis neste evento.</strong>{" "}
                            Escolha uma transportadora — você paga R$ 0,00.
                          </span>
                        </div>
                      )}
                      {shippingReselectNotice && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-800">
                          <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                          <span>{shippingReselectNotice}</span>
                        </div>
                      )}
                      <CheckoutShippingOptions
                        options={shippingOptions}
                        selectedId={selectedShippingId}
                        onSelect={handleSelectShipping}
                        isLoading={shippingQuote.isPending && !shippingOptions.length}
                        isSelecting={selectShippingMethod.isPending}
                        selectingId={
                          selectShippingMethod.isPending
                            ? selectedShippingId ?? null
                            : null
                        }
                        error={shippingQuoteError}
                        onRetry={handleRetryQuote}
                        freeShipping={isFreeShipping}
                        formatCurrency={formatCurrency}
                      />
                    </>
                  )}
                </CheckoutSection>
              </div>

              <CheckoutSection
                number={4}
                title="Pagamento"
                icon={CreditCard}
                isComplete={false}
                isActive={canProceedToPayment}
                delay={200}
              >
                {!canProceedToPayment ? (
                  <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <CreditCard className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">
                        Preencha as informações acima para continuar
                      </p>
                    </div>
                  </div>
                ) : configLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-500">Carregando opções de pagamento...</span>
                    </div>
                  </div>
                ) : configError ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <p className="mt-4 text-sm text-red-600">
                      {(configError as Error)?.message || "Erro ao carregar pagamento"}
                    </p>
                    <Button variant="outline" className="mt-4" onClick={() => refetchConfig()}>
                      Tentar novamente
                    </Button>
                  </div>
                ) : checkoutConfig ? (
                  <div className="space-y-6">
                    {methodsCount > 1 && (
                      <>
                        <CheckoutExpressPayment
                          selectedMethod={selectedMethod}
                          onSelectMethod={setSelectedMethod}
                          pixAvailable={availableMethods.includes("pix")}
                          cardAvailable={availableMethods.includes("card")}
                        />

                        <Separator className="bg-gray-100" />
                      </>
                    )}

                    {selectedMethod === "card" && customerPayload ? (
                      <CheckoutCardForm
                        token={token}
                        provider={checkoutConfig.provider}
                        publicKey={checkoutConfig.publicKey}
                        amount={effectiveTotal}
                        customer={customerPayload}
                        onSuccess={handleCardSuccess}
                        onError={handlePaymentError}
                      />
                    ) : selectedMethod === "pix" && customerPayload ? (
                      <CheckoutPixDisplay
                        token={token}
                        customer={customerPayload}
                        onSuccess={handlePixSuccess}
                        onError={handlePaymentError}
                      />
                    ) : null}
                  </div>
                ) : null}

                {isProcessing && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative">
                      <div className="absolute -inset-4 animate-pulse rounded-full bg-primary/10" />
                      <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-gray-900">Processando pagamento...</h3>
                    <p className="mt-2 text-center text-sm text-gray-500">
                      Aguarde enquanto confirmamos seu pagamento.
                    </p>
                  </div>
                )}
              </CheckoutSection>
            </form>
          </Form>

          <div className="hidden lg:block lg:sticky lg:top-8 lg:self-start">
            <CheckoutOrderSummary
              items={orderItems}
              subtotal={cart.summary.subtotal}
              totalItems={cart.summary.totalItems}
              shippingCostCents={shippingCostCents}
              shippingRealCostCents={shippingRealCostCents}
              isFreeShipping={isFreeShipping}
              discount={couponDiscount}
              appliedCoupon={cart.appliedCoupon}
              total={effectiveTotal}
              platformHandle={cart.platformHandle}
              isLiveActive={isLiveActive}
              allowEdit={cart.allowEdit}
              maxQuantityPerItem={cart.maxQuantityPerItem}
              expiresAt={cart.expiresAt}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onExpired={() => refetchCart()}
              formatCurrency={formatCurrency}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

interface CheckoutClientProps {
  token: string
  initialCart: PublicCheckoutCart
}

function CheckoutClientInner({ token, initialCart }: CheckoutClientProps) {
  const searchParams = useSearchParams()
  const status = searchParams.get("status")

  if (status === "failure") {
    return <FailedScreen onRetry={() => (window.location.href = `/cart/${token}`)} />
  }

  return <CheckoutContent token={token} initialCart={initialCart} />
}

export function CheckoutClient(props: CheckoutClientProps) {
  return (
    <Suspense fallback={null}>
      <CheckoutClientInner {...props} />
    </Suspense>
  )
}
