"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Loader2, ShoppingBag, AlertCircle, CheckCircle, XCircle } from "lucide-react"
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

// Status badge component
function PaymentStatusBadge({ status }: { status: string | null }) {
  if (!status || status === "unpaid") return null

  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    paid: { variant: "default", label: "Pago" },
    pending: { variant: "secondary", label: "Pendente" },
    failed: { variant: "destructive", label: "Falhou" },
    refunded: { variant: "outline", label: "Reembolsado" },
  }

  const config = variants[status] || { variant: "secondary" as const, label: status }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

// Loading state component
function LoadingState() {
  return (
    <main className="min-h-screen bg-surface-secondary">
      <div className="mx-auto max-w-2xl p-4 py-8">
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
      <div className="mx-auto max-w-2xl p-4 py-8">
        <Card>
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
      <div className="mx-auto max-w-2xl p-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Pagamento Confirmado!</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Obrigado pela sua compra. Você receberá um email com os detalhes do pedido.
            </p>
            <div className="mt-6 w-full max-w-sm">
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
      <div className="mx-auto max-w-2xl p-4 py-8">
        <Card>
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

// Cart item component
function CartItem({ item }: { item: PublicCheckoutCart["items"][0] }) {
  return (
    <div className="flex gap-4 py-4">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <h3 className="font-medium">{item.name}</h3>
            {item.keyword && (
              <p className="text-sm text-muted-foreground">Palavra-chave: {item.keyword}</p>
            )}
          </div>
          <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
          {item.waitlisted && (
            <Badge variant="secondary" className="text-xs">
              Lista de espera
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

// Checkout form step
type CheckoutStep = "email" | "payment" | "processing"

// Main checkout page component
export default function CheckoutPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const token = params.token as string
  const status = searchParams.get("status")

  const [cart, setCart] = useState<PublicCheckoutCart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")

  // Checkout config state
  const [checkoutConfig, setCheckoutConfig] = useState<CheckoutConfigResponse | null>(null)
  const [configLoading, setConfigLoading] = useState(false)
  const [configError, setConfigError] = useState<string | null>(null)

  // Payment state
  const [step, setStep] = useState<CheckoutStep>("email")
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card")
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await checkoutService.getCart(token)
      setCart(data)
      if (data.customerEmail) {
        setEmail(data.customerEmail)
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
      // Set default method to first available
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
    }
  }, [token, fetchCart])

  // Poll for cart updates when live is active (every 5 seconds)
  useEffect(() => {
    if (!cart || cart.status !== "active" || cart.paymentStatus === "paid") {
      return
    }

    const interval = setInterval(() => {
      fetchCart()
    }, 5000) // 5 seconds

    return () => clearInterval(interval)
  }, [cart?.status, cart?.paymentStatus, fetchCart])

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      return
    }

    // Fetch checkout config
    await fetchConfig()
    setStep("payment")
  }

  // Handle card payment success
  const handleCardSuccess = (result: ProcessCardPaymentResponse) => {
    if (result.status === "approved") {
      setPaymentSuccess(true)
      fetchCart() // Refresh cart to show updated status
    } else if (result.status === "pending" || result.status === "in_process") {
      // Show processing state
      setStep("processing")
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

  // Reset to email step
  const handleBack = () => {
    setStep("email")
    setCheckoutConfig(null)
  }

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

  // Check if cart is not ready for checkout (allow both 'active' and 'checkout' status)
  if (cart.status !== "checkout" && cart.status !== "active") {
    return (
      <ErrorState
        message="Este carrinho não está disponível para pagamento."
      />
    )
  }

  // Check if live is still ongoing
  const isLiveActive = cart.status === "active"

  // Available items (not waitlisted)
  const availableItems = cart.items.filter((item) => !item.waitlisted)
  const waitlistedItems = cart.items.filter((item) => item.waitlisted)

  return (
    <main className="min-h-screen bg-surface-secondary">
      <div className="mx-auto max-w-2xl p-4 py-8">
        {/* Store header */}
        <div className="mb-6 flex items-center gap-4">
          {cart.store.logoUrl && (
            <div className="relative h-12 w-12 overflow-hidden rounded-full border">
              <Image src={cart.store.logoUrl} alt={cart.store.name} fill className="object-cover" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{cart.store.name}</h1>
            <p className="text-sm text-muted-foreground">{cart.event.title}</p>
          </div>
          {isLiveActive && (
            <Badge variant="destructive" className="animate-pulse">
              🔴 Live em andamento
            </Badge>
          )}
        </div>

        {/* Live active notice */}
        {isLiveActive && (
          <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              <strong>A live ainda está acontecendo!</strong> Seu carrinho pode receber novos itens durante a transmissão.
              Você pode finalizar a compra agora ou aguardar o fim do evento.
            </p>
          </div>
        )}

        {/* Cart items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Seu Carrinho</span>
              <PaymentStatusBadge status={cart.paymentStatus} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Nenhum item disponível para pagamento
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {availableItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            )}

            {/* Waitlisted items */}
            {waitlistedItems.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="rounded-lg bg-muted/50 p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Lista de Espera ({waitlistedItems.length} itens)
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Estes itens serão cobrados separadamente quando estiverem disponíveis.
                  </p>
                  <div className="mt-3 divide-y divide-muted">
                    {waitlistedItems.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Summary */}
            {availableItems.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({cart.summary.totalItems} itens)
                    </span>
                    <span>{formatCurrency(cart.summary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(cart.summary.subtotal)}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Checkout form */}
        {availableItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Finalizar Compra</span>
                {step === "payment" && (
                  <Button variant="ghost" size="sm" onClick={handleBack}>
                    Voltar
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Step 1: Email */}
              {step === "email" && (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email para receber o comprovante</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Continuar
                  </Button>
                </form>
              )}

              {/* Step 2: Payment */}
              {step === "payment" && (
                <div className="space-y-6">
                  {configLoading ? (
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
                    <>
                      {/* Payment method selector */}
                      <CheckoutPaymentMethods
                        selectedMethod={selectedMethod}
                        onMethodChange={setSelectedMethod}
                        availableMethods={checkoutConfig.availableMethods}
                      />

                      <Separator />

                      {/* Payment form based on method */}
                      {selectedMethod === "card" ? (
                        <CheckoutCardForm
                          token={token}
                          provider={checkoutConfig.provider}
                          publicKey={checkoutConfig.publicKey}
                          amount={checkoutConfig.totalAmount}
                          email={email}
                          onSuccess={handleCardSuccess}
                          onError={handlePaymentError}
                        />
                      ) : (
                        <CheckoutPixDisplay
                          token={token}
                          email={email}
                          onSuccess={handlePixSuccess}
                          onError={handlePaymentError}
                        />
                      )}
                    </>
                  ) : null}
                </div>
              )}

              {/* Step 3: Processing */}
              {step === "processing" && (
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
        )}

        {/* User handle */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Comprando como <span className="font-medium">@{cart.platformHandle}</span>
        </p>
      </div>
    </main>
  )
}
