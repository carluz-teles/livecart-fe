"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Loader2, ShoppingBag, AlertCircle, CheckCircle, XCircle, User, MapPin, CreditCard, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { checkoutService } from "@/services/api"
import {
  CheckoutPaymentMethods,
  CheckoutCardForm,
  CheckoutPixDisplay,
} from "@/components/checkout"
import type {
  PublicCheckoutCart,
  CheckoutConfigResponse,
  PaymentMethod,
  ProcessCardPaymentResponse,
  ApiError,
} from "@/types"

// Format currency in BRL
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
}

// Loading state component
function LoadingState() {
  return (
    <main className="min-h-screen bg-surface-secondary">
      <div className="mx-auto max-w-6xl p-4 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Carregando carrinho...</p>
        </div>
      </div>
    </main>
  )
}

// Error state component
function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <main className="min-h-screen bg-surface-secondary">
      <div className="mx-auto max-w-6xl p-4 py-8">
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-lg font-semibold">Erro ao carregar</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">{message}</p>
            {onRetry && (
              <Button variant="outline" className="mt-4" onClick={onRetry}>
                Tentar novamente
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

// Success state component (after payment)
function SuccessState({ cart }: { cart: PublicCheckoutCart }) {
  return (
    <main className="min-h-screen bg-surface-secondary">
      <div className="mx-auto max-w-6xl p-4 py-8">
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Pagamento Confirmado!</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Obrigado pela sua compra. Você receberá um email com os detalhes do pedido.
            </p>
            <div className="mt-6 w-full">
              <div className="rounded-lg border p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Loja</span>
                  <span className="font-medium">{cart.store.name}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">{formatCurrency(cart.summary.subtotal)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

// Failed payment state component
function FailedState({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="min-h-screen bg-surface-secondary">
      <div className="mx-auto max-w-6xl p-4 py-8">
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-red-100 p-4">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Pagamento Falhou</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Houve um problema com o pagamento. Você pode tentar novamente.
            </p>
            <Button className="mt-6" onClick={onRetry}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

// Section header component
function SectionHeader({
  icon: Icon,
  title,
  number,
  isComplete
}: {
  icon: React.ElementType
  title: string
  number: number
  isComplete: boolean
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
        isComplete
          ? "bg-green-100 text-green-600"
          : "bg-primary/10 text-primary"
      }`}>
        {isComplete ? <Check className="h-4 w-4" /> : number}
      </div>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
    </div>
  )
}

// Cart item component (compact version for sidebar)
function CartItemCompact({ item }: { item: PublicCheckoutCart["items"][0] }) {
  return (
    <div className="flex gap-3 py-3">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-6 w-6 text-muted-foreground/50" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center min-w-0">
        <h3 className="font-medium text-sm truncate">{item.name}</h3>
        <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
      </div>
      <p className="font-medium text-sm">{formatCurrency(item.totalPrice)}</p>
    </div>
  )
}

// Form data type
interface CheckoutFormData {
  email: string
  phone: string
  address: {
    zipCode: string
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
  }
}

// Main checkout page component
export default function CheckoutPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const token = params.token as string
  const status = searchParams.get("status")

  const [cart, setCart] = useState<PublicCheckoutCart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: "",
    phone: "",
    address: {
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  })

  // Section completion state
  const [personalInfoComplete, setPersonalInfoComplete] = useState(false)
  const [addressComplete, setAddressComplete] = useState(false)

  // Checkout config state
  const [checkoutConfig, setCheckoutConfig] = useState<CheckoutConfigResponse | null>(null)
  const [configLoading, setConfigLoading] = useState(false)
  const [configError, setConfigError] = useState<string | null>(null)

  // Payment state
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card")
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await checkoutService.getCart(token)
      setCart(data)
      if (data.customerEmail) {
        setFormData(prev => ({ ...prev, email: data.customerEmail || "" }))
      }
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || "Carrinho não encontrado")
    } finally {
      setLoading(false)
    }
  }, [token])

  // Fetch checkout config
  const fetchConfig = useCallback(async () => {
    setConfigLoading(true)
    setConfigError(null)
    try {
      const config = await checkoutService.getConfig(token)
      setCheckoutConfig(config)
      if (config.availableMethods.length > 0) {
        setSelectedMethod(config.availableMethods[0])
      }
    } catch (err) {
      const apiError = err as ApiError
      setConfigError(apiError.message || "Erro ao carregar configuração de pagamento")
    } finally {
      setConfigLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchCart()
      fetchConfig()
    }
  }, [token, fetchCart, fetchConfig])

  // Check section completion
  useEffect(() => {
    const emailValid = formData.email.includes("@") && formData.email.includes(".")
    const phoneValid = formData.phone.replace(/\D/g, "").length >= 10
    setPersonalInfoComplete(emailValid && phoneValid)
  }, [formData.email, formData.phone])

  useEffect(() => {
    const { zipCode, street, number, neighborhood, city, state } = formData.address
    const isComplete = zipCode.length >= 8 && street.length > 0 && number.length > 0 &&
                       neighborhood.length > 0 && city.length > 0 && state.length === 2
    setAddressComplete(isComplete)
  }, [formData.address])

  // Handle form field changes
  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.replace("address.", "")
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  // Handle card payment success
  const handleCardSuccess = (result: ProcessCardPaymentResponse) => {
    if (result.status === "approved") {
      setPaymentSuccess(true)
      fetchCart()
    } else if (result.status === "pending" || result.status === "in_process") {
      setIsProcessing(true)
    }
  }

  // Handle PIX success
  const handlePixSuccess = () => {
    setPaymentSuccess(true)
    fetchCart()
  }

  // Handle payment error
  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error)
  }

  // Can proceed to payment
  const canProceedToPayment = personalInfoComplete && addressComplete

  // Loading state
  if (loading) {
    return <LoadingState />
  }

  // Error state
  if (error || !cart) {
    return <ErrorState message={error || "Carrinho não encontrado"} onRetry={fetchCart} />
  }

  // Check for payment status from redirect
  if (status === "success" && cart.paymentStatus === "paid") {
    return <SuccessState cart={cart} />
  }

  if (status === "failure") {
    return <FailedState onRetry={() => window.location.href = `/cart/${token}`} />
  }

  // Check if cart is already paid or payment success
  if (cart.paymentStatus === "paid" || paymentSuccess) {
    return <SuccessState cart={cart} />
  }

  // Check if cart is expired
  if (cart.status === "expired") {
    return (
      <ErrorState
        message="Este carrinho expirou. Entre em contato com a loja para mais informações."
      />
    )
  }

  // Check if cart is not ready for checkout
  if (cart.status !== "checkout" && cart.status !== "active") {
    return (
      <ErrorState
        message="Este carrinho não está disponível para pagamento."
      />
    )
  }

  const isLiveActive = cart.status === "active"
  const availableItems = cart.items.filter((item) => !item.waitlisted)

  if (availableItems.length === 0) {
    return (
      <ErrorState message="Nenhum item disponível para pagamento." />
    )
  }

  return (
    <main className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center gap-4">
            {cart.store.logoUrl && (
              <div className="relative h-10 w-10 overflow-hidden rounded-full border">
                <Image src={cart.store.logoUrl} alt={cart.store.name} fill className="object-cover" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-lg font-semibold">{cart.store.name}</h1>
              <p className="text-sm text-muted-foreground">Checkout seguro</p>
            </div>
            {isLiveActive && (
              <Badge variant="destructive" className="animate-pulse">
                🔴 Live em andamento
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          {/* Left Column - Checkout Form */}
          <div className="space-y-6">
            {/* Section 1: Personal Info */}
            <Card>
              <CardContent className="pt-6">
                <SectionHeader
                  icon={User}
                  title="Informações Pessoais"
                  number={1}
                  isComplete={personalInfoComplete}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Telefone <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Address */}
            <Card>
              <CardContent className="pt-6">
                <SectionHeader
                  icon={MapPin}
                  title="Endereço de Entrega"
                  number={2}
                  isComplete={addressComplete}
                />
                <div className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-[140px,1fr]">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">
                        CEP <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="zipCode"
                        placeholder="00000-000"
                        value={formData.address.zipCode}
                        onChange={(e) => handleInputChange("address.zipCode", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="street">
                        Rua <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="street"
                        placeholder="Nome da rua"
                        value={formData.address.street}
                        onChange={(e) => handleInputChange("address.street", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[100px,1fr]">
                    <div className="space-y-2">
                      <Label htmlFor="number">
                        Número <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="number"
                        placeholder="123"
                        value={formData.address.number}
                        onChange={(e) => handleInputChange("address.number", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        placeholder="Apto, bloco, etc."
                        value={formData.address.complement}
                        onChange={(e) => handleInputChange("address.complement", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">
                        Bairro <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="neighborhood"
                        placeholder="Bairro"
                        value={formData.address.neighborhood}
                        onChange={(e) => handleInputChange("address.neighborhood", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        Cidade <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        placeholder="Cidade"
                        value={formData.address.city}
                        onChange={(e) => handleInputChange("address.city", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">
                        Estado <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="state"
                        placeholder="SP"
                        maxLength={2}
                        value={formData.address.state}
                        onChange={(e) => handleInputChange("address.state", e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Payment */}
            <Card>
              <CardContent className="pt-6">
                <SectionHeader
                  icon={CreditCard}
                  title="Pagamento"
                  number={3}
                  isComplete={false}
                />

                {!canProceedToPayment ? (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Preencha as informações acima para continuar
                    </p>
                  </div>
                ) : configLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Carregando opções de pagamento...
                    </span>
                  </div>
                ) : configError ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <p className="mt-2 text-sm text-destructive">{configError}</p>
                    <Button variant="outline" className="mt-4" onClick={fetchConfig}>
                      Tentar novamente
                    </Button>
                  </div>
                ) : checkoutConfig ? (
                  <div className="space-y-6">
                    <CheckoutPaymentMethods
                      selectedMethod={selectedMethod}
                      onMethodChange={setSelectedMethod}
                      availableMethods={checkoutConfig.availableMethods}
                    />

                    <Separator />

                    {selectedMethod === "card" ? (
                      <CheckoutCardForm
                        token={token}
                        provider={checkoutConfig.provider}
                        publicKey={checkoutConfig.publicKey}
                        amount={checkoutConfig.totalAmount}
                        email={formData.email}
                        onSuccess={handleCardSuccess}
                        onError={handlePaymentError}
                      />
                    ) : (
                      <CheckoutPixDisplay
                        token={token}
                        email={formData.email}
                        onSuccess={handlePixSuccess}
                        onError={handlePaymentError}
                      />
                    )}
                  </div>
                ) : null}

                {isProcessing && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <h3 className="mt-4 text-lg font-semibold">Processando pagamento...</h3>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                      Aguarde enquanto confirmamos seu pagamento.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary (Sticky) */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Live notice */}
                {isLiveActive && (
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-950">
                    <p className="text-xs text-orange-800 dark:text-orange-200">
                      <strong>Live em andamento!</strong> Novos itens podem ser adicionados.
                    </p>
                  </div>
                )}

                {/* Items */}
                <div className="divide-y">
                  {availableItems.map((item) => (
                    <CartItemCompact key={item.id} item={item} />
                  ))}
                </div>

                <Separator />

                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({cart.summary.totalItems} itens)
                    </span>
                    <span>{formatCurrency(cart.summary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="text-green-600">Grátis</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(cart.summary.subtotal)}</span>
                  </div>
                </div>

                {/* User info */}
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    Comprando como <span className="font-medium">@{cart.platformHandle}</span>
                  </p>
                </div>

                {/* Security badges */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Pagamento seguro</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
