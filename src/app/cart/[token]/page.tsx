"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  MapPin,
  CreditCard,
  Sparkles,
  ArrowRight,
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
  CheckoutCardForm,
  CheckoutPixDisplay,
} from "@/components/checkout"
import {
  useCheckoutCart,
  useCheckoutConfig,
  useCepLookup,
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
} from "@/types"

// Format currency in BRL
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
}

// Premium loading state component
function LoadingState() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-6xl p-4 py-8">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="relative">
            <div className="absolute -inset-4 animate-ping rounded-full bg-primary/10" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
          </div>
          <p className="mt-6 text-sm font-medium text-gray-500">Carregando seu carrinho...</p>
        </div>
      </div>
    </main>
  )
}

// Premium error state component
function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-6xl p-4 py-8">
        <Card className="mx-auto max-w-md border-gray-100 shadow-xl shadow-gray-100/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">Erro ao carregar</h2>
            <p className="mt-2 text-center text-sm text-gray-500 max-w-xs">{message}</p>
            {onRetry && (
              <Button variant="outline" className="mt-6" onClick={onRetry}>
                Tentar novamente
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

// Premium expired state component
function ExpiredState({ cart }: { cart: PublicCheckoutCart }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      <CheckoutHeader storeName={cart.store.name} logoUrl={cart.store.logoUrl} />
      <div className="mx-auto max-w-6xl p-4 py-8">
        <Card
          className={cn(
            "mx-auto max-w-md border-amber-100 shadow-xl shadow-amber-100/50 transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="absolute -inset-4 animate-pulse rounded-full bg-amber-100" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30">
                <Clock className="h-10 w-10 text-white" />
              </div>
            </div>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">Carrinho Expirado</h2>
            <p className="mt-2 text-center text-gray-500 max-w-xs">
              O tempo para finalizar esta compra acabou. Entre em contato com a loja para solicitar um novo carrinho.
            </p>

            <div className="mt-8 w-full max-w-xs">
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Loja</span>
                  <span className="font-medium text-gray-900">{cart.store.name}</span>
                </div>
                <Separator className="bg-gray-200" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Comprador</span>
                  <span className="font-medium text-gray-900">@{cart.platformHandle}</span>
                </div>
                {cart.summary.totalItems > 0 && (
                  <>
                    <Separator className="bg-gray-200" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Itens no carrinho</span>
                      <span className="font-medium text-gray-900">{cart.summary.totalItems}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </main>
  )
}

// Premium success state component
function SuccessState({ cart }: { cart: PublicCheckoutCart }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white">
      <CheckoutHeader storeName={cart.store.name} logoUrl={cart.store.logoUrl} />
      <div className="mx-auto max-w-6xl p-4 py-8">
        <Card
          className={cn(
            "mx-auto max-w-md border-emerald-100 shadow-xl shadow-emerald-100/50 transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="absolute -inset-4 animate-pulse rounded-full bg-emerald-100" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
            </div>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">Pagamento Confirmado!</h2>
            <p className="mt-2 text-center text-gray-500 max-w-xs">
              Obrigado pela sua compra. Você receberá um email com os detalhes do pedido.
            </p>

            <div className="mt-8 w-full max-w-xs">
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Loja</span>
                  <span className="font-medium text-gray-900">{cart.store.name}</span>
                </div>
                <Separator className="bg-gray-200" />
                <div className="flex justify-between">
                  <span className="text-gray-500">Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(cart.summary.subtotal)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-emerald-600">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Compra realizada com sucesso</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

// Premium failed payment state component
function FailedState({ onRetry }: { onRetry: () => void }) {
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

// Main checkout content component
function CheckoutContent({ token }: { token: string }) {
  // React Query hooks
  const {
    data: cart,
    isLoading: cartLoading,
    error: cartError,
    refetch: refetchCart,
  } = useCheckoutCart(token)

  // Form setup with React Hook Form + Zod
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

  // CEP lookup mutation
  const cepLookup = useCepLookup()

  // Watch form values for completion checks
  const email = form.watch("email")
  const customerName = form.watch("customerName")
  const customerDocument = form.watch("customerDocument")
  const customerPhone = form.watch("customerPhone")
  const shippingAddress = form.watch("shippingAddress")

  // Derive completion states
  const customerInfoComplete = isCustomerInfoComplete({
    email,
    customerName,
    customerDocument,
    customerPhone,
  })
  const addressComplete = isShippingAddressComplete(shippingAddress)
  const canProceedToPayment = customerInfoComplete && addressComplete

  // Serialized customer payload for downstream payment components.
  // Memoize so re-renders on keystrokes don't trigger PIX regeneration effects.
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

  // Checkout config - only fetch when can proceed to payment
  const {
    data: checkoutConfig,
    isLoading: configLoading,
    error: configError,
    refetch: refetchConfig,
  } = useCheckoutConfig(token, canProceedToPayment)

  // Payment state
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("pix")
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Set default email from cart data
  useEffect(() => {
    if (cart?.customerEmail && !form.getValues("email")) {
      form.setValue("email", cart.customerEmail)
    }
  }, [cart?.customerEmail, form])

  // Set default payment method from config
  useEffect(() => {
    if (checkoutConfig?.availableMethods) {
      if (checkoutConfig.availableMethods.includes("pix")) {
        setSelectedMethod("pix")
      } else if (checkoutConfig.availableMethods.length > 0) {
        setSelectedMethod(checkoutConfig.availableMethods[0])
      }
    }
  }, [checkoutConfig?.availableMethods])

  // Format CEP and trigger lookup
  const handleCepChange = async (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    const formatted = cleaned.length > 5
      ? `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`
      : cleaned

    form.setValue("shippingAddress.zipCode", formatted, { shouldValidate: true })

    if (cleaned.length === 8) {
      try {
        const addressData = await cepLookup.mutateAsync(cleaned)
        form.setValue("shippingAddress.street", addressData.street, { shouldValidate: true })
        form.setValue("shippingAddress.neighborhood", addressData.neighborhood, { shouldValidate: true })
        form.setValue("shippingAddress.city", addressData.city, { shouldValidate: true })
        form.setValue("shippingAddress.state", addressData.state, { shouldValidate: true })
      } catch {
        // Error handled by mutation state
      }
    }
  }

  // Progressive CPF mask: 000.000.000-00
  const formatCPF = (value: string): string => {
    const v = value.replace(/\D/g, "").slice(0, 11)
    if (v.length <= 3) return v
    if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`
    if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`
    return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`
  }

  // Progressive phone mask: (11) 99999-9999 / (11) 9999-9999
  const formatPhone = (value: string): string => {
    const v = value.replace(/\D/g, "").slice(0, 11)
    if (v.length === 0) return ""
    if (v.length <= 2) return `(${v}`
    if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`
    if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`
    return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
  }

  // Payment handlers
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

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error)
  }

  // Coupon handlers (placeholder)
  const handleApplyCoupon = async (): Promise<null> => null
  const handleRemoveCoupon = () => {}

  // Loading state
  if (cartLoading) {
    return <LoadingState />
  }

  // Error state
  if (cartError || !cart) {
    return (
      <ErrorState
        message={(cartError as Error)?.message || "Carrinho não encontrado"}
        onRetry={() => refetchCart()}
      />
    )
  }

  // Success state
  if (cart.paymentStatus === "paid" || paymentSuccess) {
    return <SuccessState cart={cart} />
  }

  // Expired state
  if (cart.status === "expired") {
    return <ExpiredState cart={cart} />
  }

  // Not ready for checkout
  if (cart.status !== "checkout" && cart.status !== "active") {
    return <ErrorState message="Este carrinho não está disponível para pagamento." />
  }

  const isLiveActive = cart.status === "active"

  // Filter items that have available quantity (not fully waitlisted)
  const availableItems = cart.items.filter((item) => {
    const availableQty = item.quantity - item.waitlistedQuantity
    return availableQty > 0
  })

  if (availableItems.length === 0) {
    return <ErrorState message="Nenhum item disponível para pagamento." />
  }

  // Map items for OrderSummary with available quantities only
  const orderItems = availableItems.map((item) => {
    const availableQty = item.quantity - item.waitlistedQuantity
    return {
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      quantity: availableQty, // Only the available quantity
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * availableQty,
    }
  })

  const isAddressAutoFilled = cepLookup.isSuccess

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <CheckoutHeader
        storeName={cart.store.name}
        logoUrl={cart.store.logoUrl}
        isLiveActive={isLiveActive}
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Mobile Order Summary */}
        <div className="mb-6 lg:hidden">
          <CheckoutOrderSummary
            items={orderItems}
            subtotal={cart.summary.subtotal}
            totalItems={cart.summary.totalItems}
            total={cart.summary.subtotal}
            platformHandle={cart.platformHandle}
            isLiveActive={isLiveActive}
            allowEdit={cart.allowEdit}
            maxQuantityPerItem={cart.maxQuantityPerItem}
            expiresAt={cart.expiresAt}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            onExpired={() => refetchCart()}
            formatCurrency={formatCurrency}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          {/* Left Column - Form */}
          <Form {...form}>
            <form className="space-y-6">
              {/* Section 1: Customer Info */}
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
                            Celular <span className="text-xs font-normal text-gray-400">(opcional)</span>
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

              {/* Section 2: Address */}
              <CheckoutSection
                number={2}
                title="Endereço de Entrega"
                icon={MapPin}
                isComplete={addressComplete}
                delay={100}
              >
                <div className="grid gap-4">
                  {/* CEP */}
                  <FormField
                    control={form.control}
                    name="shippingAddress.zipCode"
                    render={({ field }) => (
                      <FormItem className="max-w-[200px]">
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

                  {/* Street */}
                  <FormField
                    control={form.control}
                    name="shippingAddress.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Rua <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={isAddressAutoFilled ? "" : "Preencha o CEP"}
                            readOnly={isAddressAutoFilled}
                            className={cn(
                              "h-11 rounded-xl",
                              isAddressAutoFilled && "bg-gray-50"
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Number and Complement */}
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

                  {/* Neighborhood, City, State */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="shippingAddress.neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Bairro <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={isAddressAutoFilled ? "" : "Preencha o CEP"}
                              readOnly={isAddressAutoFilled}
                              className={cn(
                                "h-11 rounded-xl",
                                isAddressAutoFilled && "bg-gray-50"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shippingAddress.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Cidade <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={isAddressAutoFilled ? "" : "Preencha o CEP"}
                              readOnly={isAddressAutoFilled}
                              className={cn(
                                "h-11 rounded-xl",
                                isAddressAutoFilled && "bg-gray-50"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shippingAddress.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Estado <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={isAddressAutoFilled ? "" : "UF"}
                              maxLength={2}
                              readOnly={isAddressAutoFilled}
                              onChange={(e) => {
                                field.onChange(e.target.value.toUpperCase())
                              }}
                              className={cn(
                                "h-11 rounded-xl",
                                isAddressAutoFilled && "bg-gray-50"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CheckoutSection>

              {/* Section 3: Payment */}
              <CheckoutSection
                number={3}
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
                    <CheckoutExpressPayment
                      selectedMethod={selectedMethod}
                      onSelectMethod={setSelectedMethod}
                      pixAvailable={checkoutConfig.availableMethods.includes("pix")}
                      cardAvailable={checkoutConfig.availableMethods.includes("card")}
                    />

                    <Separator className="bg-gray-100" />

                    {selectedMethod === "card" && customerPayload ? (
                      <CheckoutCardForm
                        token={token}
                        provider={checkoutConfig.provider}
                        publicKey={checkoutConfig.publicKey}
                        amount={checkoutConfig.totalAmount}
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

          {/* Right Column - Order Summary */}
          <div className="hidden lg:block lg:sticky lg:top-8 lg:self-start">
            <CheckoutOrderSummary
              items={orderItems}
              subtotal={cart.summary.subtotal}
              totalItems={cart.summary.totalItems}
              total={cart.summary.subtotal}
              platformHandle={cart.platformHandle}
              isLiveActive={isLiveActive}
              allowEdit={cart.allowEdit}
              maxQuantityPerItem={cart.maxQuantityPerItem}
              expiresAt={cart.expiresAt}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              onExpired={() => refetchCart()}
              formatCurrency={formatCurrency}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

// Page content component (uses searchParams)
function CheckoutPageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const token = params.token as string
  const status = searchParams.get("status")

  // Handle redirect status
  if (status === "failure") {
    return <FailedState onRetry={() => (window.location.href = `/cart/${token}`)} />
  }

  return <CheckoutContent token={token} />
}

// Page component with Suspense boundary
export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CheckoutPageContent />
    </Suspense>
  )
}
